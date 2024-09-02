import { tv } from "tailwind-variants";

export const getGridContainerClasses = () => 'grid grid-cols-12 gap-grid-gutter'

export const getGridItemVariant = tv({
  base: 'col-span-full',
  variants: {
    distributions: {
      full: '',
      half: 'sm:col-span-6',
      four: 'md:col-span-4',
      third: 'md:col-span-3',
      '4 / 8': 'md:odd:col-span-4 md:even:col-span-8',
      '8 / 4': 'md:odd:col-span-8 md:even:col-span-4'
    }
    
  }
});