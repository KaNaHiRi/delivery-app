'use client';

import { useState, useEffect } from 'react';
import { Activity, X } from 'lucide-react';
import { performanceMonitor, PerformanceMetrics } from '../utils/performance';

export default function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClear = () => {
    performanceMonitor.clearMetrics();
    setMetrics([]);
  };

  const handleLogSummary = () => {
    performanceMonitor.logSummary();
  };

  // 開発環境でのみ表示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 z-50"
        title="パフォーマンスモニター"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  // コンポーネント別の平均レンダリング時間
  const componentNames = Array.from(
    new Set(metrics.map((m) => m.componentName))
  );

  const componentStats = componentNames.map((name) => ({
    name,
    avgTime: performanceMonitor.getAverageRenderTime(name),
    count: metrics.filter((m) => m.componentName === name).length,
  }));

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 border border-gray-200 dark:border-gray-700">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold">パフォーマンスモニター</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 統計 */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {componentStats.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            データがありません
          </p>
        ) : (
          <div className="space-y-3">
            {componentStats.map((stat) => {
              const isSlowRender = stat.avgTime > 16;
              return (
                <div
                  key={stat.name}
                  className={`p-3 rounded-lg ${
                    isSlowRender
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stat.name}</span>
                    {isSlowRender && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        ⚠️ 遅延検出
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    平均: {stat.avgTime.toFixed(2)}ms
                    <span className="mx-2">•</span>
                    レンダリング回数: {stat.count}
                  </div>
                  {/* プログレスバー */}
                  <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isSlowRender ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min((stat.avgTime / 50) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <button
          onClick={handleLogSummary}
          className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
        >
          コンソールに出力
        </button>
        <button
          onClick={handleClear}
          className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
        >
          クリア
        </button>
      </div>

      {/* 説明 */}
      <div className="px-4 pb-4 text-xs text-gray-500">
        <p>※ 16ms以上のレンダリングは警告表示されます（60fps基準）</p>
      </div>
    </div>
  );
}