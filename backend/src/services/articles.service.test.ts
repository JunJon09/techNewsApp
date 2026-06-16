import { describe, it, expect, vi, beforeEach } from 'vitest'

// Redis・repository をモック化（実際のDB・Redisを叩かない）
vi.mock('../lib/redis', () => ({
  redisConnection: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

vi.mock('../db/articles.repository', () => ({
  findArticles: vi.fn(),
}))

import { getArticles } from './articles.service'
import { redisConnection } from '../lib/redis'
import { findArticles } from '../db/articles.repository'

const mockArticle = {
  id: 1, hnId: 123, title: 'テスト記事',
  url: 'https://example.com', score: 100,
  author: 'user1', commentCount: 10, fetchedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getArticles', () => {
  it('キャッシュがある場合はDBを叩かずキャッシュから返す', async () => {
    vi.mocked(redisConnection.get).mockResolvedValue(JSON.stringify([mockArticle]))

    const result = await getArticles(30, 1)

    expect(result.fromCache).toBe(true)
    expect(result.articles).toHaveLength(1)
    expect(findArticles).not.toHaveBeenCalled() // DBは叩いていない
  })

  it('キャッシュがない場合はDBから取得してキャッシュに保存する', async () => {
    vi.mocked(redisConnection.get).mockResolvedValue(null)
    vi.mocked(findArticles).mockResolvedValue([mockArticle])

    const result = await getArticles(30, 1)

    expect(result.fromCache).toBe(false)
    expect(result.articles).toHaveLength(1)
    // offset = (page - 1) * limit = (1 - 1) * 30 = 0
    expect(findArticles).toHaveBeenCalledWith(30, 0)
    expect(redisConnection.set).toHaveBeenCalledWith(
      'articles:30:1',
      JSON.stringify([mockArticle]),
      'EX',
      300,
    )
  })

  it('2ページ目のオフセットが正しい', async () => {
    vi.mocked(redisConnection.get).mockResolvedValue(null)
    vi.mocked(findArticles).mockResolvedValue([])

    await getArticles(10, 2)

    // offset = (2 - 1) * 10 = 10
    expect(findArticles).toHaveBeenCalledWith(10, 10)
  })
})
