import { cmTailwindVariants } from "$lib/utils";
import type { VariantProps } from "tailwind-variants";

const descriptionVariants = cmTailwindVariants({
  base: 'mt-2 mb-6 [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:text-u2 [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-u1 [&_h3]:font-bold [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-3',
  variants: {
    theme: {
      light: '[&_h2]:text-primary-dark [&_h3]:text-grey-700 [&_a]:text-primary-light',
      dark: 'text-grey-200 [&_h2]:text-grey-50 [&_h3]:text-grey-50 [&_a]:text-grey-50'
    }
  },
  defaultVariants: {
    theme: 'light'
  }
})

type DescriptionTheme = VariantProps<typeof descriptionVariants>['theme']

export {
  descriptionVariants
}

export type {
  DescriptionTheme
}