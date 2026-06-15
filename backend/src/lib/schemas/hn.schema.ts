import { z } from 'zod'

// HN API: /v0/topstories.json のレスポンス
export const hnTopStoriesSchema = z.array(z.number().int().positive())

// HN API: /v0/item/{id}.json のレスポンス
export const hnItemSchema = z.object({
  id:          z.number().int(),
  type:        z.string(),
  title:       z.string().optional(),
  url:         z.string().url().optional(),
  score:       z.number().int().optional().default(0),
  by:          z.string().optional(),
  descendants: z.number().int().optional().default(0),
  time:        z.number().int(),
  deleted:     z.boolean().optional(),
  dead:        z.boolean().optional(),
})

export type HnItem = z.infer<typeof hnItemSchema>
