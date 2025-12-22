import Root from '$lib/components/ui/patterns/menu/linkbar/root.svelte'
import { cmTailwindVariants } from '$lib/utils'

const linkBarVariants = cmTailwindVariants({
  base: 'border px-2 py-4 sm:px-6 md:px-2 grid items-center outline-primary-faded rounded-2xl grid-cols-[auto_1fr_auto_auto] grid-rows-2' ,
  variants: {
    variant: {
      DEFAULT: 'border-primary text-primary focus:border-transparent focus:outline focus:outline-[3px] focus:-outline-offset-1',
      invert: 'border-primary-light bg-primary-light hover:bg-primary hover:border-primary focus:outline focus:oultine-2 text-grey-50'
    }
  },
  defaultVariants: {
    variant: 'DEFAULT'
  }
})

export {
  Root,

  Root as Linkbar,

  linkBarVariants
}

