import type { RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/infrastructure/prisma/client';
import QRCode from 'qrcode';
import { BASE_URL } from '$env/static/private';

type EC = 'L' | 'M' | 'Q' | 'H';
const EC_LEVELS: ReadonlySet<EC> = new Set(['L', 'M', 'Q', 'H']);

function clampInt(v: string | null, d = 512, min = 240, max = 2048): number {
	const n = v ? parseInt(v, 10) : NaN;
	return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : d;
}
function parseEC(v: string | null): EC {
	const e = (v ?? 'Q').toUpperCase();
	return (EC_LEVELS.has(e as EC) ? e : 'Q') as EC;
}

// ✅ Convierte a Uint8Array (acepta Buffer/ArrayBuffer/ArrayBufferLike)
function toU8(x: unknown): Uint8Array {
	if (x instanceof Uint8Array) return x;
	if (x instanceof ArrayBuffer) return new Uint8Array(x);
	if (typeof Buffer !== 'undefined' && x instanceof Buffer) return x as unknown as Uint8Array;
	if (x && typeof (x as ArrayBufferLike).byteLength === 'number') {
		return new Uint8Array(x as ArrayBufferLike);
	}
	throw new TypeError('Unsupported binary type');
}

// ✅ Convierte un Uint8Array a ArrayBuffer “limpio” (sin offset/length raros)
function u8ToArrayBuffer(u8: Uint8Array): ArrayBuffer {
	// Crea un ArrayBuffer "puro" y copia los bytes,
	// evitando SharedArrayBuffer y offsets.
	const ab = new ArrayBuffer(u8.byteLength);
	new Uint8Array(ab).set(u8);
	return ab;
}

export async function qrImage(
	event: RequestEvent,
	format: 'jpg' | 'png' | 'webp'
): Promise<Response> {
	const reqUrl = new URL(event.request.url);
	const publicId = event.params.publicId;

	if (!publicId) return new Response('missing id', { status: 400 });

	const token = await prisma.accessToken.findUnique({ where: { publicId } });
	if (!token) return new Response('not found', { status: 404 });

	const base = BASE_URL ?? `${reqUrl.protocol}//${reqUrl.host}`;
	const verifyUrl = `${base}/verify?id=${encodeURIComponent(publicId)}`;

	const w = clampInt(reqUrl.searchParams.get('w'), 600, 240, 2048);
	const m = clampInt(reqUrl.searchParams.get('m'), 2, 0, 8);
	const ec = parseEC(reqUrl.searchParams.get('ec'));

	// PNG base del QR
	const pngU8 = toU8(
		await QRCode.toBuffer(verifyUrl, {
			type: 'png',
			width: w,
			margin: m,
			errorCorrectionLevel: ec,
			color: { dark: '#000000', light: '#FFFFFF' }
		})
	);

	if (format === 'png') {
		return new Response(u8ToArrayBuffer(pngU8), {
			headers: { 'content-type': 'image/png', 'cache-control': 'no-store' }
		});
	}

	// Convertir a JPG/WEBP con sharp
	try {
		const sharpMod = await import('sharp');
		const sharp = sharpMod.default;

		if (format === 'jpg') {
			const jpgBuf = await sharp(Buffer.from(pngU8))
				.jpeg({ quality: 95, chromaSubsampling: '4:4:4', mozjpeg: true })
				.toBuffer();
			const jpgU8 = toU8(jpgBuf);
			return new Response(u8ToArrayBuffer(jpgU8), {
				headers: { 'content-type': 'image/jpeg', 'cache-control': 'no-store' }
			});
		} else {
			const webpBuf = await sharp(Buffer.from(pngU8)).webp({ lossless: true }).toBuffer();
			const webpU8 = toU8(webpBuf);
			return new Response(u8ToArrayBuffer(webpU8), {
				headers: { 'content-type': 'image/webp', 'cache-control': 'no-store' }
			});
		}
	} catch {
		// Fallback sin sharp → PNG
		return new Response(u8ToArrayBuffer(pngU8), {
			headers: {
				'content-type': 'image/png',
				'cache-control': 'no-store',
				'x-fallback': 'sharp-missing'
			}
		});
	}
}
