import { db } from './client'
import { articles } from './schema'
import { desc, eq, sql } from 'drizzle-orm'
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

// IDで記事を1件取得する
export async function findArticleById(id: number): Promise<Article | null> {
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1)
  return result[0] ?? null
}

// 記事のコンテンツ・翻訳・単語一覧を更新する
export async function updateArticleContent(
  id: number,
  data: { content: string; contentJa: string; keywords: unknown },
): Promise<void> {
  await db.update(articles).set({
    content:    data.content,
    contentJa:  data.contentJa,
    keywords:   data.keywords,
  }).where(eq(articles.id, id))
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
