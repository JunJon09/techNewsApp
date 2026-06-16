import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getArticles } from '../services/articles.service'

// クエリパラメータのバリデーション
const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  page:  z.coerce.number().int().min(1).default(1),
})

const route = new Hono()
  .get('/articles', zValidator('query', querySchema), async (c) => {
    const { limit, page } = c.req.valid('query')
    const result = await getArticles(limit, page)
    return c.json({ ...result, limit, page })
  })

export default route

// Hono RPC 用に型をエクスポート（フロントエンドから使う）
export type ArticlesRouteType = typeof route
