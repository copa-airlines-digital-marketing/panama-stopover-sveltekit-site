<script lang="ts">
	import type { HotelSchema } from '$lib/directus/hotels';
	import { Pre } from '$lib/components/testing';
	import { getTypography } from '$lib/components/ui/foundations/typography';
	import { Hero } from '$lib/components/site/items';
	import { page } from '$app/stores';

	export let stopover_hotels: HotelSchema;

	const {
		main_image,
		promo_code,
		promo_discount_amount,
		promo_discount_percent,
		phone_number,
		booking_email,
		supported_languages,
		includes,
		stars,
		location,
		gallery,
		translations
	} = stopover_hotels;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { name, description, promo_name, promo_description }
	} = currrentTranslation;
</script>

<Hero {main_image} {name}></Hero>
<div class="container mx-auto h-20 bg-backgound-lightblue py-2">Galeria</div>
<div class="container mx-auto my-8 space-y-4">
	<p class={getTypography('body-large', 'body')}>
		{description}
	</p>
	<div class="rounded-2xl bg-secondary shadow-sm">
		{promo_name}
		{@html promo_description}
		{promo_code}
	</div>
</div>
<Pre name="Hotels" value={stopover_hotels}></Pre>
