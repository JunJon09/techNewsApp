import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTopStories } from './hn-client'

// fetch をモック化（実際のAPIを叩かない）
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('fetchTopStories', () => {
  it('ストーリーを取得してフィルタリングする', async () => {
    const mockFetch = vi.mocked(fetch)

    // トップIDリストのレスポンス
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([1, 2, 3]), { status: 200 }),
    )

    // 記事1: 正常なストーリー
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 1, type: 'story', title: 'テスト記事',
          url: 'https://example.com', score: 100,
          by: 'user1', descendants: 10, time: 1700000000,
        }),
        { status: 200 },
      ),
    )

    // 記事2: 削除済み → スキップされる
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ id: 2, type: 'story', deleted: true, time: 1700000000 }),
        { status: 200 },
      ),
    )

    // 記事3: コメント（story以外） → スキップされる
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ id: 3, type: 'comment', time: 1700000000 }),
        { status: 200 },
      ),
    )

    const result = await fetchTopStories(3)

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe(1)
    expect(result[0]?.title).toBe('テスト記事')
  })

  it('APIエラー時に例外を投げる', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }))
    await expect(fetchTopStories()).rejects.toThrow('HN API エラー')
  })
})
