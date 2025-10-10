import { PrismaClient } from '@prisma/client';
import type { PageServerLoad } from '../[...path]/$types';
import {
	getClientIpFromHeaders,
	hashIp,
	logVerifyAccess,
	readPublicIdFromRequest,
	verifyByPublicId
} from '$lib/server/verify-helpers';

const prisma = new PrismaClient();

/**
 * Verificación directa de la página:
 * - Lee ?id=<publicId>
 * - Verifica token y obitine datos públicos (reserva / viajero)
 * - Registra log de acceso
 * - Devuelve data lista para renderizar (sin JSON API separado)
 */

export const load: PageServerLoad = async (event) => {
	const publicId = readPublicIdFromRequest(event.request);
	if (!publicId) {
		return { ok: false as const, error: 'missing_id' as const, status: 400 as const };
	}

	const ip = getClientIpFromHeaders(event.request.headers);
	const ipHash = hashIp(ip);
	const userAgent = event.request.headers.get('user-agent');

	const result = await verifyByPublicId(prisma, publicId);

	// Se escriben los 3 para que TS no de problemas.

	if (result.kind === 'not_found') {
		await logVerifyAccess(prisma, { result: 'not_found', ipHash, userAgent });
		return { ok: false as const, error: 'not_found' as const, status: 404 as const };
	}
	if (result.kind === 'revoked') {
		// Nota: mantener 403 para diferenciar
		await logVerifyAccess(prisma, { tokenId: undefined, result: 'revoked', ipHash, userAgent });
		return { ok: false as const, error: 'revoked' as const, status: 403 as const };
	}
	if (result.kind === 'expired') {
		await logVerifyAccess(prisma, { tokenId: undefined, result: 'expired', ipHash, userAgent });
		return { ok: false as const, error: 'expired' as const, status: 410 as const };
	}
	// OK
	await logVerifyAccess(prisma, {
		tokenId: result.token?.id,
		result: 'ok',
		ipHash,
		userAgent
	});

	return {
		ok: true as const,
		status: 200 as const,
		token: result.token,
		reservation: result.reservation,
		traveler: result.traveler ?? null
	};
};
