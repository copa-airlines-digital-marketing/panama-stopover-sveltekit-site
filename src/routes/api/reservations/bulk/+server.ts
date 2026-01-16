// ⚠️ BULK RESERVATION IMPORT - DISABLED FOR NOW
// This endpoint handles bulk reservation imports with token generation
// Currently disabled to avoid build errors in Cloudflare Pages
// Re-enable when: pnpm build:local

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (_event) => {
	return new Response(
		JSON.stringify({ error: 'Bulk reservation import is currently disabled' }),
		{ status: 501, headers: { 'content-type': 'application/json' } }
	);
};
