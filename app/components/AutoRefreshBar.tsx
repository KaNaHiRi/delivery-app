'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Pause, Play } from 'lucide-react';
import { useAutoRefresh, REFRESH_INTERVALS } from '../hooks/useAutoRefresh';

interface AutoRefreshBarProps {
  onRefresh: () => void;
}

export default function AutoRefreshBar({ onRefresh }: AutoRefreshBarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { config, lastRefreshed, toggle, setInterval, manualRefresh } =
    useAutoRefresh(onRefresh);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
      role="region"
      aria-label="自動更新設定"
    >
      {/* 手動更新ボタン */}
      <button
        onClick={manualRefresh}
        className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        aria-label="今すぐ更新"
        title="今すぐ更新"
      >
        <RefreshCw size={14} className={config.enabled ? 'animate-spin' : ''} />
        <span>更新</span>
      </button>

      {/* 間隔選択 */}
      <select
        value={config.interval}
        onChange={e => setInterval(Number(e.target.value))}
        className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="更新間隔"
      >
        {REFRESH_INTERVALS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}ごと
          </option>
        ))}
      </select>

      {/* ON/OFFトグル */}
      <button
        onClick={toggle}
        className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
          config.enabled
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        aria-pressed={config.enabled}
        aria-label={config.enabled ? '自動更新を停止' : '自動更新を開始'}
      >
        {config.enabled ? <Pause size={14} /> : <Play size={14} />}
        <span>{config.enabled ? '自動更新中' : '自動更新'}</span>
      </button>

      {/* 最終更新時刻 */}
      {lastRefreshed && (
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          最終更新: {formatTime(lastRefreshed)}
        </span>
      )}
    </div>
  );
}