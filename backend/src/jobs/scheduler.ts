import { fetchNewsQueue, createFetchNewsWorker } from './fetch-news.job'

// 毎日0時にニュースを取得（Cron式）
const CRON_EVERY_DAY = '0 0 * * *'

export async function startScheduler() {
  // 既存の繰り返しジョブをクリアして再登録
  await fetchNewsQueue.obliterate({ force: true }).catch(() => null)

  await fetchNewsQueue.add(
    'scheduled',
    { limit: 30 },
    { repeat: { pattern: CRON_EVERY_DAY } },
  )

  // 起動直後にも一度実行
  await fetchNewsQueue.add('initial', { limit: 30 })

  const worker = createFetchNewsWorker()

  worker.on('completed', (job, result) => {
    console.log(`[scheduler] ジョブ完了: ${job.name}`, result)
  })

  worker.on('failed', (job, err) => {
    console.error(`[scheduler] ジョブ失敗: ${job?.name}`, err.message)
  })

  console.log('[scheduler] スケジューラー起動 (毎日0時)')
  return worker
}
