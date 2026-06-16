import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client'

export const register = new Registry()

// Node.js / Bun のプロセスメトリクス（CPU・メモリ・GCなど）を自動収集
collectDefaultMetrics({ register })

// HTTPリクエスト数カウンター
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'HTTPリクエスト総数',
  labelNames: ['method', 'path', 'status'] as const,
  registers: [register],
})

// HTTPレスポンスタイムヒストグラム
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTPレスポンスタイム（秒）',
  labelNames: ['method', 'path', 'status'] as const,
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
})
