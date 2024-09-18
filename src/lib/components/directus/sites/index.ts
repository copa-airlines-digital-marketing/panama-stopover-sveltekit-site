import { tv } from "tailwind-variants";

const containerVariant = tv({
  base:'',
  variants: {
    horizontal_behaviour: {
      full: 'grid',
      contained: 'container mx-auto',
      'container-grid': 'container-grid'
    },
  }
})

const sectionVariants = tv({
  base: 'grid grid-cols-12',
  variants: {
    vertical_spacing: {
      none:'py-0',
      minimal:'py-minimal',
      tiny:'py-tiny',
      petit:'py-petit',
      normal:'py-normal',
      roomy:'py-roomy',
      spacious:'py-spacious',
      big:'py-big',
      huge:'py-huge'
    },
		content_spacing: {
      none:'gap-0',
      minimal:'gap-minimal',
      tiny:'gap-tiny',
      petit:'gap-petit',
      normal:'gap-normal',
      roomy:'gap-roomy',
      spacious:'gap-spacious',
      big:'gap-big',
      huge:'gap-huge'
    },
		content_horizontal_aligment: {
      left: 'justify-items-start',
      center: 'justify-items-center',
      right: 'justify-items-end',
      stretch: 'justify-items-stretch'
    },
		content_horizontal_distribution: {
      left:'justify-start',
      center:'justify-center',
      right:'justify-end',
      space_around:'justify-around',
      space_between:'justify-between',
      space_evenly:'justify-evenly',
      stretch:'justify-stretch'
    },
		content_vertical_alignment: {
      top: 'items-start',
      center: 'items-center',
      bottom: 'items-end',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },
		content_vertical_distribution: {
      top: 'content-start',
      center: 'content-center',
      bottom: 'content-end',
      baseline: 'content-baseline',
      space_around:'content-around',
      space_between:'content-between',
      space_evenly:'content-evenly',
      stretch: 'content-stretch',
    }
  },
})

const contentVariant = tv({
  base: 'col-span-full',
  variants: {
    display: {
      100: '',
      75: 'md:col-span-4',
      70: 'md:col-span-8',
      50: 'sm:col-span-6',
      25: 'md:col-span-3',
    },
    horizontal_alignment: {
      left: 'justify-self-start',
      center: 'justify-self-center',
      right: 'justify-self-end',
    },
    vertical_alignment: {
      top: 'self-start',
      center: 'self-center',
      bottom: 'self-end',
      baseline: 'self-baseline',
      stretch: 'self-stretch',
    }
  }
})

export {
  contentVariant,
  containerVariant,
  sectionVariants,
}