/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	presets: [require('cmds-tailwind-styles')],
	theme: {
		extend: {}
	},

	plugins: [require('@tailwindcss/typography')]
};
