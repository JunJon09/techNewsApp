import { describe, it, expect } from 'vitest'
import app from './index'

describe('ヘルスチェック', () => {
  it('GET /health が 200 を返す', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)

    const body = await res.json() as { status: string; timestamp: string }
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeDefined()
  })
})
