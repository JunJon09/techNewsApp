import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
})

// BullMQ に渡す接続設定（ioredis インスタンスではなくオプション値）
// BullMQ が自前の ioredis を使うため、インスタンスを渡すと型が競合する
const parsed = new URL(redisUrl)
export const bullmqConnection = {
  host: parsed.hostname,
  port: parseInt(parsed.port || '6379'),
} as const
