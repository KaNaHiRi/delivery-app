'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2, Filter } from 'lucide-react';
import { FilterPreset, AdvancedFilters } from '../types/delivery';
import { formatFilterDescriptionArray } from '../utils/filters';

interface FilterPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: FilterPreset[];
  currentFilters: AdvancedFilters;
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: FilterPreset) => void;
  onDeletePreset: (id: string) => void;
}

export default function FilterPresetsModal({
  isOpen,
  onClose,
  presets,
  currentFilters,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
}: FilterPresetsModalProps) {
  const [presetName, setPresetName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  // モーダルが閉じたときにフォームをリセット
  useEffect(() => {
    if (!isOpen) {
      setPresetName('');
      setShowSaveForm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (presetName.trim() === '') {
      alert('プリセット名を入力してください');
      return;
    }
    onSavePreset(presetName.trim());
    setPresetName('');
    setShowSaveForm(false);
  };

  const handleLoad = (preset: FilterPreset) => {
    onLoadPreset(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              フィルタープリセット
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 現在のフィルター保存 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              現在のフィルター条件を保存
            </h3>
            {!showSaveForm ? (
              <button
                onClick={() => setShowSaveForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                新規プリセットとして保存
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="プリセット名を入力（例: 東京エリア配送中）"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveForm(false);
                      setPresetName('');
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
                {/* 現在のフィルター内容プレビュー */}
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">保存される条件:</p>
                  {formatFilterDescriptionArray(currentFilters).map((desc, idx) => (
                    <p key={idx} className="text-sm text-gray-900 dark:text-white">• {desc}</p>
                  ))}
                  {formatFilterDescriptionArray(currentFilters).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">フィルター条件なし</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 保存済みプリセット一覧 */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              保存済みプリセット ({presets.length}件)
            </h3>
            {presets.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                プリセットが保存されていません
              </p>
            ) : (
              <div className="space-y-3">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {preset.name}
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoad(preset)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          適用
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`プリセット「${preset.name}」を削除しますか?`)) {
                              onDeletePreset(preset.id);
                            }
                          }}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {formatFilterDescriptionArray(preset.filters).map((desc, idx) => (
                        <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                          • {desc}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      作成日時: {new Date(preset.createdAt).toLocaleString('ja-JP')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}