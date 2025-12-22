import { BASE_URL } from '$env/static/private';
import type { RequestHandler } from './$types';
import { PrismaClient, AccessTokenStatus, Prisma } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);

/** ---------- Tipos del request ---------- */

type TravelerInput = {
	firstName: string;
	lastName1: string;
	lastName2?: string | null;
};

type QrOptions = {
	width?: number;
	margin?: number;
	ec?: 'L' | 'M' | 'Q' | 'H';
	formats?: Array<'jpg' | 'png' | 'webp'>;
};

type ReservationInput = {
	pnrLocator: string;
	arrivalPtyAt: string;
	departurePtyAt: string;
	travelers: TravelerInput[];
	tokenMode?: 'group' | 'per_traveler' | 'both';
	revokePreviousTokens?: boolean;
	replaceTravelers?: boolean;
	qrOptions?: QrOptions;
};

type BulkPayload = { items: ReservationInput[] };

/** ---------- Helpers de dominio ---------- */

/** Suma días a una fecha y devuelve una NUEVA instancia. */
function addDays(date: Date, days: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

/** Parsea 'YYYY-MM-DD' a Date (UTC a medianoche). Devuelve null si es inválida. */
function parseDateOnly(yyyyMmDd: string | undefined): Date | null {
	if (!yyyyMmDd) return null;
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
	if (!m) return null;
	const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
	return isNaN(d.getTime()) ? null : d;
}

/** Valida un item del payload. Devuelve string de error o null si OK. */
function validateReservationInput(input: ReservationInput): string | null {
	if (!input?.pnrLocator?.trim()) return 'missing_pnr_locator';
	const arrival = parseDateOnly(input.arrivalPtyAt);
	const departure = parseDateOnly(input.departurePtyAt);
	if (!arrival || !departure) return 'invalid_dates';
	if (departure < arrival) return 'invalid_dates_range';
	if (!Array.isArray(input.travelers) || input.travelers.length === 0) return 'missing_travelers';
	return null;
}

/** Calcula la expiración = departure + 7 días (acuerdo). */
function computeTokenExpiry(departureDate: Date): Date {
	return addDays(departureDate, 7);
}

/** Genera un publicId único verificando colisiones. */
async function generateUniquePublicId(
	tx: Prisma.TransactionClient,
	maxRetries = 3
): Promise<string> {
	for (let i = 0; i < maxRetries; i++) {
		const id = nanoid();
		const exists = await tx.accessToken.findUnique({ where: { publicId: id } });
		if (!exists) return id;
	}
	throw new Error('could_not_generate_unique_public_id');
}

/** Construye verifyUrl, qrSvgUrl y qrImageUrls para un publicId. */
function buildQrUrls(publicId: string, baseUrl: string, opts?: QrOptions) {
	const width = Math.max(240, Math.min(2048, opts?.width ?? 600));
	const margin = Math.max(0, Math.min(8, opts?.margin ?? 2));
	const ec = opts?.ec ?? 'Q';
	const query = `?w=${width}&m=${margin}&ec=${encodeURIComponent(ec)}`;

	const formats = (opts?.formats?.length ? opts.formats : ['jpg', 'png', 'webp']) as Array<
		'jpg' | 'png' | 'webp'
	>;

	const verifyUrl = `${baseUrl}/api/verify?id=${encodeURIComponent(publicId)}`;
	const qrSvgUrl = `${baseUrl}/api/qr/${encodeURIComponent(publicId)}.svg`;
	const qrImageUrls: Partial<Record<'jpg' | 'png' | 'webp', string>> = {};
	for (const fmt of formats) {
		qrImageUrls[fmt] = `${baseUrl}/api/qr/${encodeURIComponent(publicId)}.${fmt}${query}`;
	}
	return { verifyUrl, qrSvgUrl, qrImageUrls };
}

/** Crea/actualiza la reserva por PNR y devuelve el registro. */
async function upsertReservationByPNR(tx: Prisma.TransactionClient, input: ReservationInput) {
	const arrival = parseDateOnly(input.arrivalPtyAt)!;
	const departure = parseDateOnly(input.departurePtyAt)!;

	return tx.reservation.upsert({
		where: { pnrLocator: input.pnrLocator },
		update: { arrivalPtyAt: arrival, departurePtyAt: departure },
		create: { pnrLocator: input.pnrLocator, arrivalPtyAt: arrival, departurePtyAt: departure }
	});
}

/** Normaliza un viajero a una clave estable (para dedupe lógico). */
function travelerKey(t: { firstName: string; lastName1: string; lastName2?: string | null }) {
	const norm = (s?: string | null) => (s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
	return `${norm(t.firstName)}|${norm(t.lastName1)}|${norm(t.lastName2)}`;
}

/**
 * Sincroniza viajeros de una reserva:
 * - Si replaceExisting=true → borra todos y crea los enviados.
 * - Si replaceExisting=false → agrega SOLO los viajeros nuevos
 *   (evita duplicados comparando contra los existentes y entre el propio payload).
 */
async function syncTravelers(
	tx: Prisma.TransactionClient,
	reservationId: string,
	travelers: TravelerInput[],
	replaceExisting: boolean
) {
	if (replaceExisting) {
		await tx.traveler.deleteMany({ where: { reservationId } });
	}

	const payloadUnique = new Map<string, TravelerInput>();
	for (const t of travelers) {
		payloadUnique.set(travelerKey(t), t);
	}
	const toConsider = Array.from(payloadUnique.values());
	if (toConsider.length === 0) return;

	if (replaceExisting) {
		await tx.traveler.createMany({
			data: toConsider.map((t) => ({
				reservationId,
				firstName: t.firstName,
				lastName1: t.lastName1,
				lastName2: t.lastName2 ?? null
			}))
		});
		return;
	}

	// Cuando NO reemplazamos, traer existentes y filtrar nuevos
	const existing = await tx.traveler.findMany({
		where: { reservationId },
		select: { firstName: true, lastName1: true, lastName2: true }
	});
	const existingKeys = new Set(existing.map(travelerKey));

	const toInsert = toConsider.filter((t) => !existingKeys.has(travelerKey(t)));
	if (toInsert.length === 0) return;

	await tx.traveler.createMany({
		data: toInsert.map((t) => ({
			reservationId,
			firstName: t.firstName,
			lastName1: t.lastName1,
			lastName2: t.lastName2 ?? null
		}))
	});
}

/** Revoca tokens activos previos de la reserva (si aplica). */
async function revokeActiveTokens(
	tx: Prisma.TransactionClient,
	reservationId: string,
	shouldRevoke: boolean
) {
	if (!shouldRevoke) return;
	await tx.accessToken.updateMany({
		where: { reservationId, status: 'active' },
		data: { status: AccessTokenStatus.revoked }
	});
}

/** Emite tokens segun modo (group/per_traveler/both) y devuelve payloads con URLs. */
/**
 * Emite tokens y devuelve payloads con URLs.
 * - Grupo: registro único.
 * - Por viajero: batch con createMany y luego fetch por publicId (para obtener ids).
 */
async function emitTokensWithUrls(
	tx: Prisma.TransactionClient,
	reservationId: string,
	baseUrl: string,
	tokenMode: 'group' | 'per_traveler' | 'both',
	expiresAt: Date,
	qrOptions?: QrOptions
) {
	type TokenOut = {
		kind: 'group' | 'traveler';
		travelerId?: string;
		tokenId: string;
		publicId: string;
		expiresAt: string;
		verifyUrl: string;
		qrSvgUrl: string;
		qrImageUrls: Partial<Record<'jpg' | 'png' | 'webp', string>>;
	};

	const outputs: TokenOut[] = [];
	const needGroup = tokenMode === 'group' || tokenMode === 'both';
	const needPerTraveler = tokenMode === 'per_traveler' || tokenMode === 'both';

	// --- Token de grupo (uno a uno) ---
	if (needGroup) {
		const publicId = await generateUniquePublicId(tx);
		const token = await tx.accessToken.create({
			data: { publicId, reservationId, expiresAt, status: AccessTokenStatus.active }
		});
		const urls = buildQrUrls(token.publicId, baseUrl, qrOptions);
		outputs.push({
			kind: 'group',
			tokenId: token.id,
			publicId: token.publicId,
			expiresAt: token.expiresAt.toISOString(),
			...urls
		});
	}

	// --- Tokens por viajero (batch) ---
	if (needPerTraveler) {
		const travelers = await tx.traveler.findMany({
			where: { reservationId },
			select: { id: true }
		});
		if (travelers.length > 0) {
			const publicIds: string[] = [];
			for (let i = 0; i < travelers.length; i++) {
				let pid: string;
				let retry = 0;
				do {
					pid = await generateUniquePublicId(tx);
				} while (publicIds.includes(pid) && ++retry < 2);
				publicIds.push(pid);
			}

			await tx.accessToken.createMany({
				data: travelers.map((tr, idx) => ({
					publicId: publicIds[idx],
					reservationId,
					travelerId: tr.id,
					expiresAt,
					status: AccessTokenStatus.active
				})),
				skipDuplicates: true
			});

			const created = await tx.accessToken.findMany({
				where: { publicId: { in: publicIds } },
				select: { id: true, publicId: true, travelerId: true, expiresAt: true }
			});

			for (const row of created) {
				const urls = buildQrUrls(row.publicId, baseUrl, qrOptions);
				outputs.push({
					kind: 'traveler',
					travelerId: row.travelerId ?? undefined,
					tokenId: row.id,
					publicId: row.publicId,
					expiresAt: row.expiresAt.toISOString(),
					...urls
				});
			}
		}
	}

	return outputs;
}

/** Procesa un item completo dentro de una transacción. */
async function processReservationItem(input: ReservationInput, baseUrl: string) {
	const validationError = validateReservationInput(input);
	if (validationError) return { status: 'error', error: validationError } as const;

	try {
		const result = await prisma.$transaction(async (tx) => {
			const reservation = await upsertReservationByPNR(tx, input);

			await syncTravelers(tx, reservation.id, input.travelers, !!input.replaceTravelers);

			await revokeActiveTokens(tx, reservation.id, !!input.revokePreviousTokens);

			const expiresAt = computeTokenExpiry(new Date(reservation.departurePtyAt));

			const tokens = await emitTokensWithUrls(
				tx,
				reservation.id,
				baseUrl,
				input.tokenMode ?? 'group',
				expiresAt,
				input.qrOptions
			);

			return {
				status: 'ok' as const,
				reservationId: reservation.id,
				pnrLocator: reservation.pnrLocator,
				arrivalPtyAt: reservation.arrivalPtyAt,
				departurePtyAt: reservation.departurePtyAt,
				tokens
			};
		});

		return result;
	} catch (e: any) {
		return { status: 'error', error: e?.message ?? 'internal_error' } as const;
	}
}

/** ---------- Handler principal (mínima indentación) ---------- */

export const POST: RequestHandler = async (event) => {
	let parsed: BulkPayload | null = null;

	try {
		parsed = await event.request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 });
	}

	if (!parsed?.items?.length) {
		return new Response(JSON.stringify({ error: 'empty_items' }), { status: 400 });
	}

	const baseUrl = BASE_URL ?? event.url.origin;

	const results = await Promise.all(
		parsed.items.map(async (item, index) => {
			const outcome = await processReservationItem(item, baseUrl);
			return { index, ...outcome };
		})
	);

	return new Response(JSON.stringify({ results }), { status: 200 });
};
