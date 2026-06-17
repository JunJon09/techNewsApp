import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchArticleContent } from './jina-client'

// fetch をモック化（実際のAPIを叩かない）
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('fetchArticleContent', () => {
  it('URLを指定してJinaに正しいレスポンスが返される', async () => {
    const mockFetch = vi.mocked(fetch)

    // 記事1: 正常なストーリー
    mockFetch.mockResolvedValueOnce(
      new Response('# Title', { status: 200 })
    )

    const result = await fetchArticleContent('https://www.google.com/')

    expect(result).toBe('# Title')
  })

  it('APIエラー時に例外を投げる', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }))
    const result = await fetchArticleContent('https://example.com')
    expect(result).toBeNull()
  })
})
