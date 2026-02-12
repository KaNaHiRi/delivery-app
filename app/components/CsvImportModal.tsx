// app/components/CsvImportModal.tsx
'use client';

import { useState, useRef } from 'react';
import { X, Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Delivery } from '../types/delivery';
import { parseCsvFile } from '../utils/csv';

interface CsvImportModalProps {
  onClose: () => void;
  onImportComplete: (deliveries: Delivery[], mode: 'add' | 'overwrite') => void;
}

export default function CsvImportModal({ onClose, onImportComplete }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Delivery[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'add' | 'overwrite'>('add');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrors([]);
    setPreviewData([]);

    try {
      const result = await parseCsvFile(selectedFile);
      
      if (!result.success) {
        setErrors(result.errors);
      }
      
      setPreviewData(result.data);
    } catch (error) {
      setErrors(['CSVファイルの読み込みに失敗しました。ファイル形式を確認してください。']);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      handleFileSelect(droppedFile);
    } else {
      setErrors(['CSVファイルを選択してください']);
    }
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      alert('インポートするデータがありません');
      return;
    }

    if (errors.length > 0) {
      if (!confirm('エラーがあるデータは無視されます。続行しますか？')) {
        return;
      }
    }

    onImportComplete(previewData, importMode);
    onClose();
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '配送待ち',
      in_transit: '配送中',
      completed: '完了'
    };
    return labels[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-colors">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CSVインポート</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* ファイル選択エリア */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CSVファイル選択
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
              />
              
              {file ? (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <FileText className="w-8 h-8" />
                  <span className="font-medium">{file.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    CSVファイルをドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">または</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    ファイルを選択
                  </button>
                </>
              )}
            </div>
          </div>

          {/* インポートモード選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              インポートモード
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="add"
                  checked={importMode === 'add'}
                  onChange={(e) => setImportMode(e.target.value as 'add')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  既存データに追加（推奨）
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="overwrite"
                  checked={importMode === 'overwrite'}
                  onChange={(e) => setImportMode(e.target.value as 'overwrite')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  既存データを上書き（全削除して置き換え）
                </span>
              </label>
            </div>
          </div>

          {/* エラー表示 */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    エラーが見つかりました
                  </h3>
                  <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 max-h-32 overflow-y-auto">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* プレビュー */}
          {previewData.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  プレビュー（{previewData.length}件のデータをインポート可能）
                </h3>
              </div>
              
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          配送先名
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          住所
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          ステータス
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          配送予定日
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {previewData.slice(0, 10).map((delivery, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {delivery.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {delivery.address}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {getStatusLabel(delivery.status)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {delivery.deliveryDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 10 && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    他 {previewData.length - 10} 件のデータ
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CSV形式の説明 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              CSV形式の要件
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• ヘッダー行: ID,氏名,住所,ステータス,配送日</li>
              <li>• ステータス: 未配送 / 配送中 / 配送完了</li>
              <li>• 日付形式: YYYY-MM-DD（例: 2024-12-25）</li>
              <li>• 文字コード: UTF-8 または Shift-JIS</li>
            </ul>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleImport}
              disabled={previewData.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              インポート実行
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