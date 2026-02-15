'use client';

import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Delivery } from '../types/delivery';
import { exportToCSV } from '../utils/csv';
import { exportToExcel } from '../utils/excel';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveries: Delivery[];
  filteredDeliveries: Delivery[];
  selectedIds: Set<string>;
}

type ExportScope = 'all' | 'filtered' | 'selected';
type FileFormat = 'csv' | 'excel';

export default function CsvExportModal({
  isOpen,
  onClose,
  deliveries,
  filteredDeliveries,
  selectedIds
}: CsvExportModalProps) {
  const [exportScope, setExportScope] = useState<ExportScope>('filtered');
  const [fileFormat, setFileFormat] = useState<FileFormat>('csv');
  const [encoding, setEncoding] = useState<'utf8' | 'sjis'>('utf8');
  const [delimiter, setDelimiter] = useState<'comma' | 'tab'>('comma');
  const [includeBOM, setIncludeBOM] = useState(true);

  if (!isOpen) return null;

  // エクスポート対象のデータを取得
  const getExportData = (): Delivery[] => {
    switch (exportScope) {
      case 'all':
        return deliveries;
      case 'filtered':
        return filteredDeliveries;
      case 'selected':
        return deliveries.filter(d => selectedIds.has(d.id));
      default:
        return [];
    }
  };

  // エクスポート実行
  const handleExport = () => {
    const data = getExportData();
    
    if (data.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    if (fileFormat === 'csv') {
      // CSV出力
      exportToCSV(data, {
        encoding,
        delimiter,
        includeBOM,
        filename: 'deliveries'
      });
    } else {
      // Excel出力
      exportToExcel(data, 'deliveries');
    }
    
    onClose();
  };

  // 件数表示
  const exportCount = getExportData().length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            データエクスポート
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-4">
          {/* ファイル形式選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ファイル形式
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFileFormat('csv')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  fileFormat === 'csv'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">CSV</span>
              </button>
              <button
                onClick={() => setFileFormat('excel')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  fileFormat === 'excel'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="font-medium">Excel</span>
              </button>
            </div>
          </div>

          {/* エクスポート範囲選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              エクスポート範囲
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={exportScope === 'all'}
                  onChange={(e) => setExportScope(e.target.value as ExportScope)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">全データ</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {deliveries.length}件
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                <input
                  type="radio"
                  name="scope"
                  value="filtered"
                  checked={exportScope === 'filtered'}
                  onChange={(e) => setExportScope(e.target.value as ExportScope)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    フィルター済みデータ
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredDeliveries.length}件
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                <input
                  type="radio"
                  name="scope"
                  value="selected"
                  checked={exportScope === 'selected'}
                  onChange={(e) => setExportScope(e.target.value as ExportScope)}
                  className="mr-3"
                  disabled={selectedIds.size === 0}
                />
                <div className="flex-1">
                  <div className={`font-medium ${selectedIds.size === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                    選択したデータ
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedIds.size}件
                    {selectedIds.size === 0 && ' (データを選択してください)'}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* CSV固有の設定 */}
          {fileFormat === 'csv' && (
            <>
              {/* 文字コード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文字コード
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                    <input
                      type="radio"
                      name="encoding"
                      value="utf8"
                      checked={encoding === 'utf8'}
                      onChange={(e) => setEncoding(e.target.value as 'utf8' | 'sjis')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">UTF-8</span>
                  </label>
                  <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                    <input
                      type="radio"
                      name="encoding"
                      value="sjis"
                      checked={encoding === 'sjis'}
                      onChange={(e) => setEncoding(e.target.value as 'utf8' | 'sjis')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">Shift-JIS</span>
                  </label>
                </div>
              </div>

              {/* 区切り文字 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  区切り文字
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                    <input
                      type="radio"
                      name="delimiter"
                      value="comma"
                      checked={delimiter === 'comma'}
                      onChange={(e) => setDelimiter(e.target.value as 'comma' | 'tab')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">カンマ (,)</span>
                  </label>
                  <label className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                    <input
                      type="radio"
                      name="delimiter"
                      value="tab"
                      checked={delimiter === 'tab'}
                      onChange={(e) => setDelimiter(e.target.value as 'comma' | 'tab')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">タブ (\t)</span>
                  </label>
                </div>
              </div>

              {/* BOM */}
              <div>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                  <input
                    type="checkbox"
                    checked={includeBOM}
                    onChange={(e) => setIncludeBOM(e.target.checked)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">BOMを付与</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Excelで開く場合は推奨
                    </div>
                  </div>
                </label>
              </div>
            </>
          )}

          {/* Excel固有の説明 */}
          {fileFormat === 'excel' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-300">
                  <div className="font-medium mb-1">Excel形式の特徴</div>
                  <ul className="space-y-1 text-xs">
                    <li>• スタイル付き出力（ヘッダー装飾、罫線）</li>
                    <li>• 2シート構成（データ + 統計サマリー）</li>
                    <li>• 列幅自動調整</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {exportCount}件をエクスポート
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleExport}
              disabled={exportCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              エクスポート
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}