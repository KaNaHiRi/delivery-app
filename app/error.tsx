'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーログ（実務ではSentryなどに送信）
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        {/* アイコン */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
          </div>
        </div>

        {/* タイトル */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          エラーが発生しました
        </h1>

        {/* メッセージ */}
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          申し訳ありません。予期しないエラーが発生しました。
        </p>

        {/* エラー詳細（開発時のみ表示） */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              エラー詳細（開発環境のみ）
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="ページを再読み込みする"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            再試行
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="トップページに戻る"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            トップへ戻る
          </button>
        </div>

        {/* サポート情報 */}
        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          問題が続く場合は、ブラウザのキャッシュをクリアしてください。
          {error.digest && (
            <span className="block mt-1">エラーID: {error.digest}</span>
          )}
        </p>
      </div>
    </div>
  );
}