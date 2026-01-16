import { json } from '@sveltejs/kit';

// Prerender this endpoint for static site generation
// The timestamp will be set at build time (not dynamic)
export const prerender = true;

export const GET = async () => {
	return json(
		{
			status: 'ok',
			timestamp: new Date().toISOString()
		},
		{
			status: 200
		}
	);
};
