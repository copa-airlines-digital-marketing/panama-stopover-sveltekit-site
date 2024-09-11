import { z } from "zod";
import { textContentSchema } from "./text-content";
import { navigationSchema } from "./navigation";

const sectionContentSchema = z.object({
  item: textContentSchema.or(navigationSchema),
  collection: z.string(),
  component_name: z.string().nullable(),
  display: z.string().nullable(),
  theme: z.string().nullable(),
  horizontal_alignment: z.string().nullable(),
  vertical_alignment: z.string().nullable(),
})

const sectionSchema = z.object({
  landmark: z.string(),
  section_id: z.string().nullable(),
  horizontal_behaviour: z.string(),
  content_spacing: z.string(),
  content_horizontal_aligment: z.string(),
  content_horizontal_distribution: z.string(),
  content_vertical_alignment: z.string(),
  content_vertical_distribution: z.string(),
  background_color: z.string(),
  section_content: sectionContentSchema.array().nullable()
})

type SectionSchema = z.infer<typeof sectionSchema>

const isSectionSchema = (value: unknown): value is SectionSchema => sectionSchema.safeParse(value).success

export {
  sectionSchema,
  isSectionSchema
}

export type {
  SectionSchema
}