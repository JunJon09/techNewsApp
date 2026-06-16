import './lib/otel' // OTel はアプリより先に初期化する
import app from './index'
import { startScheduler } from './jobs/scheduler'

const port = parseInt(process.env.PORT ?? '8080')

await startScheduler()
console.log(`サーバー起動中: http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
