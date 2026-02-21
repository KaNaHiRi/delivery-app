import { useState, useCallback, useRef } from 'react';
import { Delivery } from '../types/delivery';

/**
 * ドラッグ＆ドロップで配送リストを並び替えるフック
 * C#/WPF の DragDrop.DoDragDrop に相当
 */
export function useDragAndDrop(
  items: Delivery[],
  onReorder: (reordered: Delivery[]) => void
) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, id: string) => {
      dragItemId.current = id;
      e.dataTransfer.effectAllowed = 'move';
      // ドラッグ中の要素を半透明に
      (e.currentTarget as HTMLElement).style.opacity = '0.5';
    },
    []
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    dragItemId.current = null;
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverId(id);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const sourceId = dragItemId.current;
      if (!sourceId || sourceId === targetId) {
        setDragOverId(null);
        return;
      }

      // C# LINQ の OrderBy で並び替えるイメージ
      const newItems = [...items];
      const sourceIndex = newItems.findIndex(i => i.id === sourceId);
      const targetIndex = newItems.findIndex(i => i.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return;

      // 配列から切り取って挿入（C#の List<T>.RemoveAt + Insert）
      const [removed] = newItems.splice(sourceIndex, 1);
      newItems.splice(targetIndex, 0, removed);

      onReorder(newItems);
      setDragOverId(null);
    },
    [items, onReorder]
  );

  return {
    dragOverId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
}