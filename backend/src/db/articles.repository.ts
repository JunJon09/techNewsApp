import { db } from './client'
import { articles } from './schema'
import { desc, sql } from 'drizzle-orm'
import type { Article } from './schema'

// 今日（JST）のスコア上位記事を取得する
export async function findTodayArticles(limit: number, offset: number): Promise<Article[]> {
  return db
    .select()
    .from(articles)
    .where(sql`(fetched_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date = CURRENT_DATE`)
    .orderBy(desc(articles.score))
    .limit(limit)
    .offset(offset)
}

// 指定日（YYYYMMDD）のスコア上位記事を取得する（ページネーション対応）
export async function findArticlesByDate(date: string, limit: number, offset: number): Promise<Article[]> {
  const formatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
  return db
    .select()
    .from(articles)
    .where(sql`(fetched_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date = ${formatted}`)
    .orderBy(desc(articles.score))
    .limit(limit)
    .offset(offset)
}
