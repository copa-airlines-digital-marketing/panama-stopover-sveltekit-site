import type { HTMLAttributes } from 'svelte/elements';
import MapContainer from './map-container.svelte';
import Button from './button.svelte';
import Title from './title.svelte';
import Static from './static.svelte';

export { default as Map } from './map.svelte';

declare global {
	var initMap: () => void;
	interface Window {
		initMap: () => void;
		google: any;
	}
}

type Coordinates = {
	lat: number;
	lng: number;
};

type Marker = {
	location: Coordinates;
	color?: string;
	label?: string;
	size?: 'tiny' | 'mid' | 'small';
};

type MapProps = {
	mapId?: string;
	mapTitle?: string;
	center: Coordinates;
	markers?: Marker[];
	zoom?: number;
	mapSize?: string;
	scale?: number;
	mapType: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
};

type MapContainerElementProps = HTMLAttributes<HTMLDivElement>;

const GOOGLE_MAP_KEY = 'AIzaSyAIeomrDWZ0BM3eTZFMJyvAzx7NfE4-64o';

const initMap =
	(
		coordinates: Coordinates,
		title: string,
		mapElement: HTMLElement,
		mapId: string,
		zoom?: number
	) =>
	(): void => {
		const mapOptions = {
			zoom: zoom || 17,
			center: coordinates,
			mapId
		};

		const map = new window.google.maps.Map(mapElement, mapOptions);

		new window.google.maps.marker.AdvancedMarkerElement({
			position: coordinates,
			map,
			title
		});
	};

const addGoogleMapsJS = (
	coordinates: Coordinates,
	title: string,
	mapElement: HTMLElement,
	mapId: string,
	zoom?: number
) => {
	if (typeof window.initMap === 'function' && window.google) return;

	window.initMap = initMap(coordinates, title, mapElement, mapId, zoom);

	const mapjs = document.createElement('script');
	mapjs.async = true;
	mapjs.defer = true;
	mapjs.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_KEY}&callback=initMap&loading=async`;

	document.head.append(mapjs);
};

export type { Coordinates, Marker, MapProps, MapContainerElementProps };

export { GOOGLE_MAP_KEY, addGoogleMapsJS, MapContainer, Button, Static, Title };
