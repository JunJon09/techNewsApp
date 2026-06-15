import { hnTopStoriesSchema, hnItemSchema, type HnItem } from './schemas/hn.schema'

const BASE_URL = 'https://hacker-news.firebaseio.com/v0'

// トップ記事のIDリストを取得（最大 limit 件）
async function fetchTopStoryIds(limit = 30): Promise<number[]> {
  const res = await fetch(`${BASE_URL}/topstories.json`)
  if (!res.ok) throw new Error(`HN API エラー: ${res.status}`)

  const raw = await res.json()
  const ids = hnTopStoriesSchema.parse(raw)
  return ids.slice(0, limit)
}

// 単一記事の詳細を取得
async function fetchItem(id: number): Promise<HnItem | null> {
  const res = await fetch(`${BASE_URL}/item/${id}.json`)
  if (!res.ok) return null

  const raw = await res.json()
  if (raw === null) return null

  const result = hnItemSchema.safeParse(raw)
  if (!result.success) return null

  // 削除済み・死亡記事・ストーリー以外はスキップ
  const item = result.data
  if (item.deleted || item.dead || item.type !== 'story' || !item.title) return null

  return item
}

// トップ記事を並列取得してフィルタリング
export async function fetchTopStories(limit = 30): Promise<HnItem[]> {
  const ids = await fetchTopStoryIds(limit)
  const items = await Promise.all(ids.map(fetchItem))
  return items.filter((item): item is HnItem => item !== null)
}
