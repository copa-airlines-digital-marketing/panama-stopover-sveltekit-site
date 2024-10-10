import { z } from "zod"

const filesSchema = z.object({
  directus_files_id: z.string(),
  sort: z.number()
})

export {
  filesSchema
}