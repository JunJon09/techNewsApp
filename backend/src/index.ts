import { Hono } from 'hono'
import { logger } from 'hono/logger'
import articlesRoute from './routes/articles.route'

const app = new Hono()
  .use('*', logger())
  .get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))
  .route('/api', articlesRoute)

export default app
export type AppType = typeof app
