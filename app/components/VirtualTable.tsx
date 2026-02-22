'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Delivery } from '@/app/types/delivery';

// C# WPF の GridViewColumn 定義に相当
interface Column {
  key: string;
  header: string;
  width: string;
  render: (delivery: Delivery) => React.ReactNode;
}

interface VirtualTableProps {
  deliveries: Delivery[];
  isAdmin: boolean;
  onStatusChange: (id: string, status: Delivery['status']) => void;
  onEdit: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
  onPrint: (delivery: Delivery) => void;
}

// ステータスのスタイルマップ
const STATUS_STYLES: Record<Delivery['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const STATUS_LABELS: Record<Delivery['status'], string> = {
  pending: '未配送',
  in_transit: '配送中',
  completed: '配送完了',
};

// 行の高さ（固定値 - WPFのItemHeight相当）
const ROW_HEIGHT = 56;

export const VirtualTable = React.memo(function VirtualTable({
  deliveries,
  isAdmin,
  onStatusChange,
  onEdit,
  onDelete,
  onPrint,
}: VirtualTableProps) {
  // スクロールコンテナのref（WPFのScrollViewer相当）
  const parentRef = useRef<HTMLDivElement>(null);

  // useVirtualizer: WPFのVirtualizingStackPanelに相当
  // C#: panel.Children には見えている要素のみ存在
  // React: virtualRows には見えている行のみ存在
  const rowVirtualizer = useVirtualizer({
    count: deliveries.length,           // 総件数（C#: ItemsSource.Count）
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,     // 1行の高さ推定（C#: ItemHeight）
    overscan: 5,                        // 画面外にも余分にレンダリング（スクロール時のちらつき防止）
  });

  // 総仮想高さ（スクロールバーを正しく表示するために必要）
  // C#: VirtualizingPanel が内部で計算する値に相当
  const totalSize = rowVirtualizer.getTotalSize();

  // 現在レンダリングが必要な行のみ
  const virtualRows = rowVirtualizer.getVirtualItems();

  const handleStatusChange = useCallback(
    (id: string, value: string) => {
      onStatusChange(id, value as Delivery['status']);
    },
    [onStatusChange]
  );

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        データがありません
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 件数表示 */}
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {deliveries.length.toLocaleString()}件
        </span>
        <span>を仮想スクロールで表示</span>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
          レンダリング中: {virtualRows.length}行
        </span>
      </div>

      {/* テーブルヘッダー（固定） */}
      <div className="rounded-t-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
              <th className="w-36 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">名前</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">住所</th>
              <th className="w-36 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">配達日</th>
              <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ステータス</th>
              <th className="w-44 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
            </tr>
          </thead>
        </table>

        {/* スクロール可能なボディ */}
        {/* C#: ScrollViewer の ViewportHeight に相当する高さを固定 */}
        <div
          ref={parentRef}
          className="overflow-auto border-t border-gray-200 dark:border-gray-700"
          style={{ height: '480px' }}  // 表示ウィンドウの高さ（約8〜9行分）
          role="region"
          aria-label="配送リスト（仮想スクロール）"
          aria-rowcount={deliveries.length}
        >
          {/* 仮想コンテナ: 全行分の高さを確保（スクロールバー制御用） */}
          {/* C#: VirtualizingPanel.IsContainerVirtualMode の仕組みに相当 */}
          <div
            style={{ height: `${totalSize}px`, width: '100%', position: 'relative' }}
            role="table"
          >
            {/* 見えている行だけレンダリング */}
            {virtualRows.map((virtualRow) => {
              const delivery = deliveries[virtualRow.index];
              if (!delivery) return null;

              return (
                <div
                  key={delivery.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}  // 動的高さ計測用
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    // C#: Canvas.SetTop(item, virtualRow.start) に相当
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  role="row"
                  aria-rowindex={virtualRow.index + 1}
                >
                  <table className="w-full table-fixed">
                    <tbody>
                      <tr
                        className={`
                          border-b border-gray-200 dark:border-gray-700
                          ${virtualRow.index % 2 === 0
                            ? 'bg-white dark:bg-gray-900'
                            : 'bg-gray-50 dark:bg-gray-800/50'
                          }
                          hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                        `}
                        style={{ height: `${ROW_HEIGHT}px` }}
                      >
                        {/* ID */}
                        <td className="w-32 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                          {delivery.id}
                        </td>
                        {/* 名前 */}
                        <td className="w-36 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white truncate">
                          {delivery.name}
                        </td>
                        {/* 住所 */}
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 truncate">
                          {delivery.address}
                        </td>
                        {/* 配達日 */}
                        <td className="w-36 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                          {delivery.deliveryDate}
                        </td>
                        {/* ステータス */}
                        <td className="w-40 px-3 py-2">
                          <select
                            value={delivery.status}
                            onChange={(e) => handleStatusChange(delivery.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${STATUS_STYLES[delivery.status]}`}
                            aria-label={`${delivery.name}のステータス`}
                          >
                            <option value="pending">未配送</option>
                            <option value="in_transit">配送中</option>
                            <option value="completed">配送完了</option>
                          </select>
                        </td>
                        {/* 操作ボタン */}
                        <td className="w-44 px-3 py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => onPrint(delivery)}
                              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                              aria-label="印刷"
                            >
                              🖨️
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => onEdit(delivery)}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors"
                                  aria-label="編集"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => onDelete(delivery.id)}
                                  className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded transition-colors"
                                  aria-label="削除"
                                >
                                  削除
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});