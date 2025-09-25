// src/routes/api/reservations/bulk/+server.ts
import { BASE_URL } from '$env/static/private';
import type { RequestHandler } from './$types';
import { PrismaClient, AccessTokenStatus } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);

type TravelerInput = {
	firstName: string;
	lastName1: string;
	lastName2?: string | null;
};

type ReservationInput = {
	pnrLocator?: string | null; // opcional, si lo usas para upsert
	arrivalPtyAt: string; // 'YYYY-MM-DD'
	departurePtyAt: string; // 'YYYY-MM-DD'
	travelers: TravelerInput[]; // viajeros de la reserva
	tokenMode?: 'group' | 'per_traveler' | 'both'; // default 'group'
	revokePreviousTokens?: boolean; // default false
	replaceTravelers?: boolean; // default false (append)
};

type BulkPayload = {
	upsertByPNR?: boolean; // default true si viene pnrLocator
	items: ReservationInput[];
};

function addDays(date: Date, days: number) {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

async function generatePublicId(tx: PrismaClient, maxRetries = 3): Promise<string> {
	for (let i = 0; i < maxRetries; i++) {
		const id = nanoid();
		const exists = await tx.accessToken.findUnique({ where: { publicId: id } });
		if (!exists) return id;
	}
	throw new Error('could_not_generate_unique_public_id');
}

export const POST: RequestHandler = async (event) => {
	let payload: BulkPayload;
	try {
		payload = await event.request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 });
	}

	if (!payload?.items?.length) {
		return new Response(JSON.stringify({ error: 'empty_items' }), { status: 400 });
	}

	const upsertByPNRDefault = payload.upsertByPNR ?? true;
	const base = BASE_URL ?? event.url.origin;

	const results = [];
	for (let idx = 0; idx < payload.items.length; idx++) {
		const item = payload.items[idx];

		// Validación mínima
		if (
			!item.arrivalPtyAt ||
			!item.departurePtyAt ||
			!Array.isArray(item.travelers) ||
			item.travelers.length === 0
		) {
			results.push({ index: idx, status: 'error', error: 'missing_fields' });
			continue;
		}

		const tokenMode = item.tokenMode ?? 'group';
		const revokePrev = item.revokePreviousTokens ?? false;
		const replaceTravelers = item.replaceTravelers ?? false;
		const useUpsert = upsertByPNRDefault && !!item.pnrLocator;

		try {
			const out = await prisma.$transaction(async (tx) => {
				// 1) Reserva (create / upsert por PNR)
				const reservation = useUpsert
					? await tx.reservation.upsert({
							where: { pnrLocator: item.pnrLocator! },
							update: {
								arrivalPtyAt: new Date(item.arrivalPtyAt),
								departurePtyAt: new Date(item.departurePtyAt)
							},
							create: {
								pnrLocator: item.pnrLocator!,
								arrivalPtyAt: new Date(item.arrivalPtyAt),
								departurePtyAt: new Date(item.departurePtyAt)
							}
						})
					: await tx.reservation.create({
							data: {
								pnrLocator: item.pnrLocator ?? undefined,
								arrivalPtyAt: new Date(item.arrivalPtyAt),
								departurePtyAt: new Date(item.departurePtyAt)
							}
						});

				// 2) Viajeros (replace o append)
				if (replaceTravelers) {
					await tx.traveler.deleteMany({ where: { reservationId: reservation.id } });
				}
				if (item.travelers.length > 0) {
					await tx.traveler.createMany({
						data: item.travelers.map((t) => ({
							reservationId: reservation.id,
							firstName: t.firstName,
							lastName1: t.lastName1,
							lastName2: t.lastName2 ?? null
						})),
						skipDuplicates: false
					});
				}

				// 3) Revocar tokens previos si se indica
				if (revokePrev) {
					await tx.accessToken.updateMany({
						where: { reservationId: reservation.id, status: 'active' },
						data: { status: AccessTokenStatus.revoked }
					});
				}

				// TTL = departure + 7 días
				const dep = new Date(reservation.departurePtyAt);
				const expiresAt = addDays(dep, 7);

				// 4) Emitir tokens
				const tokenResponses: {
					kind: 'group' | 'traveler';
					travelerId?: string;
					tokenId: string;
					publicId: string;
					expiresAt: string;
					verifyUrl: string;
					qrUrl: string;
				}[] = [];

				// Token de grupo
				if (tokenMode === 'group' || tokenMode === 'both') {
					const publicId = await generatePublicId(tx);
					const token = await tx.accessToken.create({
						data: {
							publicId,
							reservationId: reservation.id,
							expiresAt,
							status: AccessTokenStatus.active
						}
					});
					tokenResponses.push({
						kind: 'group',
						tokenId: token.id,
						publicId: token.publicId,
						expiresAt: token.expiresAt.toISOString(),
						verifyUrl: `${base}/api/verify?id=${encodeURIComponent(token.publicId)}`,
						qrUrl: `${base}/api/qr/${encodeURIComponent(token.publicId)}.svg`
					});
				}

				// Tokens por viajero
				if (tokenMode === 'per_traveler' || tokenMode === 'both') {
					const travelers = await tx.traveler.findMany({
						where: { reservationId: reservation.id },
						select: { id: true }
					});
					for (const tr of travelers) {
						const publicId = await generatePublicId(tx);
						const token = await tx.accessToken.create({
							data: {
								publicId,
								reservationId: reservation.id,
								travelerId: tr.id,
								expiresAt,
								status: AccessTokenStatus.active
							}
						});
						tokenResponses.push({
							kind: 'traveler',
							travelerId: tr.id,
							tokenId: token.id,
							publicId: token.publicId,
							expiresAt: token.expiresAt.toISOString(),
							verifyUrl: `${base}/api/verify?id=${encodeURIComponent(token.publicId)}`,
							qrUrl: `${base}/api/qr/${encodeURIComponent(token.publicId)}.svg`
						});
					}
				}

				return {
					reservationId: reservation.id,
					pnrLocator: reservation.pnrLocator,
					arrivalPtyAt: reservation.arrivalPtyAt,
					departurePtyAt: reservation.departurePtyAt,
					tokens: tokenResponses
				};
			});

			results.push({ index: idx, status: 'ok', ...out });
		} catch (e: any) {
			results.push({ index: idx, status: 'error', error: e?.message ?? 'internal_error' });
		}
	}

	return new Response(JSON.stringify({ results }), { status: 200 });
};
