'use client';

import { useState, useRef } from 'react';
import { X, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import type { Delivery } from '../types/delivery';

interface BackupData {
  deliveries: Delivery[];
  filters?: {
    searchTerm: string;
    statusFilter: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  theme?: string;
  timestamp: string;
  version: string;
}

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveries: Delivery[];
  onRestore: (deliveries: Delivery[]) => void;
}

export default function BackupRestoreModal({
  isOpen,
  onClose,
  deliveries,
  onRestore,
}: BackupRestoreModalProps) {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<BackupData | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // バックアップ実行
  const handleBackup = () => {
    try {
      setError('');
      setSuccess('');

      // LocalStorageから全データを取得
      const filtersData = localStorage.getItem('delivery_app_filters');
      const themeData = localStorage.getItem('theme');

      const backupData: BackupData = {
        deliveries: deliveries,
        filters: filtersData ? JSON.parse(filtersData) : undefined,
        theme: themeData || undefined,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };

      // JSON文字列に変換（整形あり）
      const jsonString = JSON.stringify(backupData, null, 2);

      // Blobオブジェクト作成
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // タイムスタンプ付きファイル名生成
      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/[-:]/g, '')
        .replace('T', '_')
        .split('.')[0];
      const filename = `delivery_backup_${timestamp}.json`;

      // ダウンロード実行
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(`バックアップファイル「${filename}」をダウンロードしました`);
    } catch (err) {
      setError('バックアップの作成に失敗しました: ' + (err as Error).message);
    }
  };

  // ファイル選択ハンドラー
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  // ドラッグ&ドロップハンドラー
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setError('JSONファイルを選択してください');
        return;
      }
      readFile(file);
    }
  };

  // ファイル読み込み
  const readFile = (file: File) => {
    setError('');
    setSuccess('');
    setPreviewData(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as BackupData;

        // データ検証
        validateBackupData(data);

        // プレビュー表示
        setPreviewData(data);
        setSuccess('バックアップファイルを読み込みました');
      } catch (err) {
        setError('ファイルの読み込みに失敗しました: ' + (err as Error).message);
      }
    };

    reader.onerror = () => {
      setError('ファイルの読み込みに失敗しました');
    };

    reader.readAsText(file);
  };

  // データ検証
  const validateBackupData = (data: BackupData) => {
    // 必須項目チェック
    if (!data.deliveries || !Array.isArray(data.deliveries)) {
      throw new Error('配送データが見つかりません');
    }

    if (!data.timestamp || !data.version) {
      throw new Error('バックアップファイルの形式が不正です');
    }

    // 各配送データの検証
    data.deliveries.forEach((delivery, index) => {
      if (!delivery.id || !delivery.name || !delivery.address || !delivery.status || !delivery.deliveryDate) {
        throw new Error(`行 ${index + 1}: 必須項目が不足しています`);
      }

      if (!['pending', 'in_transit', 'completed'].includes(delivery.status)) {
        throw new Error(`行 ${index + 1}: ステータスが不正です (${delivery.status})`);
      }

      // 日付形式チェック
      if (isNaN(Date.parse(delivery.deliveryDate))) {
        throw new Error(`行 ${index + 1}: 配送日の形式が不正です (${delivery.deliveryDate})`);
      }
    });
  };

  // リストア実行
  const handleRestore = () => {
    if (!previewData) {
      setError('リストアするデータがありません');
      return;
    }

    try {
      setError('');
      setSuccess('');

      // 配送データを復元
      onRestore(previewData.deliveries);

      // フィルター設定を復元
      if (previewData.filters) {
        localStorage.setItem('delivery_app_filters', JSON.stringify(previewData.filters));
      }

      // テーマ設定を復元
      if (previewData.theme) {
        localStorage.setItem('theme', previewData.theme);
        // テーマを即座に適用
        if (previewData.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      setSuccess(`${previewData.deliveries.length}件のデータを復元しました`);
      setPreviewData(null);

      // 2秒後にモーダルを閉じる
      setTimeout(() => {
        onClose();
        // ページをリロードして全設定を反映
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError('データの復元に失敗しました: ' + (err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            バックアップ / リストア
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'backup'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            バックアップ
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'restore'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            リストア
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* エラー・成功メッセージ */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}

          {/* バックアップタブ */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  バックアップ内容
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• 配送データ: {deliveries.length}件</li>
                  <li>• フィルター設定</li>
                  <li>• テーマ設定（ライト/ダーク）</li>
                  <li>• タイムスタンプ情報</li>
                </ul>
              </div>

              <button
                onClick={handleBackup}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                バックアップファイルをダウンロード
              </button>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                ファイル形式: JSON（タイムスタンプ付き）
              </p>
            </div>
          )}

          {/* リストアタブ */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              {/* ファイルアップロードエリア */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  バックアップファイルをドラッグ&ドロップ
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  または
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  ファイルを選択
                </button>
              </div>

              {/* プレビュー表示 */}
              {previewData && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    プレビュー
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">配送データ件数:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {previewData.deliveries.length}件
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">バックアップ日時:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(previewData.timestamp).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">バージョン:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {previewData.version}
                      </span>
                    </div>
                    {previewData.theme && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">テーマ設定:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {previewData.theme === 'dark' ? 'ダーク' : 'ライト'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* サンプルデータ表示 */}
                  {previewData.deliveries.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        最初の3件のデータ:
                      </p>
                      <div className="space-y-1 text-xs">
                        {previewData.deliveries.slice(0, 3).map((delivery, index) => (
                          <div
                            key={index}
                            className="text-gray-700 dark:text-gray-300 truncate"
                          >
                            {index + 1}. {delivery.name} - {delivery.address} ({delivery.status})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* リストアボタン */}
                  <button
                    onClick={handleRestore}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    データを復元（現在のデータは上書きされます）
                  </button>
                </div>
              )}

              {/* 注意事項 */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 text-sm">
                  ⚠️ 注意事項
                </h4>
                <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>• リストアを実行すると、現在のデータは完全に上書きされます</li>
                  <li>• 復元後、ページは自動的にリロードされます</li>
                  <li>• バックアップファイルはJSON形式である必要があります</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}