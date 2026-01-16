// ⚠️ ACCESS TOKEN CREATION - DISABLED FOR NOW
// This endpoint creates access tokens for the verification page
// Currently disabled to avoid build errors in Cloudflare Pages
// Re-enable when: pnpm build:local

import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async (_event) => {
	return new Response(
		JSON.stringify({ error: 'Token creation is currently disabled' }),
		{ status: 501, headers: { 'content-type': 'application/json' } }
	);
};
