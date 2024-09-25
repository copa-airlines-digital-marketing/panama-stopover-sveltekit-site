<script lang='ts'>
	import type { HotelSchema } from "$lib/directus/hotels";
	import type { PlaceSchema } from "$lib/directus/place-to-visit";
	import type { RestaurantSchema } from "$lib/directus/restaurants";
	import { IconList } from "../../ui/icon-list";

  export let item: HotelSchema | RestaurantSchema | PlaceSchema

  
</script>

<IconList></IconList>