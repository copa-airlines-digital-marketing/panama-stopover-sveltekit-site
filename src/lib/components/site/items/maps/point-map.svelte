<script lang="ts">
	import { onMount } from 'svelte';
	import { addGoogleMapsJS, type Coordinates } from '.';

	export let title: string;
	export let point: Coordinates;
	export let mapId: string;
	export let zoom: number;

	onMount(() => addGoogleMapsJS());
</script>
