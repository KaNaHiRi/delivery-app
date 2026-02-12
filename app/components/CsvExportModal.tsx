// app/components/CsvExportModal.tsx
'use client';

import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { Delivery } from '../types/delivery';
import { downloadCSV, generateCsvFilename, CsvExportOptions } from '../utils/csv';

interface CsvExportModalProps {
  deliveries: Delivery[];
  filteredDeliveries: Delivery[];
  selectedIds: Set<string>;
  onClose: () => void;
}

export default function CsvExportModal({
  deliveries,
  filteredDeliveries,
  selectedIds,
  onClose,
}: CsvExportModalProps) {
  const [exportType, setExportType] = useState<'all' | 'filtered' | 'selected'>('all');
  const [encoding, setEncoding] = useState<'utf-8' | 'shift-jis'>('utf-8');
  const [delimiter, setDelimiter] = useState<'comma' | 'tab'>('comma');
  const [withBOM, setWithBOM] = useState(true);

  const handleExport = () => {
    let dataToExport: Delivery[] = [];

    switch (exportType) {
      case 'all':
        dataToExport = deliveries;
        break;
      case 'filtered':
        dataToExport = filteredDeliveries;
        break;
      case 'selected':
        dataToExport = deliveries.filter(d => selectedIds.has(d.id));
        break;
    }

    if (dataToExport.length === 0) {
      alert('出力するデータがありません');
      return;
    }

    const options: CsvExportOptions = {
      encoding,
      delimiter,
      includeBOM: withBOM,
    };

    const filename = generateCsvFilename('deliveries');
    downloadCSV(dataToExport, filename, options);

    onClose();
  };

  const getExportCount = () => {
    switch (exportType) {
      case 'all':
        return deliveries.length;
      case 'filtered':
        return filteredDeliveries.length;
      case 'selected':
        return selectedIds.size;
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CSV出力</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 出力範囲選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              出力範囲
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value as 'all')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  全てのデータ ({deliveries.length}件)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="filtered"
                  checked={exportType === 'filtered'}
                  onChange={(e) => setExportType(e.target.value as 'filtered')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  フィルター済みデータ ({filteredDeliveries.length}件)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="selected"
                  checked={exportType === 'selected'}
                  onChange={(e) => setExportType(e.target.value as 'selected')}
                  disabled={selectedIds.size === 0}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className={`ml-2 text-sm ${selectedIds.size === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  選択したデータ ({selectedIds.size}件)
                </span>
              </label>
            </div>
          </div>

          {/* 文字コード設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              文字コード
            </label>
            <select
              value={encoding}
              onChange={(e) => setEncoding(e.target.value as 'utf-8' | 'shift-jis')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="utf-8">UTF-8</option>
              <option value="shift-jis">Shift-JIS</option>
            </select>
          </div>

          {/* 区切り文字設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              区切り文字
            </label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as 'comma' | 'tab')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="comma">カンマ (,)</option>
              <option value="tab">タブ</option>
            </select>
          </div>

          {/* BOMオプション */}
          {encoding === 'utf-8' && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={withBOM}
                  onChange={(e) => setWithBOM(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  BOM付きで出力（Excel互換性向上）
                </span>
              </label>
            </div>
          )}

          {/* プレビュー情報 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{getExportCount()}件</strong>のデータを出力します
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              ファイル名: {generateCsvFilename('deliveries')}
            </p>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              CSV出力
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white py-2 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}