/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	presets: [require('cmds-tailwind-styles')],
	theme: {
		extend: {
      fontFamily: {
        jakarta: ['Jakarta', 'ui-sans-serif', 'system-ui']
      }
    }
	},

	plugins: [require('@tailwindcss/typography')]
};
