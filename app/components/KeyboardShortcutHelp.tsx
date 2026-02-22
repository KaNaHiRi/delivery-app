'use client';

import { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutItem {
  key: string;
  description: string;
  adminOnly?: boolean;
}

const SHORTCUTS: ShortcutItem[] = [
  { key: 'N', description: '新規登録モーダルを開く', adminOnly: true },
  { key: 'F', description: '検索バーにフォーカス' },
  { key: 'V', description: '仮想スクロール ON/OFF 切替' },
  { key: 'R', description: 'データを手動更新' },
  { key: 'Escape', description: 'モーダル・フィルターを閉じる' },
  { key: '?', description: 'このヘルプを表示' },
];

interface Props {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutHelp({ isOpen, isAdmin, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const visibleShortcuts = SHORTCUTS.filter(s => !s.adminOnly || isAdmin);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-help-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h2 id="shortcut-help-title" className="text-lg font-bold">
              キーボードショートカット
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="ヘルプを閉じる"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          ※ テキスト入力中はショートカットが無効になります
        </p>

        <table className="w-full text-sm" role="table" aria-label="ショートカット一覧">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-24" scope="col">キー</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase" scope="col">動作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {visibleShortcuts.map((s) => (
              <tr key={s.key} role="row">
                <td className="py-2.5" role="cell">
                  <kbd className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 min-w-[2rem]">
                    {s.key}
                  </kbd>
                </td>
                <td className="py-2.5 text-gray-700 dark:text-gray-300" role="cell">
                  {s.description}
                  {s.adminOnly && (
                    <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                      管理者のみ
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}