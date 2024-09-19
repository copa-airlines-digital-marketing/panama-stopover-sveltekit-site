import { type VariantProps } from "tailwind-variants";
import { cmTailwindVariants, cn } from "$lib/utils";

const typography = cmTailwindVariants({
  base: 'text-b font-suisse font-normal',
  variants: {
    size: {
      u6: 'text-u6',
      u5: 'text-u5',
      u4: 'text-u4',
      u3: 'text-u3',
      u2: 'text-u2',
      u1: 'text-u1',
      b: 'text-b',
      d1: 'text-d1',
      d2: 'text-d2 font-semibold',
      d3: 'text-d3',
      'caption-large': 'text-u1',
      'caption': 'text-b font-semibold',
      'caption-small': 'text-d1 font-semibold',
      'caption-tiny': 'text-d3 font-semibold',
      'body-large': 'text-b my-2',
      'body': 'text-d1',
      'body-small': 'text-d3',
      'overline': 'text-d2 font-medium uppercase',
      'overline-small': 'text-d1'
    },
    variant: {
      h1: 'text-u5 font-gilroy font-medium text-primary',
      h2: 'text-u2 font-gilroy font-bold text-primary-dark',
      h3: 'text-u1 font-gilroy font-bold text-grey-700',
      h4: 'text-b font-gilroy font-bold text-grey-700',
      'display-big': 'text-u6 font-gilroy font-bold text-primary',
      'display': 'text-u4 font-gilroy font-bold text-primary',
      'display-small': 'text-u2 font-gilroy font-normal text-grey-700',
      'display-tiny': 'text-u1 font-gilroy font-normal text-grey-700',
      'overline': 'text-grey-700',
      'overline-invert': 'text-common-white',
      'caption': 'text-grey-700',
      'caption-secondary': 'text-grey-600',
      'caption-invert': 'text-common-white',
      'caption-invert-secondary': 'text-grey-200',
      'body': 'text-grey-600',
      'body-emphasis': 'text-grey-700',
      'body-invert': 'text-grey-200',
      'body-invert-emphasis': 'text-common-white',
      'link': 'text-primary-light hover:underline',
      'link-invert': 'text-grey-200 underline',
      'link-secondary': 'text-grey-600 hover:underline',
    }
  },
  defaultVariants: {
    size: 'body',
    variant: 'body',
  }
})

type Variant = VariantProps<typeof typography>['variant']
type Size = VariantProps<typeof typography>['size']

export type Typography = {
  size?: Size,
  variant?: Variant
  className?: string
}

export const getTypography = (size?: Size, variant?: Variant, className?: string) => {
  return cn(typography({size, variant, className}))
}

export const getTypographyVariant = (variant?: Variant, className?: string) => getTypography(undefined, variant, className )

export const getTypographySize = (size?: Size, className?: string) => getTypography(size, undefined, className )