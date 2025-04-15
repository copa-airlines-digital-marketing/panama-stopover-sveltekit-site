import { type VariantProps } from "tailwind-variants";
import type { Button as ButtonPrimitive } from "bits-ui";
import { cmTailwindVariants } from "$lib/utils";

const buttonVariants = cmTailwindVariants({
  base: "font-jakarta font-medium min-w-16 max-h-20 flex items-center justify-center text-center outline-offset-4 outline-2 active:outline focus:outline disabled:cursor-not-allowed disabled:outline-0 transition-colors",
	variants: {
    size: {
      slim: 'px-4 py-2 gap-1 rounded-3xl text-d3 border *:max-h-4', 
      default: 'px-4 py-3 rounded-full gap-1 text-d1 border *:max-h-5',
      large: 'px-6 py-4 rounded-full gap-1 text-b border *:max-h-6',
      giant: 'px-8 py-6 gap-2 rounded-full text-2xl border *:max-h-8',
      'fancy-big': 'px-4 py-3 rounded-full gap-2 text-d1 border *:max-h-10',
      'fancy-small': 'px-4 py-1 rounded-full gap-2 text-d1 border *:max-h-8',
      'link': 'text-d3 sm:text-d1 md:text-b *:max-h-4 sm:*:max-h-5 md:*:max-h-6 outline-hidden min-w-max border-b border-b-transparent hover:border-b-current active:border-b-current focus:border-b-current',
		},
		variant: {
      'solid-primary-main': 'bg-primary text-common-white outline-primary border-primary hover:bg-primary-ultradark active:bg-primary focus:bg-primary-ultradark disabled:text-grey-500 disabled:bg-grey-100',
      'solid-primary-light': 'bg-primary-light text-common-white outline-primary-light border-primary-light hover:bg-primary-ultradark active:bg-primary-light focus:bg-primary-ultradark disabled:text-grey-500 disabled:bg-grey-100',
      'outline-primary-main': 'text-primary outline-primary border-2 border-primary hover:bg-backgound-lightblue focus:bg-backgound-lightblue active:bg-primary-ultralight disabled:border-grey-500 disabled:text-grey-500 disabled:bg-grey-100',
      'outline-invert': 'text-common-white border-common-white',
      'transparent-primary-main': 'text-primary border-transparent hover:bg-backgound-lightblue active:bg-backgound-lightblue focus:bg-backgound-lightblue active:outline-primary-faded focus:outline-primary-faded',
      'link': 'text-primary hover:text-primary-light focus:text-primary-light active:text-primary-light',
      'link-invert': 'text-grey-50 hover:text-grey-50 focus:text-grey-50 active:text-grey-50'
		},
	},
	defaultVariants: {
    variant: "solid-primary-main",
		size: "default",
	},
});

type Variant = VariantProps<typeof buttonVariants>["variant"];
type Size = VariantProps<typeof buttonVariants>["size"];

type Props = ButtonPrimitive.Props & {
  variant?: Variant;
	size?: Size;
};

type Events = ButtonPrimitive.Events;

export { default as Button } from "./button.svelte";
export {
	type Props,
	type Events,
	//
	type Props as ButtonProps,
	type Events as ButtonEvents,
	buttonVariants,
};