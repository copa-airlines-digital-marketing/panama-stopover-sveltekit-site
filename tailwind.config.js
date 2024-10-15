/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	presets: [require('cmds-tailwind-styles')],
	theme: {
		extend: {
      fontFamily: {
        jakarta: ['Jakarta', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        'stopover-gastronomy': '#FF8400',
        'stopover-canal': '#282DFF',
        'stopover-nature': '#4A9A00',
        'stopover-accent': '#FFDC00',
        'stopover-culture': '#FF0019',
      }
    }
	},

	plugins: [require('@tailwindcss/typography')]
};
