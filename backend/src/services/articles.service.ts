import { redisConnection } from '../lib/redis'
import { findTodayArticles, findArticlesByDate, findArticleById } from '../db/articles.repository'

// キャッシュの有効期限（5分）
const CACHE_TTL_SECONDS = 60 * 5

function buildCacheKey(prefix: string, limit: number, page: number): string {
  return `${prefix}:${limit}:${page}`
}

// 今日の記事を取得する（TOPページ用）
export async function getArticles(limit: number, page: number) {
  const cacheKey = buildCacheKey('articles:today', limit, page)

  const cached = await redisConnection.get(cacheKey)
  if (cached) {
    return { articles: JSON.parse(cached), fromCache: true }
  }

  const offset = (page - 1) * limit
  const data = await findTodayArticles(limit, offset)

  await redisConnection.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS)

  return { articles: data, fromCache: false }
}

// IDで記事を1件取得する（Redisキャッシュ付き）
export async function getArticleById(id: number) {
  const cacheKey = `article:${id}`

  const cached = await redisConnection.get(cacheKey)
  if (cached) {
    return { article: JSON.parse(cached), fromCache: true }
  }

  const data = await findArticleById(id)
  if (!data) return { article: null, fromCache: false }

  await redisConnection.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS)
  return { article: data, fromCache: false }
}

// 指定日（YYYYMMDD）の記事を取得する
export async function getArticlesByDate(date: string, limit: number, page: number) {
  const cacheKey = buildCacheKey(`articles:${date}`, limit, page)

  const cached = await redisConnection.get(cacheKey)
  if (cached) {
    return { articles: JSON.parse(cached), fromCache: true }
  }

  const offset = (page - 1) * limit
  const data = await findArticlesByDate(date, limit, offset)

  await redisConnection.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS)

  return { articles: data, fromCache: false }
}
