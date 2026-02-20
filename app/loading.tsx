export default function Loading() {
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4"
      aria-busy="true"
      aria-label="読み込み中"
    >
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">

        {/* ヘッダースケルトン */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-600 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </div>

        {/* 統計カードスケルトン */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5"
            >
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-8 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
          ))}
        </div>

        {/* テーブルスケルトン */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {/* テーブルヘッダー */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
            <div className="h-10 flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl" />
            <div className="h-10 w-32 bg-gray-100 dark:bg-gray-700 rounded-xl" />
            <div className="h-10 w-32 bg-gray-100 dark:bg-gray-700 rounded-xl" />
          </div>

          {/* テーブル行 */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-4"
            >
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 flex-1 bg-gray-100 dark:bg-gray-700 rounded" />
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-600 rounded-full" />
              <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
          ))}

          {/* ページネーション */}
          <div className="p-4 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>

      </div>

      {/* スクリーンリーダー用テキスト */}
      <span className="sr-only">配送データを読み込んでいます...</span>
    </div>
  );
}