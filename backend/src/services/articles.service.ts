import { redisConnection } from '../lib/redis'
import { findArticles } from '../db/articles.repository'

// キャッシュの有効期限（5分）
const CACHE_TTL_SECONDS = 60 * 5

function buildCacheKey(limit: number, page: number): string {
  return `articles:${limit}:${page}`
}

export async function getArticles(limit: number, page: number) {
  const cacheKey = buildCacheKey(limit, page)

  // ① Redis にキャッシュがあれば即返す
  const cached = await redisConnection.get(cacheKey)
  if (cached) {
    return { articles: JSON.parse(cached), fromCache: true }
  }

  // ② キャッシュなし → DB から取得
  const offset = (page - 1) * limit
  const data = await findArticles(limit, offset)

  // ③ 結果を Redis にキャッシュ保存
  await redisConnection.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS)

  return { articles: data, fromCache: false }
}
