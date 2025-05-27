<script lang="ts">
	import { onMount } from 'svelte';

	const initMap = (): void => {
		const mapOptions: google.maps.MapOptions = {
			zoom: 17,
			center: coordinates
		};

		const map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);

		new google.maps.Marker({
			position: coordinates,
			map: map,
			title: name
		});
	};

	onMount(() => {
		window.initMap = initMap;

		const mapjs = document.createElement('script');
		mapjs.async = true;
		mapjs.defer = true;
		mapjs.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&callback=initMap&loading=async`;

		document.head.append(mapjs);
	});
</script>
