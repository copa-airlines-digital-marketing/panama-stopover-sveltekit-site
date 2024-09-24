import { cmTailwindVariants } from "$lib/utils";
import type { ButtonProps } from "bits-ui";
import type { VariantProps } from "tailwind-variants";

const iconnedVariants = cmTailwindVariants({
  base: 'rounded-2xl flex gap-2 p-4 flex-col',
  variants: {
    theme: {
      DEFAULT: 'bg-secondary',
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