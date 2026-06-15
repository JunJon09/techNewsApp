import { Worker, Queue } from 'bullmq'
import { redisConnection } from '../lib/redis'
import { fetchTopStories } from '../lib/hn-client'
import { db } from '../db/client'
import { articles } from '../db/schema'
import { sql } from 'drizzle-orm'

export const QUEUE_NAME = 'fetch-news'

export const fetchNewsQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100, // 完了済みジョブは最新100件のみ保持
    removeOnFail: 50,
  },
})

// Worker: キューからジョブを取り出して実行
export function createFetchNewsWorker() {
  return new Worker(
    QUEUE_NAME,
    async (job) => {
      const limit: number = job.data.limit ?? 30
      console.log(`[fetch-news] ニュース取得開始 (${limit}件)`)

      const stories = await fetchTopStories(limit)
      console.log(`[fetch-news] ${stories.length}件取得`)

      // upsert: hn_id が重複していれば score・comment_count を更新
      if (stories.length > 0) {
        await db
          .insert(articles)
          .values(
            stories.map((s) => ({
              hnId:         s.id,
              title:        s.title!,
              url:          s.url ?? null,
              score:        s.score ?? 0,
              author:       s.by ?? 'unknown',
              commentCount: s.descendants ?? 0,
            })),
          )
          .onConflictDoUpdate({
            target: articles.hnId,
            set: {
              score:        sql`excluded.score`,
              commentCount: sql`excluded.comment_count`,
              fetchedAt:    sql`now()`,
            },
          })
      }

      console.log(`[fetch-news] DB保存完了`)
      return { fetched: stories.length }
    },
    { connection: redisConnection },
  )
}
