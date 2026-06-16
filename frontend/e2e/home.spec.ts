import { test, expect } from '@playwright/test'

test('トップページが正常に表示される', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'HN Tech News' })).toBeVisible()
})

test('記事カードまたは空メッセージが表示される', async ({ page }) => {
  await page.goto('/')

  const cards = page.getByTestId('article-card')
  const emptyMsg = page.getByText('今日の記事はまだありません')

  // どちらか一方が表示されていること
  const cardCount = await cards.count()
  if (cardCount > 0) {
    await expect(cards.first()).toBeVisible()
  } else {
    await expect(emptyMsg).toBeVisible()
  }
})

test('記事がある場合はスコアと著者が表示される', async ({ page }) => {
  await page.goto('/')

  const cards = page.getByTestId('article-card')
  const cardCount = await cards.count()
  if (cardCount === 0) {
    test.skip()
    return
  }

  const firstCard = cards.first()
  // ▲ スコアが含まれることを確認
  await expect(firstCard.getByText(/▲/)).toBeVisible()
  // by 著者名が含まれることを確認
  await expect(firstCard.getByText(/by /)).toBeVisible()
})
