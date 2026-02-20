'use client';

import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Delivery } from '../types/delivery';
import { parseCSV } from '../utils/csv';

interface CsvImportModalProps {
  onClose: () => void;
  onImportComplete: (deliveries: Delivery[], mode: 'add' | 'overwrite') => void;
}

export default function CsvImportModal({ onClose, onImportComplete }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<Delivery[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'add' | 'overwrite'>('add');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');

  // ファイル読み込み処理
  const handleFileRead = async (selectedFile: File) => {
    try {
      const text = await selectedFile.text();
      const result = parseCSV(text);
      
      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }
      
      if (result.data.length === 0) {
        setErrors(['CSVファイルが空です']);
        return;
      }

      setPreviewData(result.data);
      setErrors([]);
      setStep('preview');
    } catch (error) {
      setErrors(['CSVファイルの読み込みに失敗しました']);
      console.error(error);
    }
  };

  // ファイル選択ハンドラ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleFileRead(selectedFile);
    }
  };

  // ドラッグ&ドロップハンドラ
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      handleFileRead(droppedFile);
    } else {
      setErrors(['CSVファイルを選択してください']);
    }
  };

  // インポート実行
  const handleImport = () => {
    if (previewData.length > 0) {
      onImportComplete(previewData, importMode);
    }
  };

  // リセット
  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setStep('upload');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            CSVインポート
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {step === 'upload' ? (
            <>
              {/* ファイルアップロードエリア */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  CSVファイルをドラッグ&ドロップ
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  または
                </p>
                <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  ファイルを選択
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* CSV形式の説明 */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <div className="font-medium mb-1">CSVファイルの形式</div>
                    <div className="text-xs space-y-1">
                      <div>• ヘッダー行: ID,名前,住所,ステータス,配送日</div>
                      <div>• ステータス: pending / in_transit / completed（または 配送前/配送中/配送完了）</div>
                      <div>• 配送日: YYYY-MM-DD 形式（例: 2024-01-15）</div>
                      <div className="text-blue-600 dark:text-blue-400 mt-2">※ IDは省略可（自動生成されます）</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* エラー表示 */}
              {errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-red-800 dark:text-red-300 mb-2">
                        エラーが発生しました
                      </div>
                      <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* プレビュー */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {previewData.length}件のデータを読み込みました
                  </span>
                </div>

                {/* インポートモード選択 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    インポート方法
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                      <input
                        type="radio"
                        name="mode"
                        value="add"
                        checked={importMode === 'add'}
                        onChange={(e) => setImportMode(e.target.value as 'add' | 'overwrite')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          既存データに追加
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          既存のデータを保持したまま、新しいデータを追加します
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600">
                      <input
                        type="radio"
                        name="mode"
                        value="overwrite"
                        checked={importMode === 'overwrite'}
                        onChange={(e) => setImportMode(e.target.value as 'add' | 'overwrite')}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          既存データを上書き
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          既存のデータをすべて削除して、新しいデータに置き換えます
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* データプレビュー */}
                <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            名前
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            住所
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            ステータス
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            配送日
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {previewData.slice(0, 10).map((delivery, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                              {delivery.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {delivery.address}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                delivery.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : delivery.status === 'in_transit'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              }`}>
                                {delivery.status === 'pending' ? '配送前' : 
                                 delivery.status === 'in_transit' ? '配送中' : '完了'}
                              </span>
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
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center">
                      他 {previewData.length - 10} 件
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          {step === 'preview' && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              戻る
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          {step === 'preview' && (
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              インポート実行
            </button>
          )}
        </div>
      </div>
    </div>
  );
}