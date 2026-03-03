// app/hooks/useFilterState.ts
import { useState, useCallback, useMemo } from 'react';
import {
  applyAdvancedFilters,
  applyQuickFilter,
  createEmptyFilters,
  hasActiveFilters,
} from '@/app/utils/filters';
import type { Delivery, AdvancedFilters, FilterPreset, QuickFilterType } from '@/app/types/delivery';

interface UseFilterStateProps {
  deliveries: Delivery[];
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export function useFilterState({ deliveries, setCurrentPage }: UseFilterStateProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(createEmptyFilters());
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType | null>(null);

  // 検索 + フィルター適用後のリスト
  const filteredDeliveries = useMemo(() => {
    let result = deliveries;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        d =>
          d.name.toLowerCase().includes(term) ||
          d.address.toLowerCase().includes(term) ||
          d.id.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }
    if (activeQuickFilter) {
      result = applyQuickFilter(result, activeQuickFilter);
    }
    if (hasActiveFilters(advancedFilters)) {
      result = applyAdvancedFilters(result, advancedFilters);
    }
    return result;
  }, [deliveries, searchTerm, statusFilter, activeQuickFilter, advancedFilters]);

  // クイックフィルター切り替え
  const handleQuickFilter = useCallback((filterType: QuickFilterType) => {
    setActiveQuickFilter(prev => (prev === filterType ? null : filterType));
    setAdvancedFilters(createEmptyFilters());
    setCurrentPage(1);
  }, [setCurrentPage]);

  // 全フィルタークリア
  const handleClearFilters = useCallback(() => {
    setAdvancedFilters(createEmptyFilters());
    setActiveQuickFilter(null);
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  }, [setCurrentPage]);

  // 詳細フィルター適用
  const applyFilters = useCallback((filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    setActiveQuickFilter(null);
    setCurrentPage(1);
  }, [setCurrentPage]);

  // フィルタープリセット保存
  const savePreset = useCallback((name: string) => {
    const preset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name,
      filters: advancedFilters,
      createdAt: new Date().toISOString(),
    };
    setFilterPresets(prev => [...prev, preset]);
  }, [advancedFilters]);

  // フィルタープリセット削除
  const deletePreset = useCallback((presetId: string) => {
    setFilterPresets(prev => prev.filter(p => p.id !== presetId));
  }, []);

  // フィルタープリセット読み込み
  const loadPreset = useCallback((preset: FilterPreset) => {
    setAdvancedFilters(preset.filters);
    setActiveQuickFilter(null);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const isFiltersActive = hasActiveFilters(advancedFilters) || activeQuickFilter !== null;

  return {
    // state
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    selectedLocationId, setSelectedLocationId,
    advancedFilters, setAdvancedFilters,
    filterPresets,
    activeQuickFilter,
    filteredDeliveries,
    isFiltersActive,
    // handlers
    handleQuickFilter,
    handleClearFilters,
    applyFilters,
    savePreset,
    deletePreset,
    loadPreset,
  };
}