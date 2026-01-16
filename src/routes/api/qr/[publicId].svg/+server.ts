import { BASE_URL } from '$env/static/private';
import { prisma } from '$lib/infrastructure/prisma/client';
import QRCode from 'qrcode';

export const GET = async ({ params, url }) => {
	const { publicId } = params;

	const token = await prisma.accessToken.findUnique({ where: { publicId } });

	if (!publicId || !token) return new Response('not found', { status: 404 });

	const base = BASE_URL ?? url.origin;
	const verifyUrl = `${base}/verify?id=${encodeURIComponent(publicId)}`;
	const svg = await QRCode.toString(verifyUrl, {
		type: 'svg',
		errorCorrectionLevel: 'M',
		margin: 1
	});

	return new Response(svg, {
		headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'no-store' }
	});
};
