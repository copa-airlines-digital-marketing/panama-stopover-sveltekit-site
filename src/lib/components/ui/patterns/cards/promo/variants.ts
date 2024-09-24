import { cmTailwindVariants } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";
import type { VariantProps } from "tailwind-variants";

const promoCardVariants = cmTailwindVariants({
  base: 'p-4 rounded-2xl',
  variants: {
    theme: {
      DEFAULT: 'bg-secondary text-sky-100'
    } 
  },
  defaultVariants: {
    theme: 'DEFAULT'
  }
})

type promoCardTheme = VariantProps<typeof promoCardVariants>['theme']

type promoCardProps = HTMLAttributes<HTMLDivElement> & {
  theme?: promoCardTheme
}

export {
  promoCardVariants
}

export type {
  promoCardProps
}