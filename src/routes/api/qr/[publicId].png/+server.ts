// ⚠️ QR PNG ENDPOINT - DISABLED FOR NOW
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (_event) => {
	return new Response(
		JSON.stringify({ error: 'QR functionality is currently disabled' }),
		{ status: 501, headers: { 'content-type': 'application/json' } }
	);
};
