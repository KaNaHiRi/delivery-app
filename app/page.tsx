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
import LanguageSwitcher from './components/LanguageSwitcher';
import { 
  applyAdvancedFilters, 
  applyQuickFilter, 
  createEmptyFilters,
  hasActiveFilters,
  formatFilterDescription,
  clearFilterCache
} from './utils/filters';
import { usePerformanceMonitor } from './utils/performance';
import { useTranslations } from 'next-intl';

export default function Home() {
  usePerformanceMonitor('Home');

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
  const [locale, setLocale] = useState('ja');

  const tCommon = useTranslations('common');
  const tDelivery = useTranslations('delivery');
  const tStatus = useTranslations('status');
  const tFilter = useTranslations('filter');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'pending' as Delivery['status'],
    deliveryDate: '',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ロケール取得（Cookieから）
  useEffect(() => {
    const cookieLocale = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('locale='))
      ?.split('=')?.[1];
    if (cookieLocale) setLocale(cookieLocale);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const saved = localStorage.getItem('delivery_app_data');
    if (saved) setDeliveries(JSON.parse(saved));

    const savedNotificationSettings = localStorage.getItem('notification_settings');
    if (savedNotificationSettings) setNotificationSettings(JSON.parse(savedNotificationSettings));

    const savedPeriodSelection = localStorage.getItem('analytics_period_selection');
    if (savedPeriodSelection) setPeriodSelection(JSON.parse(savedPeriodSelection));

    const savedAdvancedFilters = localStorage.getItem('advanced_filters');
    if (savedAdvancedFilters) setAdvancedFilters(JSON.parse(savedAdvancedFilters));

    const savedFilterPresets = localStorage.getItem('filter_presets');
    if (savedFilterPresets) setFilterPresets(JSON.parse(savedFilterPresets));
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('delivery_app_data', JSON.stringify(deliveries));
  }, [deliveries, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('analytics_period_selection', JSON.stringify(periodSelection));
  }, [periodSelection, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('advanced_filters', JSON.stringify(advancedFilters));
  }, [advancedFilters, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('filter_presets', JSON.stringify(filterPresets));
  }, [filterPresets, isMounted]);

  // ステータスラベル（i18n対応）
  const statusLabels = useMemo(() => ({
    pending: tStatus('pending'),
    in_transit: tStatus('in_transit'),
    completed: tStatus('completed'),
  }), [tStatus]);

  // クイックフィルター（i18n対応）
  const quickFilters: { type: QuickFilterType; label: string; icon: string }[] = useMemo(() => [
    { type: 'today', label: tFilter('today'), icon: '📅' },
    { type: 'tomorrow', label: tFilter('tomorrow'), icon: '📆' },
    { type: 'this_week', label: tFilter('thisWeek'), icon: '🗓️' },
    { type: 'overdue', label: tFilter('overdue'), icon: '⚠️' },
    { type: 'in_transit_only', label: tFilter('inTransitOnly'), icon: '🚚' },
    { type: 'completed_today', label: tFilter('completedToday'), icon: '✅' },
  ], [tFilter]);

  // フィルタリング・ソート
  const filteredAndSortedDeliveries = useMemo(() => {
    let result = deliveries;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.address.toLowerCase().includes(term) ||
          d.id.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (activeQuickFilter) {
      result = applyQuickFilter(result, activeQuickFilter);
    }

    if (hasActiveFilters(advancedFilters)) {
      result = applyAdvancedFilters(result, advancedFilters);
    }

    result = [...result].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [deliveries, searchTerm, statusFilter, sortKey, sortOrder, activeQuickFilter, advancedFilters]);

  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDeliveries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedDeliveries, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedDeliveries.length / itemsPerPage);
  }, [filteredAndSortedDeliveries.length, itemsPerPage]);

  const isAllSelected = useMemo(() => {
    return (
      paginatedDeliveries.length > 0 &&
      paginatedDeliveries.every((d) => selectedIds.has(d.id))
    );
  }, [paginatedDeliveries, selectedIds]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (editingDelivery) {
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === editingDelivery.id ? { ...editingDelivery, ...formData } : d
        )
      );
    } else {
      const newDelivery: Delivery = {
        id: `DEL${Date.now()}`,
        ...formData,
      };
      setDeliveries((prev) => [...prev, newDelivery]);
    }
    setFormData({ name: '', address: '', status: 'pending', deliveryDate: '' });
    setEditingDelivery(null);
    setIsModalOpen(false);
    clearFilterCache();
  }, [editingDelivery, formData]);

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

  const handleDelete = useCallback((id: string) => {
    if (confirm(tDelivery('deleteConfirm'))) {
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      clearFilterCache();
    }
  }, [tDelivery]);

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

  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedDeliveries.map((d) => d.id)));
    }
  }, [isAllSelected, paginatedDeliveries]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (confirm(tDelivery('bulkDeleteConfirm', { count: selectedIds.size }))) {
      setDeliveries((prev) => prev.filter((d) => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
      clearFilterCache();
    }
  }, [selectedIds, tDelivery]);

  const handleBulkStatusChange = useCallback((newStatus: Delivery['status']) => {
    if (selectedIds.size === 0) return;
    setDeliveries((prev) =>
      prev.map((d) => selectedIds.has(d.id) ? { ...d, status: newStatus } : d)
    );
    setSelectedIds(new Set());
    clearFilterCache();
  }, [selectedIds]);

  const handleSort = useCallback((key: keyof Delivery) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }, [sortKey]);

  const handlePrint = useCallback((id: string) => {
    setPrintDeliveryIds([id]);
    setIsPrintPreview(true);
  }, []);

  const handleBulkPrint = useCallback(() => {
    if (selectedIds.size === 0) return;
    setPrintDeliveryIds(Array.from(selectedIds));
    setIsPrintPreview(true);
  }, [selectedIds]);

  const handleQuickFilter = useCallback((filterType: QuickFilterType) => {
    if (activeQuickFilter === filterType) {
      setActiveQuickFilter(null);
    } else {
      setActiveQuickFilter(filterType);
      setAdvancedFilters(createEmptyFilters());
    }
    setCurrentPage(1);
  }, [activeQuickFilter]);

  const handleClearFilters = useCallback(() => {
    setAdvancedFilters(createEmptyFilters());
    setActiveQuickFilter(null);
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  }, []);

  const handleOpenModal = useCallback(() => {
    setEditingDelivery(null);
    setFormData({ name: '', address: '', status: 'pending', deliveryDate: '' });
    setIsModalOpen(true);
  }, []);

  if (!isMounted) return null;

  if (isPrintPreview) {
    const printDeliveries = deliveries.filter((d) => printDeliveryIds.includes(d.id));
    return (
      <PrintableDeliverySlip
        deliveries={printDeliveries}
        onClose={() => setIsPrintPreview(false)}
      />
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{tCommon('appTitle')}</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Day 22: i18n対応
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAnalyticsModalOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                aria-label="分析モーダルを開く"
              >
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                <span>{tCommon('filter')}</span>
              </button>
              <button
                onClick={() => setShowNotificationSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="通知設定を開く"
                title="通知設定"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
              </button>
              <LanguageSwitcher currentLocale={locale} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* 統計ダッシュボード */}
        <DashboardStats deliveries={deliveries} />

        {/* クイックフィルター */}
        <div className="mb-6" role="group" aria-label="クイックフィルター">
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
                aria-pressed={activeQuickFilter === filter.type}
                aria-label={`${filter.label}でフィルター`}
              >
                <span className="mr-1" aria-hidden="true">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* 適用中フィルター表示 */}
        {(hasActiveFilters(advancedFilters) || activeQuickFilter) && (
          <div
            className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
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
                aria-label="フィルターをクリア"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                {tCommon('reset')}
              </button>
            </div>
          </div>
        )}

        {/* 検索・フィルター・アクションバー */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* 検索 */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search-input" className="sr-only">
                配送データを検索
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  aria-hidden="true"
                />
                <input
                  id="search-input"
                  type="text"
                  placeholder={`${tCommon('search')}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-label="配送データを検索"
                  aria-describedby="search-help"
                />
              </div>
              <span id="search-help" className="sr-only">
                名前、住所、またはIDを入力して配送データを検索できます
              </span>
            </div>

            {/* ステータスフィルター */}
            <div>
              <label htmlFor="status-filter" className="sr-only">
                ステータスでフィルター
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                aria-label="ステータスでフィルター"
              >
                <option value="all">{tFilter('allStatus')}</option>
                <option value="pending">{tStatus('pending')}</option>
                <option value="in_transit">{tStatus('in_transit')}</option>
                <option value="completed">{tStatus('completed')}</option>
              </select>
            </div>

            {/* 詳細フィルター */}
            <button
              onClick={() => setShowAdvancedFilter(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              aria-label="詳細フィルターを開く"
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              {tCommon('filter')}
            </button>

            {/* プリセット */}
            <button
              onClick={() => setShowFilterPresets(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              aria-label="フィルタープリセットを開く"
            >
              <Bookmark className="w-4 h-4" aria-hidden="true" />
              プリセット
            </button>

            {/* 新規登録 */}
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              aria-label="新規配送データを登録"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {tDelivery('addNew')}
            </button>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="データ操作">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              aria-label="データをエクスポート"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              {tCommon('export')}
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              aria-label="データをインポート"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              {tCommon('import')}
            </button>
            <button
              onClick={() => setShowBackupRestoreModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              aria-label="バックアップまたはリストア"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              バックアップ/リストア
            </button>
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleBulkPrint}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  aria-label={`選択した${selectedIds.size}件を印刷`}
                >
                  選択を印刷 ({selectedIds.size})
                </button>
                <button
                  onClick={() => handleBulkStatusChange('in_transit')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  aria-label={`選択した${selectedIds.size}件を配送中に変更`}
                >
                  {tStatus('in_transit')}に変更
                </button>
                <button
                  onClick={() => handleBulkStatusChange('completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  aria-label={`選択した${selectedIds.size}件を完了に変更`}
                >
                  {tStatus('completed')}に変更
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  aria-label={`選択した${selectedIds.size}件を削除`}
                >
                  {tDelivery('bulkDelete')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 検索結果件数 */}
        <div
          className="mb-4 text-sm text-gray-600 dark:text-gray-400"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {tDelivery('totalCount', { count: filteredAndSortedDeliveries.length })}
          {filteredAndSortedDeliveries.length !== deliveries.length && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              （全{deliveries.length}件中）
            </span>
          )}
        </div>

        {/* データテーブル */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="配送データ一覧">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr role="row">
                  <th className="px-4 py-3 text-left" role="columnheader" scope="col">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                      aria-label="すべての配送データを選択"
                    />
                  </th>
                  {[
                    { key: 'id' as keyof Delivery, label: tDelivery('id') },
                    { key: 'name' as keyof Delivery, label: tDelivery('name') },
                    { key: 'address' as keyof Delivery, label: tDelivery('address') },
                    { key: 'status' as keyof Delivery, label: tDelivery('status') },
                    { key: 'deliveryDate' as keyof Delivery, label: tDelivery('deliveryDate') },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort(key)}
                      role="columnheader"
                      scope="col"
                      aria-sort={sortKey === key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSort(key);
                        }
                      }}
                    >
                      {label} {sortKey === key && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  ))}
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    role="columnheader"
                    scope="col"
                  >
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedDeliveries.length === 0 ? (
                  <tr role="row">
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500" role="cell">
                      {tCommon('noData')}
                    </td>
                  </tr>
                ) : (
                  paginatedDeliveries.map((delivery) => {
                    const isSelected = selectedIds.has(delivery.id);
                    return (
                      <tr
                        key={delivery.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        role="row"
                      >
                        <td className="px-4 py-3" role="cell">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(delivery.id)}
                            className="w-4 h-4 cursor-pointer"
                            aria-label={`${delivery.name}の配送データを選択`}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm" role="cell">{delivery.id}</td>
                        <td className="px-4 py-3 text-sm font-medium" role="cell">{delivery.name}</td>
                        <td className="px-4 py-3 text-sm" role="cell">{delivery.address}</td>
                        <td className="px-4 py-3 text-sm" role="cell">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[delivery.status]}`}>
                            {statusLabels[delivery.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" role="cell">{delivery.deliveryDate}</td>
                        <td className="px-4 py-3 text-sm" role="cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(delivery)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                              aria-label={`${delivery.name}の配送データを編集`}
                            >
                              {tCommon('edit')}
                            </button>
                            <button
                              onClick={() => handlePrint(delivery.id)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                              aria-label={`${delivery.name}の配送伝票を印刷`}
                            >
                              印刷
                            </button>
                            <button
                              onClick={() => handleDelete(delivery.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                              aria-label={`${delivery.name}の配送データを削除`}
                            >
                              {tCommon('delete')}
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
            <nav
              className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
              aria-label="ページネーション"
            >
              <div
                className="text-sm text-gray-700 dark:text-gray-300"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                ページ {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="前のページ"
                  aria-disabled={currentPage === 1}
                >
                  前へ
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="次のページ"
                  aria-disabled={currentPage === totalPages}
                >
                  次へ
                </button>
              </div>
            </nav>
          )}
        </div>
      </main>

      {/* 新規登録・編集モーダル */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 id="modal-title" className="text-xl font-bold mb-4">
              {editingDelivery ? tDelivery('editDelivery') : tDelivery('addNew')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="delivery-name" className="block text-sm font-medium mb-1">
                  {tDelivery('name')} <span className="text-red-500" aria-label="必須">*</span>
                </label>
                <input
                  id="delivery-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="delivery-address" className="block text-sm font-medium mb-1">
                  {tDelivery('address')} <span className="text-red-500" aria-label="必須">*</span>
                </label>
                <input
                  id="delivery-address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="delivery-status" className="block text-sm font-medium mb-1">
                  {tDelivery('status')}
                </label>
                <select
                  id="delivery-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as Delivery['status'] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="pending">{tStatus('pending')}</option>
                  <option value="in_transit">{tStatus('in_transit')}</option>
                  <option value="completed">{tStatus('completed')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="delivery-date" className="block text-sm font-medium mb-1">
                  {tDelivery('deliveryDate')} <span className="text-red-500" aria-label="必須">*</span>
                </label>
                <input
                  id="delivery-date"
                  type="date"
                  required
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  aria-required="true"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingDelivery ? tCommon('save') : tCommon('add')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  {tCommon('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 各種モーダル */}
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
              icon: '/icon.png',
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
            name,
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

      <PerformanceMonitor />
    </div>
  );
}