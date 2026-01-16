import { IP_HASH_SALT } from '$env/static/private';
import { Prisma, type AccessTokenStatus, PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

export type VerifyResult =
	| { kind: 'not_found' }
	| { kind: 'revoked' }
	| { kind: 'expired' }
	| {
			kind: 'ok';
			token: {
				publicId: string;
				status: AccessTokenStatus;
				expiresAt: string;
				type: 'group' | 'traveler';
				id: string;
				reservationId: string;
				travelerId?: string;
			};
			reservation: {
				reservationId: string;
				reservationLastNames: string | null;
				arrivalPtyAt: string; // YYYY-MM-DD
				departurePtyAt: string; // YYYY-MM-DD
				phase: 'upcoming' | 'in_progress' | 'completed';
			};
			traveler?: {
				travelerId: string;
				displayTraveler: string | null;
			};
	  };

export function readPublicIdFromRequest(request: Request): string | null {
	const id = new URL(request.url).searchParams.get('id');
	return id && id.trim() ? id.trim() : null;
}

export function getClientIpFromHeaders(headers: Headers): string | null {
	const xff = headers.get('x-forwarded-for');

	if (xff) return xff.split(',')[0].trim();

	const xr = headers.get('x-real-ip');

	if (xr) return xr.trim();

	return null;
}

export function hashIp(ip: string | null): Buffer | null {
	const salt = IP_HASH_SALT;

	if (!ip || !salt) return null;

	return crypto.createHmac('sha256', salt).update(ip).digest();
}

export async function logVerifyAccess(
	prisma: PrismaClient,
	args: {
		tokenId?: string;
		result: 'ok' | 'not_found' | 'expired' | 'revoked';
		ipHash: Buffer | null;
		userAgent: string | null;
		note?: string | null;
	}
) {
	try {
		if (!args.tokenId) return;
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
		/* no-op: el loggin no rompe el UI*/
	}
}

async function readReservationPublic(prisma: PrismaClient, reservationId: string) {
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

	const row = rows[0];

	if (!row) return null;

	const toYmd = (v: string | Date) => (typeof v === 'string' ? v : v.toISOString().slice(0, 10));

	return {
		reservationId: row.reservation_id,
		reservationLastNames: row.reservation_last_names,
		arrivalPtyAt: toYmd(row.arrival_pty_at),
		departurePtyAt: toYmd(row.departure_pty_at),
		phase: row.phase
	} as const;
}

async function readTravelerPublic(prisma: PrismaClient, travelerId: string) {
	const rows = await prisma.$queryRaw<
		Array<{
			traveler_id: string;
			display_traveler: string | null;
		}>
	>(Prisma.sql`
    SElECT traveler_id, display_traveler
    FROM v_public_travelers
    WHERE traveler_id = ${travelerId}::uuid
    LIMIT 1  
  `);

	return rows[0]?.display_traveler ?? null;
}

/**
 * Realiza la verificación completa y devuelve un objeto listo para la UI.
 * - No lanza errores: siempre retorna un discriminado `VerifyResult`.
 */

export async function verifyByPublicId(
	prisma: PrismaClient,
	publicId: string
): Promise<VerifyResult> {
	const token = await prisma.accessToken.findUnique({
		where: { publicId },
		select: { id: true, reservationId: true, travelerId: true, status: true, expiresAt: true }
	});

	if (!token) return { kind: 'not_found' };

	if (token.status === 'revoked') return { kind: 'revoked' };

	const now = new Date();

	const isExpired = token.expiresAt <= now;

	if (isExpired || token.status === 'expired') {
		if (token.status === 'active') {
			try {
				await prisma.accessToken.update({
					where: { id: token.id },
					data: {
						status: 'expired'
					}
				});
			} catch {
				/** */
			}
		}
		return { kind: 'expired' };
	}

	const reservation = await readReservationPublic(prisma, token.reservationId);
	if (!reservation) return { kind: 'not_found' };

	const displayTraveler = token.travelerId
		? await readTravelerPublic(prisma, token.travelerId)
		: null;

	return {
		kind: 'ok',
		token: {
			id: token.id,
			reservationId: token.reservationId,
			travelerId: token.travelerId ?? undefined,
			publicId,
			status: token.status,
			expiresAt: token.expiresAt.toISOString(),
			type: token.travelerId ? 'traveler' : 'group'
		},
		reservation,
		traveler: token.travelerId ? { travelerId: token.travelerId, displayTraveler } : undefined
	};
}
