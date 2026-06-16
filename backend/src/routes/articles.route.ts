import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getArticles, getArticlesByDate } from '../services/articles.service'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  page:  z.coerce.number().int().min(1).default(1),
})

// YYYYMMDD 形式のバリデーション
const dateParamSchema = z.object({
  date: z.string().regex(/^\d{8}$/, '日付は YYYYMMDD 形式で指定してください'),
})

const route = new Hono()
  // 今日の記事一覧: GET /api/articles?limit=10&page=1
  .get('/articles', zValidator('query', querySchema), async (c) => {
    const { limit, page } = c.req.valid('query')
    const result = await getArticles(limit, page)
    return c.json({ ...result, limit, page })
  })
  // 日付指定の記事一覧: GET /api/articles/20260616?limit=10&page=1
  .get('/articles/:date', zValidator('param', dateParamSchema), zValidator('query', querySchema), async (c) => {
    const { date } = c.req.valid('param')
    const { limit, page } = c.req.valid('query')
    const result = await getArticlesByDate(date, limit, page)
    return c.json({ ...result, date, limit, page })
  })

export default route
export type ArticlesRouteType = typeof route
