'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="max-w-2xl mx-auto w-full px-4 py-8">
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          記事の取得に失敗しました
        </h2>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">
          バックエンドサーバーが起動しているか確認してください。
        </p>
        <button
          onClick={unstable_retry}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          再試行
        </button>
      </div>
    </main>
  )
}
