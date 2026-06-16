function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-8 h-6 bg-gray-200 dark:bg-gray-800 rounded shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded w-1/2 mt-1" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <main className="max-w-2xl mx-auto w-full px-4 py-8">
      <header className="mb-6">
        <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded w-40 animate-pulse" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800/60 rounded w-56 mt-2 animate-pulse" />
      </header>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </main>
  )
}
