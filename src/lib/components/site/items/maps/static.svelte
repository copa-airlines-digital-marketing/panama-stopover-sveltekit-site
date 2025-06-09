<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import type { Coordinates, MapProps, Marker } from '.';
	import { cn } from '$lib/utils';
	import { Source } from '$ui/components/picture';

	type $$Props = HTMLImgAttributes &
		MapProps & {
			breakpointSize?: {
				lg?: string;
				md?: string;
				sm?: string;
				xs?: string;
			};
		};

	let className: $$Props['class'] = undefined;
	export let mapTitle: $$Props['mapTitle'] = undefined;
	export let markers: $$Props['markers'] = undefined;
	/*export let zoom: $$Props['zoom'] = 16;
	 	export let mapSize: $$Props['mapSize'] = undefined;
	export let scale: $$Props['scale'] = undefined;
	export let mapType: $$Props['mapType'] = 'roadmap'; */
	export let center: $$Props['center'];
	export let breakpointSize: $$Props['breakpointSize'] = undefined;
	export { className as class };

	const API = 'https://maps.googleapis.com/maps/api/staticmap';

	const API_KEY = 'AIzaSyAIeomrDWZ0BM3eTZFMJyvAzx7NfE4-64o';

	const isKeyOfMarker = (marker: Marker, key: string): key is keyof Marker => key in marker;

	const isCoordinate = (prop: unknown): prop is Coordinates =>
		!!prop && typeof prop === 'object' && 'lat' in prop && 'lng' in prop;

	const processMarkerProp = (marker: Marker, key: string) => {
		if (!isKeyOfMarker(marker, key)) return '';

		if (isCoordinate(marker[key])) return `${marker[key].lat},${marker[key].lng}`;

		return `${key}:${marker[key]}`;
	};

	const sortLastLocation = (a: string, b: string) => {
		const aWithColon = a.includes(':') ? 0 : 1;
		const bWithColon = b.includes(':') ? 0 : 1;

		return aWithColon - bWithColon;
	};

	const markerToURL = (marker: Marker) => {
		const propsToParams = Object.keys(marker).map((m) => processMarkerProp(marker, m));

		const sortedParams = propsToParams.sort(sortLastLocation).join('%7C');

		return `markers=${sortedParams}`;
	};

	const generateMarker = (markers: $$Props['markers']) =>
		markers ? '&' + markers.map(markerToURL).join('&') : '';

	const getmapSource = (size: string) =>
		`${API}?center=${center.lat},${center.lng}&size=${size}${generateMarker(markers)}&key=${API_KEY}`;

	Source;
</script>

<picture class="block [grid-area:image]">
	<Source
		screen="lg"
		srcset="{getmapSource(breakpointSize?.['lg'] || '640x160')}&scale=2&zoom=16"
	/>
	<Source
		screen="md"
		srcset="{getmapSource(breakpointSize?.['md'] || '640x214')}&scale=2&zoom=17"
	/>
	<Source
		screen="sm"
		srcset="{getmapSource(breakpointSize?.['sm'] || '640x360')}&scale=2&zoom=18"
	/>
	<img
		src="{getmapSource(breakpointSize?.['xs'] || '600x600')}&scale=2&zoom=19"
		alt={mapTitle}
		class={cn('h-auto w-full', className)}
	/>
</picture>
