import { Worker, Queue } from 'bullmq'
import { bullmqConnection } from '../lib/redis'
import { fetchTopStories } from '../lib/hn-client'
import { fetchArticleContent } from '../lib/jina-client'
import { enrichArticle } from '../lib/openai-client'
import { db } from '../db/client'
import { articles } from '../db/schema'
import { updateArticleContent } from '../db/articles.repository'
import { sql } from 'drizzle-orm'

export const QUEUE_NAME = 'fetch-news'

const EXCLUDED_DOMAINS = [
  'twitter.com',
  'x.com',
  'github.com',
  'youtube.com',
  'apps.apple.com',
  'play.google.com',
  'reddit.com',
]

function isExcludedUrl(url: string | null): boolean {
  if (!url) return true
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')
    return EXCLUDED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))
  } catch {
    return true
  }
}

export const fetchNewsQueue = new Queue(QUEUE_NAME, {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

export function createFetchNewsWorker() {
  return new Worker(
    QUEUE_NAME,
    async (job) => {
      const limit: number = job.data.limit ?? 5
      console.log(`[fetch-news] ニュース取得開始 (${limit}件)`)

      const stories = await fetchTopStories(limit)
      console.log(`[fetch-news] ${stories.length}件取得`)

      if (stories.length === 0) return { fetched: 0 }

      // upsert して保存後のID・URLを取得
      const saved = await db
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
        .returning({ id: articles.id, url: articles.url })

      console.log(`[fetch-news] DB保存完了`)

      // 除外ドメイン以外の記事を順番にエンリッチ
      for (const { id, url } of saved) {
        if (isExcludedUrl(url)) continue

        try {
          const content = await fetchArticleContent(url!)
          if (!content) continue

          const enriched = await enrichArticle(content)
          if (!enriched) continue

          await updateArticleContent(id, {
            content,
            contentJa: enriched.translation,
            keywords:  enriched.keywords,
          })

          console.log(`[fetch-news] エンリッチ完了: id=${id}`)
        } catch (err) {
          console.error(`[fetch-news] エンリッチ失敗: id=${id}`, err)
        }
      }

      return { fetched: stories.length }
    },
    { connection: bullmqConnection },
  )
}
