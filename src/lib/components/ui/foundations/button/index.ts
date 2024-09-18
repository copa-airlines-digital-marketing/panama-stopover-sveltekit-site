import { type VariantProps, tv } from "tailwind-variants";
import type { Button as ButtonPrimitive } from "bits-ui";

const buttonVariants = tv({
  base: "font-suisse font-medium min-w-[4.563rem] max-h-[5rem] flex items-center justify-center text-center outline-offset-4 outline-2 border active:outline focus:outline disabled:cursor-not-allowed disabled:outline-0",
	variants: {
    size: {
      slim: 'px-4 py-2 gap-1 rounded-3xl text-d3 *:max-h-4', 
      default: 'px-4 py-[0.625rem] rounded-[2.5rem] gap-1 text-d1 *:max-h-5',
      large: 'px-6 py-4 rounded-[3.5rem] gap-1 text-b *:max-h-6',
      giant: 'px-8 py-6 gap-2 rounded-[5rem] text-2xl *:max-h-8',
      'fancy-big': 'px-4 py-[0.625rem] rounded-[2.5rem] gap-2 text-d1 *:max-h-10',
      'fancy-small': 'px-4 py-1 rounded-[2.5rem] gap-2 text-d1 *:max-h-8',
      'icon-only': 'block rounded-full'
		},
		variant: {
      'solid-primary-main': 'bg-primary text-common-white outline-primary border-primary hover:bg-primary-ultradark active:bg-primary focus:bg-primary-ultradark disabled:text-grey-500 disabled:bg-grey-100',
      'solid-primary-light': 'bg-primary-light text-common-white outline-primary-light border-primary-light hover:bg-primary-ultradark active:bg-primary-light focus:bg-primary-ultradark disabled:text-grey-500 disabled:bg-grey-100',
      'outline-primary-main': 'text-primary outline-primary border-2 border-primary hover:bg-backgound-lightblue focus:bg-backgound-lightblue active:bg-primary-ultralight disabled:border-grey-500 disabled:text-grey-500 disabled:bg-grey-100',
      'outline-invert': 'text-common-white border-common-white',
      'transparent-primary-main': 'text-primary border-transparent hover:bg-backgound-lightblue active:bg-backgound-lightblue focus:bg-backgound-lightblue active:outline-primary-faded focus:outline-primary-faded',
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