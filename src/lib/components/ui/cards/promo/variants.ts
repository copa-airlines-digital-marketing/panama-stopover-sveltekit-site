import { tv } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";
import type { VariantProps } from "tailwind-variants";

const promoCardVariants = tv({
  base: 'p-4 rounded-2xl md:p-8',
  variants: {
    theme: {
      DEFAULT: 'bg-secondary text-sky-100',
      gastro: 'bg-stopover-gastronomy text-orange-50',
      culture: 'bg-stopover-culture text-red-50',
      canal: 'bg-stopover-canal text-blue-50',
      nature: 'bg-stopover-nature text-green-50',
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