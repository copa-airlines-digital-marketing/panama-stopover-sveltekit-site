// src/routes/api/verify/+server.ts
import { IP_HASH_SALT } from '$env/static/private';
import type { RequestHandler } from './$types';
import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

/** Lee el publicId (token) del query param `id`. */
function readPublicId(request: Request): string | null {
	const url = new URL(request.url);
	const id = url.searchParams.get('id');
	return id && id.trim() ? id.trim() : null;
}

/** Extrae IP del cliente desde headers comunes (X-Forwarded-For / X-Real-IP). */
function getClientIp(request: Request): string | null {
	const xff = request.headers.get('x-forwarded-for');
	if (xff) return xff.split(',')[0].trim();
	const xr = request.headers.get('x-real-ip');
	if (xr) return xr.trim();
	return null;
}

/** Calcula HMAC-SHA256(IP) con la sal `IP_HASH_SALT` si existe. Devuelve Buffer o null. */
function hmacIp(ip: string | null): Buffer | null {
	const salt = IP_HASH_SALT;
	if (!ip || !salt) return null;
	return crypto.createHmac('sha256', salt).update(ip).digest();
}

/** Registra un acceso al endpoint (resultado: ok | not_found | expired | revoked). */
async function logAccess(args: {
	tokenId?: string;
	result: 'ok' | 'not_found' | 'expired' | 'revoked';
	ipHash: Buffer | null;
	userAgent: string | null;
	note?: string | null;
}) {
	try {
		if (!args.tokenId) {
			// No hay tokenId cuando es not_found; guardamos un log minimal si quieres (opcional).
			return;
		}
		await prisma.qrAccessLog.create({
			data: {
				accessTokenId: args.tokenId,
				result: args.result,
				ipHash: args.ipHash ?? undefined,
				userAgent: args.userAgent ?? undefined,
				note: args.note ?? undefined
			}
		});
	} catch {
		// No romper la respuesta por fallos de logging
	}
}

/** Lee datos públicos de la reserva (apoya vistas o SQL directo). */
async function readReservationPublic(reservationId: string) {
	// Usamos SQL sobre la vista v_public_reservations para no depender del schema de Prisma para views
	const rows = await prisma.$queryRaw<
		Array<{
			reservation_id: string;
			reservation_last_names: string | null;
			arrival_pty_at: string | Date;
			departure_pty_at: string | Date;
			phase: 'upcoming' | 'in_progress' | 'completed';
		}>
	>(Prisma.sql`
    SELECT reservation_id, reservation_last_names, arrival_pty_at, departure_pty_at, phase
    FROM v_public_reservations
    WHERE reservation_id = ${reservationId}::uuid
    LIMIT 1
  `);
	return rows[0] ?? null;
}

/** Lee display_traveler (inicial + apellidos) para un travelerId. */
async function readTravelerPublic(travelerId: string) {
	const rows = await prisma.$queryRaw<
		Array<{ traveler_id: string; display_traveler: string | null }>
	>(Prisma.sql`
    SELECT traveler_id, display_traveler
    FROM v_public_travelers
    WHERE traveler_id = ${travelerId}::uuid
    LIMIT 1
  `);
	return rows[0]?.display_traveler ?? null;
}

export const GET: RequestHandler = async (event) => {
	// 1) Validación de input
	const publicId = readPublicId(event.request);
	if (!publicId) {
		return new Response(JSON.stringify({ error: 'missing_id' }), {
			status: 400,
			headers: { 'cache-control': 'no-store' }
		});
	}

	// 2) Búsqueda del token
	const token = await prisma.accessToken.findUnique({
		where: { publicId },
		select: {
			id: true,
			reservationId: true,
			travelerId: true,
			status: true,
			expiresAt: true
		}
	});

	const ip = getClientIp(event.request);
	const ipHash = hmacIp(ip);
	const userAgent = event.request.headers.get('user-agent');

	if (!token) {
		await logAccess({ result: 'not_found', ipHash, userAgent });
		return new Response(JSON.stringify({ error: 'not_found' }), {
			status: 404,
			headers: { 'cache-control': 'no-store' }
		});
	}

	// 3) Estado del token
	const now = new Date();
	const isExpired = token.expiresAt <= now;

	if (token.status === 'revoked') {
		await logAccess({ tokenId: token.id, result: 'revoked', ipHash, userAgent });
		return new Response(JSON.stringify({ error: 'revoked' }), {
			status: 403,
			headers: { 'cache-control': 'no-store' }
		});
	}

	if (isExpired || token.status === 'expired') {
		// (opcional) sincroniza estado en DB si está activo pero ya venció
		if (token.status === 'active') {
			try {
				await prisma.accessToken.update({
					where: { id: token.id },
					data: { status: 'expired' }
				});
			} catch {
				/* ignore */
			}
		}
		await logAccess({ tokenId: token.id, result: 'expired', ipHash, userAgent });
		return new Response(JSON.stringify({ error: 'expired' }), {
			status: 410,
			headers: { 'cache-control': 'no-store' }
		});
	}

	// 4) Carga de datos públicos (reserva + viajero opcional)
	const resPub = await readReservationPublic(token.reservationId);
	if (!resPub) {
		// Caso raro: token apunta a reserva inexistente o vista no disponible
		await logAccess({
			tokenId: token.id,
			result: 'not_found',
			ipHash,
			userAgent,
			note: 'reservation_missing'
		});
		return new Response(JSON.stringify({ error: 'not_found' }), {
			status: 404,
			headers: { 'cache-control': 'no-store' }
		});
	}

	let displayTraveler: string | null = null;
	if (token.travelerId) {
		displayTraveler = await readTravelerPublic(token.travelerId);
	}

	// Formatea fechas como string (seguras para email/UI)
	const arrival =
		typeof resPub.arrival_pty_at === 'string'
			? resPub.arrival_pty_at
			: (resPub.arrival_pty_at as Date).toISOString().slice(0, 10);
	const departure =
		typeof resPub.departure_pty_at === 'string'
			? resPub.departure_pty_at
			: (resPub.departure_pty_at as Date).toISOString().slice(0, 10);

	const responseBody = {
		ok: true,
		token: {
			publicId,
			kind: token.travelerId ? ('traveler' as const) : ('group' as const),
			status: token.status,
			expiresAt: token.expiresAt.toISOString()
		},
		reservation: {
			reservationId: token.reservationId,
			reservationLastNames: resPub.reservation_last_names,
			arrivalPtyAt: arrival,
			departurePtyAt: departure,
			phase: resPub.phase
		},
		traveler: token.travelerId
			? {
					travelerId: token.travelerId,
					displayTraveler: displayTraveler
				}
			: null
	};

	await logAccess({ tokenId: token.id, result: 'ok', ipHash, userAgent });
	return new Response(JSON.stringify(responseBody), {
		status: 200,
		headers: { 'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8' }
	});
};
