<script lang="ts">
	import { PromoCard } from '$lib/components/ui/patterns/cards/promo';
	import { SVG } from '$lib/components/ui/foundations/icon';
	import { page } from '$app/stores';
	import { isHotelSchema, type HotelSchema } from '$lib/directus/hotels';
	import { isRestaurantSchema, type RestaurantSchema } from '$lib/directus/restaurants';
	import { isPlaceSchema, type PlaceSchema } from '$lib/directus/place-to-visit';

	export let item: HotelSchema | RestaurantSchema | PlaceSchema;

	const { promo_discount_amount, promo_discount_percent, promo_code, translations } = item;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { promo_name, promo_description }
	} = currrentTranslation;

	const icons = $page.data.siteSettings.ui_icons?.map((icon) => icon.icons_id);

	const promoIcon = icons?.filter((icon) => icon.name === 'pictogram-discount-code')[0];

	const copyIcon = icons?.filter((icon) => icon.name === 'icon-copy')[0];

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const promoCodeTitle = labels?.filter((label) => label.name === 'using-promo-code')[0];

	const copySuccessLabel = labels?.filter((label) => label.name === 'promo-code-copied-success')[0];

	const copyErrroLabel = labels?.filter((label) => label.name === 'promo-code-copied-error')[0];

	const category = isPlaceSchema(item) && item.pilar;

	const theme = isHotelSchema(item)
		? 'DEFAULT'
		: isRestaurantSchema(item)
			? 'gastro'
			: category === 'panama-canal'
				? 'canal'
				: category === 'shopping'
					? 'gastro'
					: category === 'nature' || category === 'beach'
						? 'nature'
						: 'culture';
</script>

<PromoCard let:Title let:Description let:CodeTitle let:Header let:Code {theme}>
	<Header let:Icon let:Discount>
		{#if promoIcon}
			<Icon>
				<SVG data={promoIcon.code}></SVG>
			</Icon>
		{:else}
			{'Please add a promo icon to the site, that matches the name: pictogram-discount-code'}
		{/if}
		{#if promo_discount_amount || promo_discount_percent}
			{@const amount = promo_discount_amount ? parseInt(promo_discount_amount) : 0}
			{@const percent = promo_discount_percent ?? 0}
			<Discount>
				-{amount < percent ? `${percent}%` : `$${amount}`}
			</Discount>
		{/if}
	</Header>
	<Title>{promo_name}</Title>
	<Description>{@html promo_description}</Description>
	{#if promo_code}
		{#if promoCodeTitle}
			<CodeTitle>{promoCodeTitle.value}</CodeTitle>
		{:else}
			Please add a promo title to the site translations label, that matches the name:
			using-promo-code
		{/if}
		{#if copySuccessLabel && copyErrroLabel}
			<Code successMesage={copySuccessLabel.value} errroMesage={copyErrroLabel.value}>
				{#if copyIcon}
					<SVG class="size-6 fill-current" data={copyIcon.code}></SVG>
				{:else}
					{'Please add a promo icon to the site, that matches the name: icon-copy'}
				{/if}
				<span>{promo_code}</span>
			</Code>
		{:else}
			{'Please include a promo-code-copied-success and promo-code-copied-error labels in the site'}
		{/if}
	{/if}
</PromoCard>
