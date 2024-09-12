import { z } from "zod";
import { textContentSchema } from "./text-content";
import { navigationSchema } from "./navigation";

const horizontal_alignment = z.union([z.literal('left'), z.literal('center'), z.literal('right')])
const vertical_alignment = z.union([z.literal('top'), z.literal('center'), z.literal('bottom'), z.literal('baseline'), z.literal('stretch')])
const content_distribution = z.union([z.literal('space-around'), z.literal('space-between'), z.literal('space-evenly')])

const sectionContentSchema = z.object({
  id: z.union([z.string(), z.number()]),
  item: textContentSchema.or(navigationSchema),
  collection: z.union([z.literal('Text_Content'), z.literal('navigation')]),
  component_name: z.string().nullable(),
  display: z.union([z.literal('100'), z.literal('75'), z.literal('50'), z.literal('25')]).nullable(),
  theme: z.union([z.literal('light'), z.literal('dark')]).nullable(),
  horizontal_alignment: horizontal_alignment.nullable(),
  vertical_alignment: vertical_alignment.nullable(),
})

const sectionSchema = z.object({
  id: z.union([z.string(), z.number()]),
  landmark: z.union([z.literal('aside'), z.literal('footer'), z.literal('header'), z.literal('hero'), z.literal('loading'), z.literal('modal'), z.literal('regular'), z.literal('section')]),
  section_id: z.string().nullable(),
  horizontal_behaviour: z.union([z.literal('full'), z.literal('contained'), z.literal('container-grid')]),
  content_spacing: z.union([z.literal('none'), z.literal('minimal'), z.literal('tiny'), z.literal('petit'), z.literal('normal'), z.literal('roomy'), z.literal('spacious'), z.literal('big'), z.literal('huge')]),
  content_horizontal_alignment: horizontal_alignment,
  content_horizontal_distribution: z.union([horizontal_alignment, content_distribution]),
  content_vertical_alignment: vertical_alignment,
  content_vertical_distribution: z.union([vertical_alignment, content_distribution]),
  background_color: z.string(),
  section_content: sectionContentSchema.array().nullish()
})

type SectionSchema = z.infer<typeof sectionSchema>

type SectionContentSchema = z.infer<typeof sectionContentSchema>

const isSectionSchema = (value: unknown): value is SectionSchema => sectionSchema.safeParse(value).success

export {
  sectionSchema,
  isSectionSchema
}

export type {
  SectionSchema,
  SectionContentSchema
}