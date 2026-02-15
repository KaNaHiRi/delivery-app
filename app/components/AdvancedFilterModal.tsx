'use client';

import { useState, useEffect } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { AdvancedFilters } from '../types/delivery';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
}

export default function AdvancedFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
}: AdvancedFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  // ★★★ 追加: モーダルが開いたときにfiltersを同期 ★★★
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      statuses: [],
      dateRange: null,
      addressKeyword: '',
      nameKeyword: '',
    });
  };

  const toggleStatus = (status: 'pending' | 'in_transit' | 'completed') => {
    setLocalFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              詳細フィルター
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* ステータス選択 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ステータス（複数選択可）
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'pending' as const, label: '配送前', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
                { value: 'in_transit' as const, label: '配送中', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
                { value: 'completed' as const, label: '完了', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => toggleStatus(value)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    localFilters.statuses.includes(value)
                      ? `${color} ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                  {localFilters.statuses.includes(value) && ' ✓'}
                </button>
              ))}
            </div>
          </div>

          {/* 日付範囲 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              配送日の範囲
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={localFilters.dateRange?.startDate || ''}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  setLocalFilters(prev => ({
                    ...prev,
                    dateRange: newStartDate
                      ? {
                          startDate: newStartDate,
                          endDate: prev.dateRange?.endDate || newStartDate,
                        }
                      : null,
                  }));
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-500 dark:text-gray-400">〜</span>
              <input
                type="date"
                value={localFilters.dateRange?.endDate || ''}
                onChange={(e) => {
                  const newEndDate = e.target.value;
                  setLocalFilters(prev => ({
                    ...prev,
                    dateRange: newEndDate
                      ? {
                          startDate: prev.dateRange?.startDate || newEndDate,
                          endDate: newEndDate,
                        }
                      : null,
                  }));
                }}
                min={localFilters.dateRange?.startDate}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {localFilters.dateRange && (
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, dateRange: null }))}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="日付範囲をクリア"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* 名前検索 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              配送先名
            </label>
            <input
              type="text"
              value={localFilters.nameKeyword}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, nameKeyword: e.target.value }))}
              placeholder="配送先名で検索..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* 住所検索 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              住所
            </label>
            <input
              type="text"
              value={localFilters.addressKeyword}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, addressKeyword: e.target.value }))}
              placeholder="住所で検索（例: 東京、渋谷区）..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            リセット
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              適用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}