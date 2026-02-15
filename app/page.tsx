'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Save, 
  Bell,
  BarChart3,
  Filter,
  X,
  Bookmark
} from 'lucide-react';
import type { 
  Delivery, 
  NotificationSettings,
  PeriodSelection,
  AdvancedFilters,
  FilterPreset,
  QuickFilterType
} from './types/delivery';
import CsvExportModal from './components/CsvExportModal';
import CsvImportModal from './components/CsvImportModal';
import DashboardStats from './components/DashboardStats';
import ThemeToggle from './components/ThemeToggle';
import PrintableDeliverySlip from './components/PrintableDeliverySlip';
import BackupRestoreModal from './components/BackupRestoreModal';
import NotificationSettingsModal from './components/NotificationSettingsModal';
import AnalyticsModal from './components/AnalyticsModal';
import AdvancedFilterModal from './components/AdvancedFilterModal';
import FilterPresetsModal from './components/FilterPresetsModal';
import PerformanceMonitor from './components/PerformanceMonitor';
import { 
  applyAdvancedFilters, 
  applyQuickFilter, 
  createEmptyFilters,
  hasActiveFilters,
  formatFilterDescription,
  clearFilterCache
} from './utils/filters';
import { usePerformanceMonitor } from './utils/performance';

export default function Home() {
  // パフォーマンス計測
  usePerformanceMonitor('Home');

  // State管理
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<keyof Delivery>('deliveryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBackupRestoreModal, setShowBackupRestoreModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [printDeliveryIds, setPrintDeliveryIds] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    deadlineAlert: true,
    statusChangeAlert: true,
  });
  const [periodSelection, setPeriodSelection] = useState<PeriodSelection>({
    type: 'week',
  });
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(createEmptyFilters());
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showFilterPresets, setShowFilterPresets] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // フォーム入力State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'pending' as Delivery['status'],
    deliveryDate: '',
  });

  // マウント処理
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // LocalStorageからデータ読み込み
  useEffect(() => {
    if (!isMounted) return;
    
    const saved = localStorage.getItem('delivery_app_data');
    if (saved) {
      setDeliveries(JSON.parse(saved));
    }

    const savedNotificationSettings = localStorage.getItem('notification_settings');
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }

    const savedPeriodSelection = localStorage.getItem('analytics_period_selection');
    if (savedPeriodSelection) {
      setPeriodSelection(JSON.parse(savedPeriodSelection));
    }

    const savedAdvancedFilters = localStorage.getItem('advanced_filters');
    if (savedAdvancedFilters) {
      setAdvancedFilters(JSON.parse(savedAdvancedFilters));
    }

    const savedFilterPresets = localStorage.getItem('filter_presets');
    if (savedFilterPresets) {
      setFilterPresets(JSON.parse(savedFilterPresets));
    }
  }, [isMounted]);

  // データ保存
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('delivery_app_data', JSON.stringify(deliveries));
  }, [deliveries, isMounted]);

  // 通知設定保存
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings, isMounted]);

  // 期間選択保存
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('analytics_period_selection', JSON.stringify(periodSelection));
  }, [periodSelection, isMounted]);

  // 詳細フィルター保存
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('advanced_filters', JSON.stringify(advancedFilters));
  }, [advancedFilters, isMounted]);

  // フィルタープリセット保存
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('filter_presets', JSON.stringify(filterPresets));
  }, [filterPresets, isMounted]);

  // ========== useMemo/useCallback最適化 ==========

  // フィルタリング・ソート処理（useMemoで最適化）
  const filteredAndSortedDeliveries = useMemo(() => {
    let result = deliveries;

    // 検索フィルター
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.address.toLowerCase().includes(term) ||
          d.id.toLowerCase().includes(term)
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    // クイックフィルター適用
    if (activeQuickFilter) {
      result = applyQuickFilter(result, activeQuickFilter);
    }

    // 詳細フィルター適用
    if (hasActiveFilters(advancedFilters)) {
      result = applyAdvancedFilters(result, advancedFilters);
    }

    // ソート処理
    result = [...result].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [deliveries, searchTerm, statusFilter, sortKey, sortOrder, activeQuickFilter, advancedFilters]);

  // ページネーション処理（useMemoで最適化）
  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedDeliveries.slice(startIndex, endIndex);
  }, [filteredAndSortedDeliveries, currentPage, itemsPerPage]);

  // 総ページ数（useMemoで最適化）
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedDeliveries.length / itemsPerPage);
  }, [filteredAndSortedDeliveries.length, itemsPerPage]);

  // 全選択チェック状態（useMemoで最適化）
  const isAllSelected = useMemo(() => {
    return (
      paginatedDeliveries.length > 0 &&
      paginatedDeliveries.every((d) => selectedIds.has(d.id))
    );
  }, [paginatedDeliveries, selectedIds]);

  // ========== useCallback最適化 ==========

  // フォーム送信
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (editingDelivery) {
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === editingDelivery.id
            ? { ...editingDelivery, ...formData }
            : d
        )
      );
    } else {
      const newDelivery: Delivery = {
        id: `DEL${Date.now()}`,
        ...formData,
      };
      setDeliveries((prev) => [...prev, newDelivery]);
    }

    setFormData({
      name: '',
      address: '',
      status: 'pending',
      deliveryDate: '',
    });
    setEditingDelivery(null);
    setIsModalOpen(false);
    clearFilterCache();
  }, [editingDelivery, formData]);

  // 編集開始
  const handleEdit = useCallback((delivery: Delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      name: delivery.name,
      address: delivery.address,
      status: delivery.status,
      deliveryDate: delivery.deliveryDate,
    });
    setIsModalOpen(true);
  }, []);

  // 削除
  const handleDelete = useCallback((id: string) => {
    if (confirm('本当に削除しますか？')) {
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      clearFilterCache();
    }
  }, []);

  // 選択切り替え
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // 全選択切り替え
  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const allIds = paginatedDeliveries.map((d) => d.id);
      setSelectedIds(new Set(allIds));
    }
  }, [isAllSelected, paginatedDeliveries]);

  // 一括削除
  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (confirm(`${selectedIds.size}件のデータを削除しますか？`)) {
      setDeliveries((prev) => prev.filter((d) => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
      clearFilterCache();
    }
  }, [selectedIds]);

  // 一括ステータス変更
  const handleBulkStatusChange = useCallback((newStatus: Delivery['status']) => {
    if (selectedIds.size === 0) return;
    setDeliveries((prev) =>
      prev.map((d) =>
        selectedIds.has(d.id) ? { ...d, status: newStatus } : d
      )
    );
    setSelectedIds(new Set());
    clearFilterCache();
  }, [selectedIds]);

  // ソート切り替え
  const handleSort = useCallback((key: keyof Delivery) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }, [sortKey]);

  // 印刷
  const handlePrint = useCallback((id: string) => {
    setPrintDeliveryIds([id]);
    setIsPrintPreview(true);
  }, []);

  // 一括印刷
  const handleBulkPrint = useCallback(() => {
    if (selectedIds.size === 0) return;
    setPrintDeliveryIds(Array.from(selectedIds));
    setIsPrintPreview(true);
  }, [selectedIds]);

  // クイックフィルター
  const handleQuickFilter = useCallback((filterType: QuickFilterType) => {
    if (activeQuickFilter === filterType) {
      setActiveQuickFilter(null);
    } else {
      setActiveQuickFilter(filterType);
      setAdvancedFilters(createEmptyFilters());
    }
    setCurrentPage(1);
  }, [activeQuickFilter]);

  // フィルタークリア
  const handleClearFilters = useCallback(() => {
    setAdvancedFilters(createEmptyFilters());
    setActiveQuickFilter(null);
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  }, []);

  // モーダルを開く
  const handleOpenModal = useCallback(() => {
    setEditingDelivery(null);
    setFormData({
      name: '',
      address: '',
      status: 'pending',
      deliveryDate: '',
    });
    setIsModalOpen(true);
  }, []);

  // マウント前は何も表示しない
  if (!isMounted) {
    return null;
  }

  // 印刷プレビュー
  if (isPrintPreview) {
    const printDeliveries = deliveries.filter((d) =>
      printDeliveryIds.includes(d.id)
    );
    return (
      <PrintableDeliverySlip
        deliveries={printDeliveries}
        onClose={() => setIsPrintPreview(false)}
      />
    );
  }

  const quickFilters: { type: QuickFilterType; label: string; icon: string }[] = [
    { type: 'today', label: '今日配送', icon: '📅' },
    { type: 'tomorrow', label: '明日配送', icon: '📆' },
    { type: 'this_week', label: '今週配送', icon: '🗓️' },
    { type: 'overdue', label: '配送遅延', icon: '⚠️' },
    { type: 'in_transit_only', label: '配送中のみ', icon: '🚚' },
    { type: 'completed_today', label: '本日完了', icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">配送管理システム</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Day 19: パフォーマンス最適化
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAnalyticsModalOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                分析
              </button>
              <button
                onClick={() => setShowNotificationSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="通知設定"
              >
                <Bell className="w-5 h-5" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計ダッシュボード */}
        <DashboardStats deliveries={deliveries} />

        {/* クイックフィルター */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.type}
                onClick={() => handleQuickFilter(filter.type)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    activeQuickFilter === filter.type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="mr-1">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* 適用中フィルター表示 */}
        {(hasActiveFilters(advancedFilters) || activeQuickFilter) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  適用中のフィルター:
                </span>
                {activeQuickFilter && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm">
                    {quickFilters.find((f) => f.type === activeQuickFilter)?.label}
                  </span>
                )}
                {hasActiveFilters(advancedFilters) && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm">
                    {formatFilterDescription(advancedFilters)}
                  </span>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                クリア
              </button>
            </div>
          </div>
        )}

        {/* 検索・フィルター・アクションバー */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* 検索 */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="名前、住所、IDで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            {/* ステータスフィルター */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全てのステータス</option>
              <option value="pending">配送前</option>
              <option value="in_transit">配送中</option>
              <option value="completed">完了</option>
            </select>

            {/* 詳細フィルター */}
            <button
              onClick={() => setShowAdvancedFilter(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              詳細フィルター
            </button>

            {/* プリセット */}
            <button
              onClick={() => setShowFilterPresets(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              プリセット
            </button>

            {/* 新規登録 */}
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新規登録
            </button>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              エクスポート
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              インポート
            </button>
            <button
              onClick={() => setShowBackupRestoreModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              バックアップ/リストア
            </button>
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleBulkPrint}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  選択を印刷 ({selectedIds.size})
                </button>
                <button
                  onClick={() => handleBulkStatusChange('in_transit')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  配送中に変更
                </button>
                <button
                  onClick={() => handleBulkStatusChange('completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  完了に変更
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  一括削除
                </button>
              </>
            )}
          </div>
        </div>

        {/* 検索結果件数 */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {filteredAndSortedDeliveries.length}件の配送データ
          {filteredAndSortedDeliveries.length !== deliveries.length && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              （全{deliveries.length}件中）
            </span>
          )}
        </div>

        {/* データテーブル */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('id')}
                  >
                    ID {sortKey === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('name')}
                  >
                    名前 {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('address')}
                  >
                    住所 {sortKey === 'address' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('status')}
                  >
                    ステータス {sortKey === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('deliveryDate')}
                  >
                    配送日 {sortKey === 'deliveryDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      データがありません
                    </td>
                  </tr>
                ) : (
                  paginatedDeliveries.map((delivery) => {
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
                      <tr
                        key={delivery.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(delivery.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm">{delivery.id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{delivery.name}</td>
                        <td className="px-4 py-3 text-sm">{delivery.address}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[delivery.status]}`}>
                            {statusLabels[delivery.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{delivery.deliveryDate}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(delivery)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handlePrint(delivery.id)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                            >
                              印刷
                            </button>
                            <button
                              onClick={() => handleDelete(delivery.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                ページ {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 新規登録・編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingDelivery ? '配送情報編集' : '新規配送登録'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">名前</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">住所</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ステータス</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as Delivery['status'] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="pending">配送前</option>
                  <option value="in_transit">配送中</option>
                  <option value="completed">完了</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">配送日</label>
                <input
                  type="date"
                  required
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingDelivery ? '更新' : '登録'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 各種モーダル（isOpenとインライン処理） */}
      <CsvExportModal
        isOpen={showExportModal}
        deliveries={deliveries}
        filteredDeliveries={filteredAndSortedDeliveries}
        selectedIds={selectedIds}
        onClose={() => setShowExportModal(false)}
      />

      {showImportModal && (
        <CsvImportModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={(data, mode) => {
            if (mode === 'overwrite') {
              setDeliveries(data);
            } else {
              setDeliveries((prev) => [...prev, ...data]);
            }
            setShowImportModal(false);
            clearFilterCache();
          }}
        />
      )}

      <BackupRestoreModal
        isOpen={showBackupRestoreModal}
        deliveries={deliveries}
        onRestore={(data) => {
          setDeliveries(data);
          setShowBackupRestoreModal(false);
          clearFilterCache();
        }}
        onClose={() => setShowBackupRestoreModal(false)}
      />

      <NotificationSettingsModal
        isOpen={showNotificationSettings}
        settings={notificationSettings}
        onSettingsChange={setNotificationSettings}
        notificationPermission={
          typeof window !== 'undefined' && 'Notification' in window
            ? Notification.permission
            : 'default'
        }
        onRequestPermission={async () => {
          if ('Notification' in window) {
            await Notification.requestPermission();
          }
        }}
        onTestNotification={() => {
          if (Notification.permission === 'granted') {
            new Notification('テスト通知', {
              body: '通知機能が正常に動作しています',
              icon: '/icon.png'
            });
          }
        }}
        onClose={() => setShowNotificationSettings(false)}
      />

      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        deliveries={deliveries}
        onClose={() => setIsAnalyticsModalOpen(false)}
      />

      <AdvancedFilterModal
        isOpen={showAdvancedFilter}
        filters={advancedFilters}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          setActiveQuickFilter(null);
          setShowAdvancedFilter(false);
          setCurrentPage(1);
        }}
        onClose={() => setShowAdvancedFilter(false)}
      />

      <FilterPresetsModal
        isOpen={showFilterPresets}
        presets={filterPresets}
        currentFilters={advancedFilters}
        onSavePreset={(name) => {
          const newPreset: FilterPreset = {
            id: `preset_${Date.now()}`,
            name: name,
            filters: advancedFilters,
            createdAt: new Date().toISOString(),
          };
          setFilterPresets((prev) => [...prev, newPreset]);
        }}
        onLoadPreset={(preset) => {
          setAdvancedFilters(preset.filters);
          setActiveQuickFilter(null);
          setShowFilterPresets(false);
          setCurrentPage(1);
        }}
        onDeletePreset={(presetId) => {
          setFilterPresets((prev) => prev.filter((p) => p.id !== presetId));
        }}
        onClose={() => setShowFilterPresets(false)}
      />

      {/* パフォーマンスモニター */}
      <PerformanceMonitor />
    </div>
  );
}