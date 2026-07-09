import type { NavigationSchema } from "$lib/directus/navigation";
import type { HTMLAnchorAttributes } from "svelte/elements";
import Root from './link-item.svelte'

type Props = HTMLAnchorAttributes & {
  item: NavigationSchema['translations'][0]['links'][0]['links_id']
}

export {
  Root,
  Root as LinkItem
}

export type {
  Props
}
