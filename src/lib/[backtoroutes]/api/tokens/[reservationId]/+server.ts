import { prisma } from '$lib/infrastructure/prisma/client';
import { AccessTokenStatus } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid';
import { BASE_URL } from '$env/static/private';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);

export const POST: RequestHandler = async ({ params, url }) => {
	const { reservationId } = params;

	const travelerId = url.searchParams.get('travelerId') ?? undefined;

	const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });

	if (!reservationId || !reservation)
		return new Response(JSON.stringify({ error: 'reservation_not_found' }), { status: 404 });

	// TTL: salida + 7 días (America/Panama la maneja tu hosting/DB; aquí sumamos días)

	const expiresAt = new Date(reservation.departurePtyAt);
	expiresAt.setDate(expiresAt.getDate() + 7);

	const token = await prisma.accessToken.create({
		data: {
			publicId: nanoid(),
			reservationId,
			travelerId,
			expiresAt,
			status: AccessTokenStatus.active
		}
	});

	const base = BASE_URL ?? url.origin;
	const verifyUrl = `${base}/api/verify?id=${encodeURIComponent(token.publicId)}`;
	const qrUrl = `${base}/api/qr/${encodeURIComponent(token.publicId)}.svg`;

	return new Response(
		JSON.stringify({
			token: { id: token.id, publicId: token.publicId, expiresAt: token.expiresAt },
			verifyUrl,
			qrUrl
		}),
		{ status: 201 }
	);
};
