'use client';

import { useState, useRef } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Delivery } from '../types/delivery';
import { parseCsvFile, CsvParseResult } from '../utils/csv';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (deliveries: Delivery[], mode: 'add' | 'replace') => void;
}

export default function CsvImportModal({ isOpen, onClose, onImport }: CsvImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [importMode, setImportMode] = useState<'add' | 'replace'>('add');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // ファイルドラッグ処理（C#のDragEnterイベント相当）
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // ファイルドロップ処理（C#のDropイベント相当）
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // ファイル選択処理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // ファイル処理メイン（C#の async Task ProcessFile相当）
  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseResult({
        success: false,
        data: [],
        errors: ['CSVファイルを選択してください'],
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await parseCsvFile(file);
      setParseResult(result);
    } catch (error) {
      setParseResult({
        success: false,
        data: [],
        errors: [`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // インポート実行（C#のSaveChanges相当）
  const handleImport = () => {
    if (parseResult && parseResult.success && parseResult.data.length > 0) {
      onImport(parseResult.data, importMode);
      handleClose();
    }
  };

  // モーダルクローズ処理
  const handleClose = () => {
    setParseResult(null);
    setDragActive(false);
    setImportMode('add');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">CSVインポート</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* ファイルアップロードエリア */}
          {!parseResult && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium mb-2">
                CSVファイルをドラッグ&ドロップ
              </p>
              <p className="text-sm text-gray-500 mb-4">または</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isProcessing}
              >
                {isProcessing ? '処理中...' : 'ファイルを選択'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-4">
                対応形式: CSV (UTF-8, Shift-JIS)
              </p>
            </div>
          )}

          {/* パース結果表示 */}
          {parseResult && (
            <div className="space-y-4">
              {/* 成功/エラーメッセージ */}
              {parseResult.success ? (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-green-800 font-medium">
                    {parseResult.data.length}件のデータを読み込みました
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <span className="text-red-800 font-medium">エラーが発生しました</span>
                  </div>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    {parseResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* インポートモード選択 */}
              {parseResult.success && parseResult.data.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    インポートモード
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="add"
                        checked={importMode === 'add'}
                        onChange={(e) => setImportMode(e.target.value as 'add' | 'replace')}
                        className="mr-2"
                      />
                      <span className="text-sm">追加（既存データに追加）</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={(e) => setImportMode(e.target.value as 'add' | 'replace')}
                        className="mr-2"
                      />
                      <span className="text-sm">上書き（既存データを置換）</span>
                    </label>
                  </div>
                </div>
              )}

              {/* プレビューテーブル */}
              {parseResult.data.length > 0 && (
                <div className="border rounded overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h3 className="font-medium text-sm">プレビュー（最大10件）</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">名前</th>
                          <th className="px-4 py-2 text-left">住所</th>
                          <th className="px-4 py-2 text-left">ステータス</th>
                          <th className="px-4 py-2 text-left">配送日</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.data.slice(0, 10).map((delivery, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-4 py-2">{delivery.id}</td>
                            <td className="px-4 py-2">{delivery.name}</td>
                            <td className="px-4 py-2">{delivery.address}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  delivery.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : delivery.status === 'in_transit'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {delivery.status === 'pending'
                                  ? '未配送'
                                  : delivery.status === 'in_transit'
                                  ? '配送中'
                                  : '配送完了'}
                              </span>
                            </td>
                            <td className="px-4 py-2">{delivery.deliveryDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parseResult.data.length > 10 && (
                    <div className="bg-gray-50 px-4 py-2 border-t text-xs text-gray-600">
                      他 {parseResult.data.length - 10} 件
                    </div>
                  )}
                </div>
              )}

              {/* やり直しボタン */}
              <button
                onClick={() => setParseResult(null)}
                className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                別のファイルを選択
              </button>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleImport}
            disabled={!parseResult || !parseResult.success || parseResult.data.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            インポート実行
          </button>
        </div>
      </div>
    </div>
  );
}