import { db } from './client'
import { articles } from './schema'
import { desc } from 'drizzle-orm'
import type { Article } from './schema'

// スコア順で記事を取得する（ページネーション対応）
export async function findArticles(limit: number, offset: number): Promise<Article[]> {
  return db
    .select()
    .from(articles)
    .orderBy(desc(articles.score))
    .limit(limit)
    .offset(offset)
}
