import { Hono } from 'hono'
import { logger } from 'hono/logger'
import articlesRoute from './routes/articles.route'
import { register, httpRequestsTotal, httpRequestDuration } from './lib/metrics'

const app = new Hono()
  .use('*', logger())
  // Prometheusメトリクス収集ミドルウェア
  .use('*', async (c, next) => {
    const start = Date.now()
    await next()
    const duration = (Date.now() - start) / 1000
    const path = new URL(c.req.url).pathname
    const method = c.req.method
    const status = String(c.res.status)
    httpRequestsTotal.inc({ method, path, status })
    httpRequestDuration.observe({ method, path, status }, duration)
  })
  .get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))
  // Prometheusがスクレイプするエンドポイント
  .get('/metrics', async (c) => {
    const metrics = await register.metrics()
    return c.text(metrics, 200, { 'Content-Type': register.contentType })
  })
  .route('/api', articlesRoute)

export default app
export type AppType = typeof app
