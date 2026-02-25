import { json } from '@sveltejs/kit';

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
