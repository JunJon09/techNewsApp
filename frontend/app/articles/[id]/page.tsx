import { apiClient } from '@/lib/api'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Keyword = { word: string; meaning: string }

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const res = await apiClient.api.article[':id'].$get({ param: { id } })
  if (!res.ok) notFound()

  const data = await res.json()
  const article = data.article
  if (!article) notFound()

  const keywords = article.keywords as Keyword[] | null

  return (
    <main className="max-w-4xl mx-auto w-full px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {article.title}
      </h1>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        ▲ {article.score} &nbsp;by {article.author}
      </div>

      {/* 元記事 iframe */}
      {article.url && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">元記事</h2>
          <iframe
            src={article.url}
            className="w-full border rounded"
            style={{ height: '60vh' }}
          />
          <p className="mt-2 text-sm text-gray-500">
            表示できない場合は
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline ml-1"
            >
              こちらから元記事を開く →
            </a>
          </p>
        </section>
      )}

      {/* 日本語翻訳 */}
      {article.contentJa ? (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">日本語翻訳</h2>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {article.contentJa}
          </div>
        </section>
      ) : (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">日本語翻訳</h2>
          <p className="text-gray-400 text-sm">翻訳準備中です。</p>
        </section>
      )}

      {/* 難しい単語一覧 */}
      {keywords && keywords.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">難しい単語・イディオム</h2>
          <ul className="space-y-2">
            {keywords.map((kw, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="font-medium text-orange-500 w-40 shrink-0">{kw.word}</span>
                <span className="text-gray-700 dark:text-gray-300">{kw.meaning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
