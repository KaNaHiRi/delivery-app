// app/hooks/useDeliveryActions.ts
import { useCallback } from 'react';
import { deliveryApi } from '@/lib/deliveryApi';
import { clearFilterCache } from '@/app/utils/filters';
import { generateTestData } from '@/app/utils/generateTestData';
import type { Delivery } from '@/app/types/delivery';
import type { Permissions } from '@/app/utils/permissions';

interface UseDeliveryActionsProps {
  deliveries: Delivery[];
  selectedIds: Set<string>;
  permissions: Permissions;
  fetchDeliveries: () => Promise<void>;
  setDeliveries: React.Dispatch<React.SetStateAction<Delivery[]>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPrintPreview: React.Dispatch<React.SetStateAction<boolean>>;
  setPrintDeliveryIds: React.Dispatch<React.SetStateAction<string[]>>;
  confirmFn?: (msg: string) => boolean;
}

// ↓ デフォルト引数をファイルスコープで定義（window直参照を避ける）
const defaultConfirm = (msg: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.confirm(msg);
};

export function useDeliveryActions({
  deliveries,
  selectedIds,
  permissions,
  fetchDeliveries,
  setDeliveries,
  setSelectedIds,
  setIsGenerating,
  setIsPrintPreview,
  setPrintDeliveryIds,
  confirmFn = defaultConfirm, 
}: UseDeliveryActionsProps) {

  // 単体削除
  const handleDelete = useCallback(async (id: string) => {
    if (!permissions.canDelete) return;
    if (!confirmFn('この配送データを削除しますか？')) return;
    try {
      await deliveryApi.delete(id);
      setDeliveries(prev => prev.filter(d => d.id !== id));
      setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      clearFilterCache();
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }, [permissions.canDelete, confirmFn, setDeliveries, setSelectedIds]);

  // ステータス変更
  const handleStatusChange = useCallback(async (id: string, newStatus: Delivery['status']) => {
    if (!permissions.canChangeStatus) return;
    try {
      const updated = await deliveryApi.update(id, { status: newStatus });
      setDeliveries(prev => prev.map(d => d.id === id ? updated : d));
      clearFilterCache();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ステータス更新に失敗しました');
    }
  }, [permissions.canChangeStatus, setDeliveries]);

  // 一括削除
  const handleBulkDelete = useCallback(async () => {
    if (!permissions.canBulkDelete || selectedIds.size === 0) return;
    if (!confirmFn(`${selectedIds.size}件の配送データを削除しますか？`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deliveryApi.delete(id)));
      setDeliveries(prev => prev.filter(d => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
      clearFilterCache();
    } catch (err) {
      alert(err instanceof Error ? err.message : '一括削除に失敗しました');
    }
  }, [selectedIds, permissions.canBulkDelete, confirmFn, setDeliveries, setSelectedIds]);

  // 一括ステータス変更
  const handleBulkStatusChange = useCallback(async (newStatus: Delivery['status']) => {
    if (!permissions.canBulkStatusChange || selectedIds.size === 0) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deliveryApi.update(id, { status: newStatus })));
      setDeliveries(prev => prev.map(d => selectedIds.has(d.id) ? { ...d, status: newStatus } : d));
      setSelectedIds(new Set());
      clearFilterCache();
    } catch (err) {
      alert(err instanceof Error ? err.message : '一括ステータス変更に失敗しました');
    }
  }, [selectedIds, permissions.canBulkStatusChange, setDeliveries, setSelectedIds]);

  // 印刷
  const handlePrint = useCallback((id: string) => {
    setPrintDeliveryIds([id]);
    setIsPrintPreview(true);
  }, [setPrintDeliveryIds, setIsPrintPreview]);

  // 一括印刷
  const handleBulkPrint = useCallback(() => {
    if (!permissions.canBulkPrint || selectedIds.size === 0) return;
    setPrintDeliveryIds(Array.from(selectedIds));
    setIsPrintPreview(true);
  }, [selectedIds, permissions.canBulkPrint, setPrintDeliveryIds, setIsPrintPreview]);

  // テストデータ生成
  const handleGenerateTestData = useCallback(async () => {
    if (!permissions.canCreate) return;
    const COUNT = 200;
    setIsGenerating(true);
    try {
      const testData = generateTestData(COUNT);
      for (const d of testData) {
        // eslint-disable-next-line no-await-in-loop
        await deliveryApi.create({
          name: d.name,
          address: d.address,
          status: d.status,
          deliveryDate: d.deliveryDate,
        });
      }
      await fetchDeliveries();
      alert(`${COUNT}件のテストデータを追加しました`);
    } catch {
      alert('テストデータの生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  }, [permissions.canCreate, fetchDeliveries, setIsGenerating]);

  return {
    handleDelete,
    handleStatusChange,
    handleBulkDelete,
    handleBulkStatusChange,
    handlePrint,
    handleBulkPrint,
    handleGenerateTestData,
  };
}