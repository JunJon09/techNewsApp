import { apiClient } from '@/lib/api'

// 毎回リクエスト時にバックエンドから取得する（ビルド時には静的プリレンダリングしない）
export const dynamic = 'force-dynamic'

type Article = {
  id: number
  hnId: number
  title: string
  url: string | null
  score: number
  author: string
  commentCount: number
  fetchedAt: string
}

async function fetchArticles(): Promise<Article[]> {
  const res = await apiClient.api.articles.$get({
    query: { limit: '30', page: '1' },
  })
  if (!res.ok) throw new Error('記事の取得に失敗しました')
  const data = await res.json()
  return data.articles as Article[]
}

function ArticleCard({ article, rank }: { article: Article; rank: number }) {
  const hnUrl = `https://news.ycombinator.com/item?id=${article.hnId}`
  const hostname = article.url
    ? new URL(article.url).hostname.replace(/^www\./, '')
    : null

  return (
    <article
      data-testid="article-card"
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3">
        <span className="text-2xl font-bold text-gray-300 dark:text-gray-700 w-8 text-right shrink-0 mt-0.5">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                {article.title}
              </a>
            ) : (
              article.title
            )}
            {hostname && (
              <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                ({hostname})
              </span>
            )}
          </h2>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-orange-500 font-medium">▲ {article.score}</span>
            <span>by {article.author}</span>
            <a
              href={hnUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 transition-colors"
            >
              💬 {article.commentCount}件のコメント
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

export default async function HomePage() {
  const articles = await fetchArticles()

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <main className="max-w-2xl mx-auto w-full px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          HN Tech News
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {today} &mdash; 今日のトップ記事
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-16">
          今日の記事はまだありません。
          <br />
          深夜0時のバッチ実行後に表示されます。
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} rank={i + 1} />
          ))}
        </div>
      )}
    </main>
  )
}
