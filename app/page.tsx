'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus, Search, Download, Upload, Save, Bell, BarChart3,
  Filter, X, Bookmark, RefreshCw, Play, Pause, ShieldCheck, ShieldAlert,
  Loader2, FileText, Keyboard, BookUser, Settings, AtSign, History,
} from 'lucide-react';

import type { Delivery, NotificationSettings, PeriodSelection } from './types/delivery';
import type { MasterType } from './types/master';
import type { Staff, Customer, Location } from './types/master';
import type { WidgetConfig, DashboardLayout } from './types/delivery';

import { EMPTY_FORM, REFRESH_INTERVALS, STATUS_COLORS, DEFAULT_ITEMS_PER_PAGE } from './constants/delivery';

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
import UserMenu from './components/UserMenu';
import { VirtualTable } from '@/app/components/VirtualTable';
import KeyboardShortcutHelp from './components/KeyboardShortcutHelp';
import MasterModal from './components/MasterModal';
import DashboardCustomizeModal from './components/DashboardCustomizeModal';
import ReportModal from './components/ReportModal';
import EmailNotificationModal from './components/EmailNotificationModal';
import HistoryModal from './components/HistoryModal';

import { getPermissions } from './utils/permissions';
import { usePerformanceMonitor } from './utils/performance';
import { hasActiveFilters, formatFilterDescription, clearFilterCache, createEmptyFilters } from './utils/filters';
import { DEFAULT_WIDGETS, DEFAULT_LAYOUT, loadDashboardConfig, saveDashboardConfig } from './utils/dashboard';

import { useTranslations } from 'next-intl';
import { useInterval } from './hooks/useInterval';
import { useRole } from './hooks/useRole';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFormValidation } from './hooks/useFormValidation';
import { useDeliveryActions } from './hooks/useDeliveryActions';
import { useModalState } from './hooks/useModalState';
import { useFilterState } from './hooks/useFilterState';

import { deliveryApi } from '@/lib/deliveryApi';
import { staffApi, customerApi, locationApi } from '@/lib/masterApi';
import { createDeliverySchema } from './utils/validation';
import type { FormData } from './types/delivery';
import DemoBanner from './components/DemoBanner';

// ─────────────────────────────────────────
// サブコンポーネント（ファイル分割候補）
// ─────────────────────────────────────────

function AutoRefreshBar({ onRefresh }: { onRefresh: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [interval, setIntervalValue] = useState(30000);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const handleRefresh = useCallback(() => {
    onRefresh();
    setLastRefreshed(new Date());
  }, [onRefresh]);

  useInterval(handleRefresh, enabled ? interval : null);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm mb-6" role="region" aria-label="自動更新設定">
      <button onClick={handleRefresh} className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" aria-label="今すぐ更新">
        <RefreshCw size={14} className={enabled ? 'animate-spin' : ''} />
        <span>更新</span>
      </button>
      <select value={interval} onChange={e => setIntervalValue(Number(e.target.value))} className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="更新間隔">
        {REFRESH_INTERVALS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}ごと</option>)}
      </select>
      <button onClick={() => setEnabled(prev => !prev)} className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${enabled ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`} aria-pressed={enabled} aria-label={enabled ? '自動更新を停止' : '自動更新を開始'}>
        {enabled ? <Pause size={14} /> : <Play size={14} />}
        <span>{enabled ? '自動更新中' : '自動更新'}</span>
      </button>
      {lastRefreshed && <span className="text-gray-500 dark:text-gray-400 text-xs">最終更新: {formatTime(lastRefreshed)}</span>}
    </div>
  );
}

function RoleBanner({ role }: { role: string | undefined }) {
  if (role === 'admin') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm mb-6" role="status" aria-label="ロール情報">
        <ShieldCheck size={16} className="text-purple-600 dark:text-purple-400" aria-hidden="true" />
        <span className="text-purple-700 dark:text-purple-300 font-medium">管理者としてログイン中 — 全ての操作が可能です</span>
      </div>
    );
  }
  if (role === 'user') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm mb-6" role="status" aria-label="ロール情報">
        <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span className="text-amber-700 dark:text-amber-300">一般ユーザーとしてログイン中 — <strong className="ml-1">閲覧・ステータス変更・印刷・エクスポート</strong>が可能です。追加・編集・削除は管理者にお問い合わせください。</span>
      </div>
    );
  }
  return null;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-label="読み込み中">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-hidden="true" />
      <span className="ml-3 text-gray-600 dark:text-gray-400">データを読み込み中...</span>
    </div>
  );
}

// ─────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────

export default function Home() {
  usePerformanceMonitor('Home');

  const { role } = useRole();
  const permissions = useMemo(() => getPermissions(role), [role]);

  // ── 基本state ──
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [locale, setLocale] = useState('ja');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);

  // ── ソート・ページネーション ──
  const [sortKey, setSortKey] = useState<keyof Delivery>('deliveryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── 印刷 ──
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [printDeliveryIds, setPrintDeliveryIds] = useState<string[]>([]);

  // ── マスタデータ ──
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [masterModalType, setMasterModalType] = useState<MasterType>('staff');

  // ── ダッシュボード ──
  const [dashboardWidgets, setDashboardWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);

  // ── 通知・分析 ──
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false, deadlineAlert: true, statusChangeAlert: true,
  });
  const [periodSelection, setPeriodSelection] = useState<PeriodSelection>({ type: 'week' });

  // ── D&D ──
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);

  // ── フォーム ──
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const { errors: formErrors, validate: validateForm, clearError, clearAllErrors } = useFormValidation(createDeliverySchema);

  // ── Refs ──
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── i18n ──
  const tCommon = useTranslations('common');
  const tDelivery = useTranslations('delivery');
  const tStatus = useTranslations('status');
  const tFilter = useTranslations('filter');

  // ─────────────────────────────────────────
  // カスタムHooks
  // ─────────────────────────────────────────

  const { modals, openModal, closeModal, isAnyModalOpen } = useModalState();

  const {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    selectedLocationId, setSelectedLocationId,
    advancedFilters, setAdvancedFilters,
    filterPresets,
    activeQuickFilter,
    filteredDeliveries,
    isFiltersActive,
    handleQuickFilter,
    handleClearFilters,
    applyFilters,
    savePreset,
    deletePreset,
    loadPreset,
  } = useFilterState({ deliveries, setCurrentPage });

  // ─────────────────────────────────────────
  // データ取得
  // ─────────────────────────────────────────

  const fetchDeliveries = useCallback(async () => {
    try {
      setApiError(null);
      const data = await deliveryApi.getAll(selectedLocationId || undefined);
      setDeliveries(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocationId]);

  // ─────────────────────────────────────────
  // 配送アクション（カスタムHook）
  // ─────────────────────────────────────────

  const {
    handleDelete,
    handleStatusChange,
    handleBulkDelete,
    handleBulkStatusChange,
    handlePrint,
    handleBulkPrint,
    handleGenerateTestData,
  } = useDeliveryActions({
    deliveries,
    selectedIds,
    permissions,
    fetchDeliveries,
    setDeliveries,
    setSelectedIds,
    setIsGenerating,
    setIsPrintPreview,
    setPrintDeliveryIds,
  });

  // ─────────────────────────────────────────
  // フォーム送信
  // ─────────────────────────────────────────

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData)) return;
    try {
      if (editingDelivery) {
        if (!permissions.canEdit) return;
        const updated = await deliveryApi.update(editingDelivery.id, formData);
        setDeliveries(prev => prev.map(d => d.id === editingDelivery.id ? updated : d));
      } else {
        if (!permissions.canCreate) return;
        const created = await deliveryApi.create(formData);
        setDeliveries(prev => [...prev, created]);
      }
      setFormData(EMPTY_FORM);
      setEditingDelivery(null);
      closeModal('delivery');
      clearAllErrors();
      clearFilterCache();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作に失敗しました');
    }
  }, [editingDelivery, formData, permissions.canCreate, permissions.canEdit, validateForm, clearAllErrors, closeModal]);

  const handleEdit = useCallback((delivery: Delivery) => {
    if (!permissions.canEdit) return;
    setEditingDelivery(delivery);
    setFormData({
      name: delivery.name,
      address: delivery.address,
      status: delivery.status,
      deliveryDate: delivery.deliveryDate,
      staffId: delivery.staffId ?? null,
      customerId: delivery.customerId ?? null,
      locationId: delivery.locationId ?? null,
    });
    openModal('delivery');
  }, [permissions.canEdit, openModal]);

  const handleOpenModal = useCallback(() => {
    if (!permissions.canCreate) return;
    setEditingDelivery(null);
    setFormData(EMPTY_FORM);
    openModal('delivery');
  }, [permissions.canCreate, openModal]);

  // ─────────────────────────────────────────
  // ソート・選択
  // ─────────────────────────────────────────

  const handleSort = useCallback((key: keyof Delivery) => {
    if (sortKey === key) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('asc'); }
  }, [sortKey]);

  const sortedDeliveries = useMemo(() => (
    [...filteredDeliveries].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    })
  ), [filteredDeliveries, sortKey, sortOrder]);

  const orderedFilteredDeliveries = useMemo(() => {
    if (orderedIds.length === 0) return sortedDeliveries;
    const map = new Map(sortedDeliveries.map(d => [d.id, d]));
    const ordered = orderedIds.flatMap(id => map.has(id) ? [map.get(id)!] : []);
    const orderedIdSet = new Set(orderedIds);
    return [...ordered, ...sortedDeliveries.filter(d => !orderedIdSet.has(d.id))];
  }, [sortedDeliveries, orderedIds]);

  const paginatedDeliveries = useMemo(() => (
    orderedFilteredDeliveries.slice(
      (currentPage - 1) * DEFAULT_ITEMS_PER_PAGE,
      currentPage * DEFAULT_ITEMS_PER_PAGE
    )
  ), [orderedFilteredDeliveries, currentPage]);

  const totalPages = useMemo(() => (
    Math.ceil(orderedFilteredDeliveries.length / DEFAULT_ITEMS_PER_PAGE)
  ), [orderedFilteredDeliveries.length]);

  const isAllSelected = useMemo(() => (
    paginatedDeliveries.length > 0 && paginatedDeliveries.every(d => selectedIds.has(d.id))
  ), [paginatedDeliveries, selectedIds]);

  const handleToggleSelect = useCallback((id: string) => {
    if (!permissions.canSelectAll) return;
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }, [permissions.canSelectAll]);

  const handleToggleSelectAll = useCallback(() => {
    if (!permissions.canSelectAll) return;
    isAllSelected
      ? setSelectedIds(new Set())
      : setSelectedIds(new Set(paginatedDeliveries.map(d => d.id)));
  }, [isAllSelected, paginatedDeliveries, permissions.canSelectAll]);

  // ─────────────────────────────────────────
  // D&D
  // ─────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!permissions.canDragAndDrop) return;
    dragItemId.current = id;
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  }, [permissions.canDragAndDrop]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    dragItemId.current = null;
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    if (!permissions.canDragAndDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  }, [permissions.canDragAndDrop]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    if (!permissions.canDragAndDrop) return;
    e.preventDefault();
    const sourceId = dragItemId.current;
    if (!sourceId || sourceId === targetId) { setDragOverId(null); return; }
    const newOrdered = [...orderedIds];
    const si = newOrdered.indexOf(sourceId);
    const ti = newOrdered.indexOf(targetId);
    if (si === -1 || ti === -1) { setDragOverId(null); return; }
    const [removed] = newOrdered.splice(si, 1);
    newOrdered.splice(ti, 0, removed);
    setOrderedIds(newOrdered);
    setDragOverId(null);
  }, [orderedIds, permissions.canDragAndDrop]);

  // ─────────────────────────────────────────
  // ダッシュボード
  // ─────────────────────────────────────────

  const handleDashboardCustomize = useCallback((widgets: WidgetConfig[], layout: DashboardLayout) => {
    setDashboardWidgets(widgets);
    setDashboardLayout(layout);
    saveDashboardConfig(widgets, layout);
  }, []);

  // ── デモリセット ──
  const handleDemoReset = useCallback(async () => {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    if (!res.ok) throw new Error('リセット失敗');
    await fetchDeliveries();
    await staffApi.getAll().then(setStaffList);
    await customerApi.getAll().then(setCustomerList);
    await locationApi.getAll().then(setLocationList);
  }, [fetchDeliveries]);


  // ─────────────────────────────────────────
  // キーボードショートカット
  // ─────────────────────────────────────────

  useKeyboardShortcuts(
    {
      onNew: handleOpenModal,
      onFocus: () => searchInputRef.current?.focus(),
      onVirtual: () => setUseVirtualScroll(v => !v),
      onRefresh: fetchDeliveries,
      onHelp: () => openModal('shortcutHelp'),
      onEscape: () => {
        if (modals.shortcutHelp) { closeModal('shortcutHelp'); return; }
        if (modals.delivery) { closeModal('delivery'); return; }
        if (modals.advancedFilter) { closeModal('advancedFilter'); return; }
        if (modals.filterPresets) { closeModal('filterPresets'); return; }
        if (modals.export) { closeModal('export'); return; }
        if (modals.import) { closeModal('import'); return; }
        if (modals.backup) { closeModal('backup'); return; }
        if (modals.notification) { closeModal('notification'); return; }
        if (modals.analytics) { closeModal('analytics'); return; }
        if (isFiltersActive) { handleClearFilters(); }
      },
    },
    !isAnyModalOpen || true
  );

  // ─────────────────────────────────────────
  // useEffect
  // ─────────────────────────────────────────

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const cookieLocale = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('locale='))
      ?.split('=')?.[1];
    if (cookieLocale) setLocale(cookieLocale);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    fetchDeliveries();
  }, [isMounted, fetchDeliveries]);

  useEffect(() => {
    if (!isMounted) return;
    staffApi.getAll().then(setStaffList).catch(() => {});
    customerApi.getAll().then(setCustomerList).catch(() => {});
    locationApi.getAll().then(setLocationList).catch(() => {});
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const savedNotif = localStorage.getItem('notification_settings');
    if (savedNotif) setNotificationSettings(JSON.parse(savedNotif));
    const savedPeriod = localStorage.getItem('analytics_period_selection');
    if (savedPeriod) setPeriodSelection(JSON.parse(savedPeriod));
    const { widgets, layout } = loadDashboardConfig();
    setDashboardWidgets(widgets);
    setDashboardLayout(layout);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('analytics_period_selection', JSON.stringify(periodSelection));
  }, [periodSelection, isMounted]);

  useEffect(() => {
    if (!isMounted || orderedIds.length === 0) return;
    localStorage.setItem('delivery_app_order', JSON.stringify(orderedIds));
  }, [orderedIds, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const saved = localStorage.getItem('delivery_app_order');
    const savedOrder: string[] = saved ? JSON.parse(saved) : [];
    const currentIds = deliveries.map(d => d.id);
    const merged = [
      ...savedOrder.filter(id => currentIds.includes(id)),
      ...currentIds.filter(id => !savedOrder.includes(id)),
    ];
    setOrderedIds(merged);
  }, [deliveries, isMounted]);

  // ─────────────────────────────────────────
  // 早期リターン
  // ─────────────────────────────────────────

  if (!isMounted) return null;

  if (isPrintPreview) {
    return (
      <PrintableDeliverySlip
        deliveries={deliveries.filter(d => printDeliveryIds.includes(d.id))}
        onClose={() => setIsPrintPreview(false)}
      />
    );
  }

  // ─────────────────────────────────────────
  // 定数（render内）
  // ─────────────────────────────────────────

  const statusLabels = {
    pending: tStatus('pending'),
    in_transit: tStatus('in_transit'),
    completed: tStatus('completed'),
  };

  const quickFilters = [
    { type: 'today' as const, label: tFilter('today'), icon: '📅' },
    { type: 'tomorrow' as const, label: tFilter('tomorrow'), icon: '📆' },
    { type: 'this_week' as const, label: tFilter('thisWeek'), icon: '🗓️' },
    { type: 'overdue' as const, label: tFilter('overdue'), icon: '⚠️' },
    { type: 'in_transit_only' as const, label: tFilter('inTransitOnly'), icon: '🚚' },
    { type: 'completed_today' as const, label: tFilter('completedToday'), icon: '✅' },
  ];

  const roleBadge = role === 'admin'
    ? { label: '👑 管理者', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
    : role === 'user'
    ? { label: '👤 一般ユーザー', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' }
    : null;

  // ─────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{tCommon('appTitle')}</h1>
              {roleBadge && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge.className}`}>
                  {roleBadge.label}
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">Day 44: デモ環境整備</span>
            </div>
            <div className="flex items-center gap-2">
              {permissions.canViewAnalytics && (
                <>
                  <button onClick={() => openModal('analytics')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2" aria-label="分析モーダルを開く">
                    <BarChart3 className="w-4 h-4" /><span>{tCommon('analytics') ?? 'Analytics'}</span>
                  </button>
                  <button onClick={() => openModal('report')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2" aria-label="レポートを生成">
                    <FileText className="w-4 h-4" /><span>レポート</span>
                  </button>
                  <button onClick={() => openModal('email')} className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center gap-2" aria-label="メール通知を送信">
                    <AtSign className="w-4 h-4" /><span>メール</span>
                  </button>
                  <button onClick={() => openModal('history')} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2" aria-label="操作履歴を表示">
                    <History className="w-4 h-4" /><span>履歴</span>
                  </button>
                </>
              )}
              <button onClick={() => openModal('dashboardCustomize')} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-600" aria-label="ダッシュボードをカスタマイズ">
                <Settings className="w-4 h-4" />カスタマイズ
              </button>
              {permissions.canCreate && (
                <button onClick={() => { setMasterModalType('staff'); openModal('master'); }} className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm" aria-label="マスタ管理を開く">
                  <BookUser className="w-4 h-4" />マスタ
                </button>
              )}
              <button onClick={() => openModal('notification')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="通知設定を開く">
                <Bell className="w-5 h-5" />
              </button>
              <LanguageSwitcher currentLocale={locale} />
              <button onClick={() => openModal('shortcutHelp')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="キーボードショートカット一覧を開く">
                <Keyboard className="w-5 h-5" />
              </button>
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        <DashboardStats deliveries={deliveries} widgets={dashboardWidgets} layout={dashboardLayout} />
        <DemoBanner isAdmin={role === 'admin'} onResetDemo={handleDemoReset} />
        <RoleBanner role={role} />
        <AutoRefreshBar onRefresh={fetchDeliveries} />

        {/* APIエラー */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
            <div className="flex items-center justify-between">
              <span className="text-red-700 dark:text-red-300 text-sm">⚠️ {apiError}</span>
              <button onClick={fetchDeliveries} className="text-sm text-red-600 dark:text-red-400 hover:underline ml-4">再試行</button>
            </div>
          </div>
        )}

        {/* クイックフィルター */}
        <div className="mb-6" role="group" aria-label="クイックフィルター">
          <div className="flex flex-wrap gap-2">
            {quickFilters.map(filter => (
              <button
                key={filter.type}
                onClick={() => handleQuickFilter(filter.type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeQuickFilter === filter.type ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                aria-pressed={activeQuickFilter === filter.type}
              >
                <span className="mr-1" aria-hidden="true">{filter.icon}</span>{filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* アクティブフィルター表示 */}
        {isFiltersActive && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800" role="status" aria-live="polite">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">適用中のフィルター:</span>
                {activeQuickFilter && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm">
                    {quickFilters.find(f => f.type === activeQuickFilter)?.label}
                  </span>
                )}
                {hasActiveFilters(advancedFilters) && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm">
                    {formatFilterDescription(advancedFilters)}
                  </span>
                )}
              </div>
              <button onClick={handleClearFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1">
                <X className="w-4 h-4" />{tCommon('reset')}
              </button>
            </div>
          </div>
        )}

        {/* 検索・フィルターバー */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* 検索 */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search-input" className="sr-only">配送データを検索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="search-input"
                  ref={searchInputRef}
                  type="text"
                  placeholder={`${tCommon('search')}...`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* ステータスフィルター */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
              aria-label="ステータスでフィルター"
            >
              <option value="all">{tFilter('allStatus')}</option>
              <option value="pending">{tStatus('pending')}</option>
              <option value="in_transit">{tStatus('in_transit')}</option>
              <option value="completed">{tStatus('completed')}</option>
            </select>

            {/* 拠点フィルター */}
            <select
              value={selectedLocationId}
              onChange={e => { setSelectedLocationId(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
              aria-label="拠点でフィルター"
            >
              <option value="">全拠点</option>
              {locationList.filter(l => l.isActive).map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <button onClick={() => openModal('advancedFilter')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
              <Filter className="w-4 h-4" />{tCommon('filter')}
            </button>
            <button onClick={() => openModal('filterPresets')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
              <Bookmark className="w-4 h-4" />{tCommon('presets')}
            </button>
            {permissions.canCreate && (
              <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />{tDelivery('addNew')}
              </button>
            )}
          </div>

          {/* 操作ボタン群 */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="データ操作">
            {permissions.canExportCsv && (
              <button onClick={() => openModal('export')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download className="w-4 h-4" />{tCommon('export')}
              </button>
            )}
            {permissions.canImportCsv && (
              <button onClick={() => openModal('import')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Upload className="w-4 h-4" />{tCommon('import')}
              </button>
            )}
            {permissions.canBackupRestore && (
              <button onClick={() => openModal('backup')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <Save className="w-4 h-4" />{tCommon('backupRestore')}
              </button>
            )}
            <button
              onClick={() => setUseVirtualScroll(v => !v)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${useVirtualScroll ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              aria-pressed={useVirtualScroll}
            >
              {useVirtualScroll ? '📜 仮想OFF' : '⚡ 仮想ON'}
            </button>
            {permissions.canCreate && (
              <button
                onClick={handleGenerateTestData}
                disabled={isGenerating}
                className="px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? '⏳ 生成中...' : '🗂️ テストデータ+200'}
              </button>
            )}
            {selectedIds.size > 0 && (
              <>
                {permissions.canBulkPrint && (
                  <button onClick={handleBulkPrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    {tCommon('print')} ({selectedIds.size})
                  </button>
                )}
                {permissions.canBulkStatusChange && (
                  <>
                    <button onClick={() => handleBulkStatusChange('in_transit')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{tStatus('in_transit')}に変更</button>
                    <button onClick={() => handleBulkStatusChange('completed')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{tStatus('completed')}に変更</button>
                  </>
                )}
                {permissions.canBulkDelete && (
                  <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{tDelivery('bulkDelete')}</button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 件数表示 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
            {tDelivery('totalCount', { count: orderedFilteredDeliveries.length })}
            {orderedFilteredDeliveries.length !== deliveries.length && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">（全{deliveries.length}件中）</span>
            )}
          </div>
          {useVirtualScroll && (
            <span className="text-xs text-purple-500 dark:text-purple-400">⚡ 仮想スクロールモード</span>
          )}
        </div>

        {/* テーブル */}
        {useVirtualScroll ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            {isLoading ? <LoadingSpinner /> : (
              <VirtualTable
                deliveries={orderedFilteredDeliveries}
                isAdmin={permissions.canEdit}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPrint={(delivery) => handlePrint(delivery.id)}
              />
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="配送データ一覧">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    {permissions.canDragAndDrop && <th className="px-4 py-3 w-8" />}
                    {permissions.canSelectAll && (
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" checked={isAllSelected} onChange={handleToggleSelectAll} className="w-4 h-4 cursor-pointer" aria-label="すべて選択" />
                      </th>
                    )}
                    {([
                      { key: 'id' as keyof Delivery, label: tDelivery('id') },
                      { key: 'name' as keyof Delivery, label: tDelivery('name') },
                      { key: 'address' as keyof Delivery, label: tDelivery('address') },
                      { key: 'status' as keyof Delivery, label: tDelivery('status') },
                      { key: 'deliveryDate' as keyof Delivery, label: tDelivery('deliveryDate') },
                    ]).map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        scope="col"
                        aria-sort={sortKey === key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        {label} {sortKey === key && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">拠点</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">{tCommon('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr><td colSpan={9}><LoadingSpinner /></td></tr>
                  ) : paginatedDeliveries.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">{tCommon('noData')}</td></tr>
                  ) : (
                    paginatedDeliveries.map(delivery => {
                      const isSelected = selectedIds.has(delivery.id);
                      const isDragOver = dragOverId === delivery.id;
                      return (
                        <tr
                          key={delivery.id}
                          draggable={permissions.canDragAndDrop}
                          onDragStart={e => handleDragStart(e, delivery.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={e => handleDragOver(e, delivery.id)}
                          onDrop={e => handleDrop(e, delivery.id)}
                          className={`transition-colors ${permissions.canDragAndDrop ? 'cursor-grab active:cursor-grabbing' : ''} ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} ${isDragOver ? 'border-t-2 border-blue-400' : ''}`}
                        >
                          {permissions.canDragAndDrop && <td className="px-2 py-3 text-gray-400 select-none">⠿</td>}
                          {permissions.canSelectAll && (
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={isSelected} onChange={() => handleToggleSelect(delivery.id)} className="w-4 h-4 cursor-pointer" aria-label={`${delivery.name}を選択`} />
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm">{delivery.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">{delivery.name}</td>
                          <td className="px-4 py-3 text-sm">{delivery.address}</td>
                          <td className="px-4 py-3 text-sm">
                            {permissions.canChangeStatus ? (
                              <select
                                value={delivery.status}
                                onChange={e => handleStatusChange(delivery.id, e.target.value as Delivery['status'])}
                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[delivery.status]}`}
                                aria-label={`${delivery.name}のステータス`}
                              >
                                <option value="pending">{tStatus('pending')}</option>
                                <option value="in_transit">{tStatus('in_transit')}</option>
                                <option value="completed">{tStatus('completed')}</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[delivery.status]}`}>
                                {statusLabels[delivery.status]}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">{delivery.deliveryDate}</td>
                          <td className="px-4 py-3 text-sm">{delivery.location?.name ?? <span className="text-gray-400">-</span>}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button onClick={() => handlePrint(delivery.id)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">{tCommon('print')}</button>
                              {permissions.canEdit && <button onClick={() => handleEdit(delivery)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800">{tCommon('edit')}</button>}
                              {permissions.canDelete && <button onClick={() => handleDelete(delivery.id)} className="text-red-600 dark:text-red-400 hover:text-red-800">{tCommon('delete')}</button>}
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
              <nav className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between" aria-label="ページネーション">
                <div className="text-sm text-gray-700 dark:text-gray-300">ページ {currentPage} / {totalPages}</div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">前へ</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">次へ</button>
                </div>
              </nav>
            )}
          </div>
        )}
      </main>

      {/* ── 配送登録/編集モーダル ── */}
      {modals.delivery && permissions.canCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 id="modal-title" className="text-xl font-bold mb-4">
              {editingDelivery ? tDelivery('editDelivery') : tDelivery('addNew')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* 氏名 */}
              <div>
                <label htmlFor="delivery-name" className="block text-sm font-medium mb-1">
                  {tDelivery('name')} <span className="text-red-500">*</span>
                </label>
                <input id="delivery-name" type="text" value={formData.name}
                  onChange={e => { setFormData({ ...formData, name: e.target.value }); clearError('name'); }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  aria-invalid={!!formErrors.name} />
                {formErrors.name && <p className="mt-1 text-sm text-red-600" role="alert">{formErrors.name}</p>}
              </div>
              {/* 住所 */}
              <div>
                <label htmlFor="delivery-address" className="block text-sm font-medium mb-1">
                  {tDelivery('address')} <span className="text-red-500">*</span>
                </label>
                <input id="delivery-address" type="text" value={formData.address}
                  onChange={e => { setFormData({ ...formData, address: e.target.value }); clearError('address'); }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 ${formErrors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  aria-invalid={!!formErrors.address} />
                {formErrors.address && <p className="mt-1 text-sm text-red-600" role="alert">{formErrors.address}</p>}
              </div>
              {/* ステータス */}
              <div>
                <label htmlFor="delivery-status" className="block text-sm font-medium mb-1">{tDelivery('status')}</label>
                <select id="delivery-status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as Delivery['status'] })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  <option value="pending">{tStatus('pending')}</option>
                  <option value="in_transit">{tStatus('in_transit')}</option>
                  <option value="completed">{tStatus('completed')}</option>
                </select>
              </div>
              {/* 担当者 */}
              <div>
                <label htmlFor="delivery-staff" className="block text-sm font-medium mb-1">担当者</label>
                <select id="delivery-staff" value={formData.staffId ?? ''} onChange={e => setFormData({ ...formData, staffId: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  <option value="">未割当</option>
                  {staffList.filter(s => s.isActive).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {/* 顧客 */}
              <div>
                <label htmlFor="delivery-customer" className="block text-sm font-medium mb-1">顧客</label>
                <select id="delivery-customer" value={formData.customerId ?? ''} onChange={e => setFormData({ ...formData, customerId: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  <option value="">未選択</option>
                  {customerList.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {/* 拠点 */}
              <div>
                <label htmlFor="delivery-location" className="block text-sm font-medium mb-1">拠点</label>
                <select id="delivery-location" value={formData.locationId ?? ''} onChange={e => setFormData({ ...formData, locationId: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  <option value="">未選択</option>
                  {locationList.filter(l => l.isActive).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              {/* 配送日 */}
              <div>
                <label htmlFor="delivery-date" className="block text-sm font-medium mb-1">
                  {tDelivery('deliveryDate')} <span className="text-red-500">*</span>
                </label>
                <input id="delivery-date" type="date" value={formData.deliveryDate}
                  onChange={e => { setFormData({ ...formData, deliveryDate: e.target.value }); clearError('deliveryDate'); }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 ${formErrors.deliveryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  aria-invalid={!!formErrors.deliveryDate} />
                {formErrors.deliveryDate && <p className="mt-1 text-sm text-red-600" role="alert">{formErrors.deliveryDate}</p>}
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingDelivery ? tCommon('save') : tCommon('add')}
                </button>
                <button type="button" onClick={() => { closeModal('delivery'); clearAllErrors(); }} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                  {tCommon('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 各種モーダル ── */}
      <CsvExportModal isOpen={modals.export} deliveries={deliveries} filteredDeliveries={orderedFilteredDeliveries} selectedIds={selectedIds} onClose={() => closeModal('export')} />

      {modals.import && permissions.canImportCsv && (
        <CsvImportModal onClose={() => closeModal('import')} onImportComplete={async (data, mode) => {
          try {
            if (mode === 'overwrite') {
              await Promise.all(deliveries.map(d => deliveryApi.delete(d.id)));
              const created = await Promise.all(data.map(d => deliveryApi.create({ name: d.name, address: d.address, status: d.status, deliveryDate: d.deliveryDate })));
              setDeliveries(created);
            } else {
              const created = await Promise.all(data.map(d => deliveryApi.create({ name: d.name, address: d.address, status: d.status, deliveryDate: d.deliveryDate })));
              setDeliveries(prev => [...prev, ...created]);
            }
            closeModal('import');
            clearFilterCache();
          } catch (err) {
            alert(err instanceof Error ? err.message : 'インポートに失敗しました');
          }
        }} />
      )}

      <BackupRestoreModal
        isOpen={modals.backup}
        deliveries={deliveries}
        onRestore={async (data) => {
          if (!permissions.canBackupRestore) return;
          try {
            await Promise.all(deliveries.map(d => deliveryApi.delete(d.id)));
            const created = await Promise.all(data.map(d => deliveryApi.create({ name: d.name, address: d.address, status: d.status, deliveryDate: d.deliveryDate })));
            setDeliveries(created);
            closeModal('backup');
            clearFilterCache();
          } catch (err) {
            alert(err instanceof Error ? err.message : 'リストアに失敗しました');
          }
        }}
        onClose={() => closeModal('backup')}
      />

      <NotificationSettingsModal
        isOpen={modals.notification}
        settings={notificationSettings}
        onSettingsChange={setNotificationSettings}
        notificationPermission={typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'}
        onRequestPermission={async () => { if ('Notification' in window) await Notification.requestPermission(); }}
        onTestNotification={() => { if (Notification.permission === 'granted') new Notification('テスト通知', { body: '通知機能が正常に動作しています' }); }}
        onClose={() => closeModal('notification')}
      />

      {permissions.canViewAnalytics && (
        <AnalyticsModal isOpen={modals.analytics} deliveries={deliveries} onClose={() => closeModal('analytics')} />
      )}

      <AdvancedFilterModal
        isOpen={modals.advancedFilter}
        filters={advancedFilters}
        onApply={filters => { applyFilters(filters); closeModal('advancedFilter'); }}
        onClose={() => closeModal('advancedFilter')}
      />

      <FilterPresetsModal
        isOpen={modals.filterPresets}
        presets={filterPresets}
        currentFilters={advancedFilters}
        onSavePreset={savePreset}
        onLoadPreset={preset => { loadPreset(preset); closeModal('filterPresets'); }}
        onDeletePreset={deletePreset}
        onClose={() => closeModal('filterPresets')}
      />

      <KeyboardShortcutHelp isOpen={modals.shortcutHelp} isAdmin={permissions.canCreate} onClose={() => closeModal('shortcutHelp')} />
      <MasterModal isOpen={modals.master} type={masterModalType} onClose={() => closeModal('master')} />
      <DashboardCustomizeModal isOpen={modals.dashboardCustomize} widgets={dashboardWidgets} layout={dashboardLayout} onApply={handleDashboardCustomize} onClose={() => closeModal('dashboardCustomize')} />
      <ReportModal isOpen={modals.report} deliveries={deliveries} onClose={() => closeModal('report')} />
      <EmailNotificationModal isOpen={modals.email} deliveries={deliveries} onClose={() => closeModal('email')} />
      <HistoryModal isOpen={modals.history} onClose={() => closeModal('history')} />
      <PerformanceMonitor />
    </div>
  );
}