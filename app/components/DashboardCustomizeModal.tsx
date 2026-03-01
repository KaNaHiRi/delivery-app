'use client';

import { useState, useCallback } from 'react';
import { X, GripVertical, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import type { WidgetConfig, DashboardLayout } from '../types/delivery';

interface Props {
  isOpen: boolean;
  widgets: WidgetConfig[];
  layout: DashboardLayout;
  onApply: (widgets: WidgetConfig[], layout: DashboardLayout) => void;
  onClose: () => void;
}

export default function DashboardCustomizeModal({ isOpen, widgets, layout, onApply, onClose }: Props) {
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>([...widgets]);
  const [localLayout, setLocalLayout] = useState<DashboardLayout>(layout);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragItemId, setDragItemId] = useState<string | null>(null);

  // ── C#: チェックボックスの Checked イベントに対応 ──
  const handleToggle = (id: string) => {
    setLocalWidgets(prev =>
      prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    );
  };

  // ── C#: ListBox の DragDrop に対応 ──
  const handleDragStart = (id: string) => setDragItemId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = (targetId: string) => {
    if (!dragItemId || dragItemId === targetId) { setDragOverId(null); return; }
    const arr = [...localWidgets];
    const si = arr.findIndex(w => w.id === dragItemId);
    const ti = arr.findIndex(w => w.id === targetId);
    const [removed] = arr.splice(si, 1);
    arr.splice(ti, 0, removed);
    setLocalWidgets(arr.map((w, i) => ({ ...w, order: i })));
    setDragOverId(null);
  };

  const handleApply = useCallback(() => {
    onApply(localWidgets, localLayout);
    onClose();
  }, [localWidgets, localLayout, onApply, onClose]);

  const handleReset = () => {
    setLocalWidgets([...widgets]);
    setLocalLayout(layout);
  };

  if (!isOpen) return null;

  const enabledCount = localWidgets.filter(w => w.enabled).length;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="customize-modal-title" className="text-xl font-bold">
              ダッシュボードカスタマイズ
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              表示するウィジェットと並び順を変更できます
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* レイアウト選択 */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            列数レイアウト
          </p>
          <div className="flex gap-2">
            {([
              { value: 'grid-2', label: '2列' },
              { value: 'grid-3', label: '3列' },
              { value: 'grid-4', label: '4列' },
            ] as { value: DashboardLayout; label: string }[]).map(opt => (
              <button
                key={opt.value}
                onClick={() => setLocalLayout(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  localLayout === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                aria-pressed={localLayout === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ウィジェット一覧 */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              ウィジェット（{enabledCount}/{localWidgets.length}件表示中）
            </p>
            <span className="text-xs text-gray-400">↕ ドラッグで並び替え</span>
          </div>
          <div className="space-y-2">
            {localWidgets.map(widget => (
              <div
                key={widget.id}
                draggable
                onDragStart={() => handleDragStart(widget.id)}
                onDragEnd={() => setDragOverId(null)}
                onDragOver={e => handleDragOver(e, widget.id)}
                onDrop={() => handleDrop(widget.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-grab active:cursor-grabbing ${
                  dragOverId === widget.id
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                } ${!widget.enabled ? 'opacity-50' : ''}`}
              >
                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-xl" aria-hidden="true">{widget.icon}</span>
                <span className="flex-1 text-sm font-medium">{widget.label}</span>
                <button
                  onClick={() => handleToggle(widget.id)}
                  className={`p-1.5 rounded transition-colors ${
                    widget.enabled
                      ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label={widget.enabled ? `${widget.label}を非表示にする` : `${widget.label}を表示する`}
                  aria-pressed={widget.enabled}
                >
                  {widget.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            適用する
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            リセット
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}