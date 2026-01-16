// ⚠️ QR IMAGE GENERATION - DISABLED FOR NOW
// This functionality is currently disabled to avoid build errors in Cloudflare Pages
// Re-enable when ready by uncommenting and testing locally with: pnpm build:local

// Stub implementation
export async function qrImage(
	_event: any,
	_format: 'jpg' | 'png' | 'webp'
): Promise<Response> {
	return new Response(
		JSON.stringify({ error: 'QR functionality is currently disabled' }),
		{ status: 501, headers: { 'content-type': 'application/json' } }
	);
}
