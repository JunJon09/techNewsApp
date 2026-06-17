import { describe, it, expect, vi } from 'vitest'
import { enrichArticle } from './openai-client'

// vi.mock より先に評価されるよう vi.hoisted で定義する
const mockCreate = vi.hoisted(() => vi.fn())

// openai モジュール全体をモック化（クラスとして定義することでnewに対応）
vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: mockCreate,
      },
    }
  },
}))

describe('enrichArticle', () => {
  it('翻訳と単語一覧を返す', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              translation: 'これはテスト記事です',
              keywords: [{ word: 'concurrent', meaning: '並行の' }],
            }),
          },
        },
      ],
    })

    const result = await enrichArticle('This is a test article.')

    expect(result).not.toBeNull()
    expect(result?.translation).toBe('これはテスト記事です')
    expect(result?.keywords).toHaveLength(1)
    expect(result?.keywords[0]?.word).toBe('concurrent')
  })

  it('レスポンスが空の場合nullを返す', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
    })

    const result = await enrichArticle('This is a test article.')
    expect(result).toBeNull()
  })

  it('APIエラー時にnullを返す', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API Error'))

    const result = await enrichArticle('This is a test article.')
    expect(result).toBeNull()
  })
})
