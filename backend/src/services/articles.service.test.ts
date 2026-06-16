import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/redis', () => ({
  redisConnection: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

vi.mock('../db/articles.repository', () => ({
  findTodayArticles: vi.fn(),
  findArticlesByDate: vi.fn(),
}))

import { getArticles, getArticlesByDate } from './articles.service'
import { redisConnection } from '../lib/redis'
import { findTodayArticles, findArticlesByDate } from '../db/articles.repository'

const mockArticle = {
  id: 1, hnId: 123, title: 'テスト記事',
  url: 'https://example.com', score: 100,
  author: 'user1', commentCount: 10, fetchedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getArticles（今日の記事）', () => {
  it('キャッシュがある場合はDBを叩かずキャッシュから返す', async () => {
    vi.mocked(redisConnection.get).mockResolvedValue(JSON.stringify([mockArticle]))

    const result = await getArticles(30, 1)

    expect(result.fromCache).toBe(true)
    expect(result.articles).toHaveLength(1)
    expect(findTodayArticles).not.toHaveBeenCalled()
  })

  it('キャッシュがない場合はDBから取得してキャッシュに保存する', async () => {
    vi.mocked(redisConnection.get).mockResolvedValue(null)
    vi.mocked(findTodayArticles).mockResolvedValue([mockArticle])

    const result = await getArticles(30, 1)

    expect(result.fromCache).toBe(false)
    expect(findTodayArticles).toHaveBeenCalledWith(30, 0)
    expect(redisConnection.set).toHaveBeenCalledWith(
      'articles:today:30:1',
      JSON.stringify([mockArticle]),
      'EX',
      300,
    )
  })

  it('2ページ目のオフセットが正しい', async () => {
    vi.mocked(redisConnection.get).mockResolvedValue(null)
    vi.mocked(findTodayArticles).mockResolvedValue([])

    await getArticles(10, 2)

    expect(findTodayArticles).toHaveBeenCalledWith(10, 10)
  })
})

describe('getArticlesByDate（日付指定）', () => {
  it('キャッシュがある場合はDBを叩かずキャッシュから返す', async () => {
    vi.mocked(redisConnection.get).mockResolvedValue(JSON.stringify([mockArticle]))

    const result = await getArticlesByDate('20260616', 30, 1)

    expect(result.fromCache).toBe(true)
    expect(findArticlesByDate).not.toHaveBeenCalled()
  })

  it('キャッシュがない場合はDBから取得してキャッシュに保存する', async () => {
    vi.mocked(redisConnection.get).mockResolvedValue(null)
    vi.mocked(findArticlesByDate).mockResolvedValue([mockArticle])

    const result = await getArticlesByDate('20260616', 10, 1)

    expect(result.fromCache).toBe(false)
    expect(findArticlesByDate).toHaveBeenCalledWith('20260616', 10, 0)
    expect(redisConnection.set).toHaveBeenCalledWith(
      'articles:20260616:10:1',
      JSON.stringify([mockArticle]),
      'EX',
      300,
    )
  })
})
