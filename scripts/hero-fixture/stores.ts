import { writable } from 'svelte/store';
export const page = writable({
	data: {},
	params: { locale: 'es' },
	url: new URL('https://example.test/es')
});
export const navigating = writable(null);
export const updated = { subscribe: writable(false).subscribe, check: async () => false };
