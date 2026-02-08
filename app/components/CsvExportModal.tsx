'use client';

import { useState } from 'react';
import { X, Download, Settings } from 'lucide-react';
import type {
  CsvExportOptions,
  CsvEncoding,
  CsvDelimiter,
} from '../utils/csv';
import { DEFAULT_CSV_OPTIONS } from '../utils/csv';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: CsvExportOptions) => void;
  recordCount: number;
  exportType: 'all' | 'filtered' | 'selected';
}

export default function CsvExportModal({
  isOpen,
  onClose,
  onExport,
  recordCount,
  exportType,
}: CsvExportModalProps) {
  const [options, setOptions] = useState<CsvExportOptions>(DEFAULT_CSV_OPTIONS);

  if (!isOpen) return null;

  const exportTypeText = {
    all: '全データ',
    filtered: 'フィルター済みデータ',
    selected: '選択したデータ',
  };

  const handleExport = () => {
    onExport(options);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">CSV出力設定</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* 出力対象情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{exportTypeText[exportType]}</span>
              を出力します
            </p>
            <p className="text-sm text-blue-600 mt-1">
              対象レコード数: {recordCount}件
            </p>
          </div>

          {/* 文字コード設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文字コード
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="encoding"
                  value="utf-8"
                  checked={options.encoding === 'utf-8'}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      encoding: e.target.value as CsvEncoding,
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">UTF-8 (推奨)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="encoding"
                  value="shift-jis"
                  checked={options.encoding === 'shift-jis'}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      encoding: e.target.value as CsvEncoding,
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Shift-JIS (Excel互換)</span>
              </label>
            </div>
          </div>

          {/* 区切り文字設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              区切り文字
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delimiter"
                  value="comma"
                  checked={options.delimiter === 'comma'}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      delimiter: e.target.value as CsvDelimiter,
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">カンマ (,)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delimiter"
                  value="tab"
                  checked={options.delimiter === 'tab'}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      delimiter: e.target.value as CsvDelimiter,
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">タブ (\t)</span>
              </label>
            </div>
          </div>

          {/* BOM設定 (UTF-8の場合のみ表示) */}
          {options.encoding === 'utf-8' && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeBOM}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      includeBOM: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">
                  BOMを付与する (Excel互換性向上)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Excelで文字化けを防ぐため、推奨設定です
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex gap-3 p-6 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            ダウンロード
          </button>
        </div>
      </div>
    </div>
  );
}