// ⚠️ VERIFICATION PAGE - DISABLED FOR NOW
// This page allows users to verify their reservation and view stopover details
// Currently disabled to avoid build errors in Cloudflare Pages
// Re-enable when: pnpm build:local

import type { PageServerLoad } from '../[...path]/$types';

/**
 * Verification page loader
 * Currently disabled - returns placeholder data
 */
export const load: PageServerLoad = async (_event) => {
	// Return placeholder response
	return {
		ok: false,
		error: 'Verification functionality is currently disabled',
		status: 503
	};
};
