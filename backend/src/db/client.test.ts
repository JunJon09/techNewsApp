import { describe, it, expect, afterAll } from 'vitest'
import { sql } from 'drizzle-orm'
import { db } from './client'
import postgres from 'postgres'

// テスト後にDB接続を閉じる
afterAll(async () => {
  await (db.$client as ReturnType<typeof postgres>).end()
})

describe('DB接続', () => {
  it('SELECT 1 が通る', async () => {
    const result = await db.execute(sql`SELECT 1 AS ok`)
    expect(result[0]?.ok).toBe(1)
  })
})
