import { getTypographyVariant } from "$lib/components/ui/foundations/typography";
import { cmTailwindVariants } from "$lib/utils";
import type { ButtonProps } from "bits-ui";
import type { VariantProps } from "tailwind-variants";

const iconnedVariants = cmTailwindVariants({
  base: 'rounded-2xl flex gap-2 p-4 flex-col items-center',
  variants: {
    theme: {
      DEFAULT: getTypographyVariant('display-tiny','bg-secondary text-grey-50'),
    }
  },
  defaultVariants: {
    theme: 'DEFAULT'
  }
})

type IconnedCTATheme = VariantProps<typeof iconnedVariants>['theme']

type IconnedCTAProps = ButtonProps & {
  theme?: IconnedCTATheme
}

export {
  iconnedVariants
}

export type {
  IconnedCTAProps
}