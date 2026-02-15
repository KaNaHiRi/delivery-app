'use client';

import React, { useEffect, useRef } from 'react';
import { FixedSizeList } from 'react-window';
import { Delivery } from '../types/delivery';
import { Edit2, Trash2, FileText } from 'lucide-react';

interface VirtualizedDeliveryListProps {
  deliveries: Delivery[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (delivery: Delivery) => void;
  onDelete: (id: string) => void;
  onPrint: (id: string) => void;
  isDark: boolean;
}

export default function VirtualizedDeliveryList({
  deliveries,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onPrint,
  isDark,
}: VirtualizedDeliveryListProps) {
  const listRef = useRef<FixedSizeList>(null);

  // ウィンドウリサイズ時にリストを再計算
  useEffect(() => {
    const handleResize = () => {
      if (listRef.current) {
        listRef.current.resetAfterIndex(0);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Row コンポーネント
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const delivery = deliveries[index];
    if (!delivery) return null;
    
    const isSelected = selectedIds.has(delivery.id);

    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };

    const statusLabels = {
      pending: '配送前',
      in_transit: '配送中',
      completed: '完了',
    };

    return (
      <div
        style={style}
        className={`
          flex items-center gap-4 px-4 border-b
          ${isDark ? 'border-gray-700' : 'border-gray-200'}
          ${isSelected ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50') : ''}
          hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'}
          transition-colors
        `}
      >
        {/* チェックボックス */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(delivery.id)}
          className="w-4 h-4 cursor-pointer"
        />

        {/* ID */}
        <div className="w-20 text-sm">
          {delivery.id}
        </div>

        {/* 名前 */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{delivery.name}</div>
        </div>

        {/* 住所 */}
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">{delivery.address}</div>
        </div>

        {/* ステータス */}
        <div className="w-24">
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[delivery.status]}`}>
            {statusLabels[delivery.status]}
          </span>
        </div>

        {/* 配送日 */}
        <div className="w-28 text-sm">
          {delivery.deliveryDate}
        </div>

        {/* アクション */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(delivery)}
            className={`p-2 rounded hover:${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            title="編集"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPrint(delivery.id)}
            className={`p-2 rounded hover:${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            title="印刷"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(delivery.id)}
            className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <FixedSizeList
      ref={listRef}
      height={600}
      itemCount={deliveries.length}
      itemSize={60}
      width="100%"
      className="border rounded-lg"
    >
      {Row}
    </FixedSizeList>
  );
}