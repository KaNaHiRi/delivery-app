'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Plus, Search, Download, Upload, Save, Bell, BarChart3,
  Filter, X, Bookmark, RefreshCw, Play, Pause, ShieldCheck, ShieldAlert,
  Loader2
} from 'lucide-react';
import type { 
  Delivery, NotificationSettings, PeriodSelection,
  AdvancedFilters, FilterPreset, QuickFilterType
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
import UserMenu from './components/UserMenu';
import { VirtualTable } from '@/app/components/VirtualTable';
import { generateTestData } from '@/app/utils/generateTestData';
import { 
  applyAdvancedFilters, applyQuickFilter, createEmptyFilters,
  hasActiveFilters, formatFilterDescription, clearFilterCache
} from './utils/filters';
import { getPermissions } from './utils/permissions';
import { usePerformanceMonitor } from './utils/performance';
import { useTranslations } from 'next-intl';
import { useInterval } from './hooks/useInterval';
import { useRole } from './hooks/useRole';
import { deliveryApi } from '@/lib/deliveryApi';
import KeyboardShortcutHelp from './components/KeyboardShortcutHelp';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Keyboard } from 'lucide-react';
import { createDeliverySchema } from './utils/validation';
import { useFormValidation } from './hooks/useFormValidation';

import MasterModal from './components/MasterModal';
import type { MasterType } from './types/master';
import { staffApi, customerApi } from '@/lib/masterApi';
import type { Staff, Customer } from './types/master';
import { BookUser } from 'lucide-react';

const REFRESH_INTERVALS = [
  { label: '5秒', value: 5000 },
  { label: '10秒', value: 10000 },
  { label: '30秒', value: 30000 },
  { label: '1分', value: 60000 },
] as const;

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

export default function Home() {
  usePerformanceMonitor('Home');

  const { role } = useRole();
  const permissions = useMemo(() => getPermissions(role), [role]);

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
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
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ enabled: false, deadlineAlert: true, statusChangeAlert: true });
  const [periodSelection, setPeriodSelection] = useState<PeriodSelection>({ type: 'week' });
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(createEmptyFilters());
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showFilterPresets, setShowFilterPresets] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [locale, setLocale] = useState('ja');
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  // ── Day 27: 仮想スクロール ──────────────────────────
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  // ────────────────────────────────────────────────────
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  const dragItemId = useRef<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tCommon = useTranslations('common');
  const tDelivery = useTranslations('delivery');
  const tStatus = useTranslations('status');
  const tFilter = useTranslations('filter');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'pending' as Delivery['status'],
    deliveryDate: '',
    staffId: null as string | null,
    customerId: null as string | null,
  });
  const { errors: formErrors, validate: validateForm, clearError, clearAllErrors } = useFormValidation(createDeliverySchema);

  const fetchDeliveries = useCallback(async () => {
    try {
      setApiError(null);
      const data = await deliveryApi.getAll();
      setDeliveries(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const cookieLocale = document.cookie.split(';').find(c => c.trim().startsWith('locale='))?.split('=')?.[1];
    if (cookieLocale) setLocale(cookieLocale);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    fetchDeliveries();
  }, [isMounted, fetchDeliveries]);

  // マスタデータ取得
  useEffect(() => {
    if (!isMounted) return;
    staffApi.getAll().then(setStaffList).catch(() => {});
    customerApi.getAll().then(setCustomerList).catch(() => {});
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const savedNotificationSettings = localStorage.getItem('notification_settings');
    if (savedNotificationSettings) setNotificationSettings(JSON.parse(savedNotificationSettings));
    const savedPeriodSelection = localStorage.getItem('analytics_period_selection');
    if (savedPeriodSelection) setPeriodSelection(JSON.parse(savedPeriodSelection));
    const savedAdvancedFilters = localStorage.getItem('advanced_filters');
    if (savedAdvancedFilters) setAdvancedFilters(JSON.parse(savedAdvancedFilters));
    const savedFilterPresets = localStorage.getItem('filter_presets');
    if (savedFilterPresets) setFilterPresets(JSON.parse(savedFilterPresets));
  }, [isMounted]);

  useEffect(() => { if (!isMounted) return; localStorage.setItem('notification_settings', JSON.stringify(notificationSettings)); }, [notificationSettings, isMounted]);
  useEffect(() => { if (!isMounted) return; localStorage.setItem('analytics_period_selection', JSON.stringify(periodSelection)); }, [periodSelection, isMounted]);
  useEffect(() => { if (!isMounted) return; localStorage.setItem('advanced_filters', JSON.stringify(advancedFilters)); }, [advancedFilters, isMounted]);
  useEffect(() => { if (!isMounted) return; localStorage.setItem('filter_presets', JSON.stringify(filterPresets)); }, [filterPresets, isMounted]);
  useEffect(() => { if (!isMounted || orderedIds.length === 0) return; localStorage.setItem('delivery_app_order', JSON.stringify(orderedIds)); }, [orderedIds, isMounted]);
  useEffect(() => {
    if (!isMounted) return;
    const saved = localStorage.getItem('delivery_app_order');
    const savedOrder: string[] = saved ? JSON.parse(saved) : [];
    const currentIds = deliveries.map(d => d.id);
    const merged = [...savedOrder.filter(id => currentIds.includes(id)), ...currentIds.filter(id => !savedOrder.includes(id))];
    setOrderedIds(merged);
  }, [deliveries, isMounted]);

  const statusLabels = useMemo(() => ({ pending: tStatus('pending'), in_transit: tStatus('in_transit'), completed: tStatus('completed') }), [tStatus]);
  const quickFilters = useMemo(() => [
    { type: 'today' as QuickFilterType, label: tFilter('today'), icon: '📅' },
    { type: 'tomorrow' as QuickFilterType, label: tFilter('tomorrow'), icon: '📆' },
    { type: 'this_week' as QuickFilterType, label: tFilter('thisWeek'), icon: '🗓️' },
    { type: 'overdue' as QuickFilterType, label: tFilter('overdue'), icon: '⚠️' },
    { type: 'in_transit_only' as QuickFilterType, label: tFilter('inTransitOnly'), icon: '🚚' },
    { type: 'completed_today' as QuickFilterType, label: tFilter('completedToday'), icon: '✅' },
  ], [tFilter]);

  const filteredAndSortedDeliveries = useMemo(() => {
    let result = deliveries;
    if (searchTerm) { const term = searchTerm.toLowerCase(); result = result.filter(d => d.name.toLowerCase().includes(term) || d.address.toLowerCase().includes(term) || d.id.toLowerCase().includes(term)); }
    if (statusFilter !== 'all') result = result.filter(d => d.status === statusFilter);
    if (activeQuickFilter) result = applyQuickFilter(result, activeQuickFilter);
    if (hasActiveFilters(advancedFilters)) result = applyAdvancedFilters(result, advancedFilters);
    return [...result].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [deliveries, searchTerm, statusFilter, sortKey, sortOrder, activeQuickFilter, advancedFilters]);

  const orderedFilteredDeliveries = useMemo(() => {
    if (orderedIds.length === 0) return filteredAndSortedDeliveries;
    const map = new Map(filteredAndSortedDeliveries.map(d => [d.id, d]));
    const ordered = orderedIds.flatMap(id => map.has(id) ? [map.get(id)!] : []);
    const orderedIdSet = new Set(orderedIds);
    return [...ordered, ...filteredAndSortedDeliveries.filter(d => !orderedIdSet.has(d.id))];
  }, [filteredAndSortedDeliveries, orderedIds]);

  const paginatedDeliveries = useMemo(() => orderedFilteredDeliveries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [orderedFilteredDeliveries, currentPage, itemsPerPage]);
  const totalPages = useMemo(() => Math.ceil(orderedFilteredDeliveries.length / itemsPerPage), [orderedFilteredDeliveries.length, itemsPerPage]);
  const isAllSelected = useMemo(() => paginatedDeliveries.length > 0 && paginatedDeliveries.every(d => selectedIds.has(d.id)), [paginatedDeliveries, selectedIds]);

  // ── Day 27: テストデータ生成（adminのみ・パフォーマンステスト用）──
  // C#: List<Delivery> を一括生成して HttpClient.PostAsync() で送信するのと同等
  const handleGenerateTestData = useCallback(async () => {
    if (!permissions.canCreate) return;
    const count = 200;
    setIsGenerating(true);
    try {
      const testData = generateTestData(count);
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
      alert(`${count}件のテストデータを追加しました`);
    } catch {
      alert('テストデータの生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  }, [permissions.canCreate, fetchDeliveries]);
  // ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();

  // ── クライアントサイドバリデーション ────────────────────
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
    setFormData({ name: '', address: '', status: 'pending' as Delivery['status'], deliveryDate: '', staffId: null, customerId: null });
    
    setEditingDelivery(null);
    setIsModalOpen(false);
    clearAllErrors();
    clearFilterCache();
  } catch (err) {
    alert(err instanceof Error ? err.message : '操作に失敗しました');
  }
}, [editingDelivery, formData, permissions.canCreate, permissions.canEdit, validateForm, clearAllErrors]);

  const handleEdit = useCallback((delivery: Delivery) => {
    if (!permissions.canEdit) return;
    setEditingDelivery(delivery);
    setFormData({ name: delivery.name, address: delivery.address, status: delivery.status, deliveryDate: delivery.deliveryDate, staffId: delivery.staffId ?? null, customerId: delivery.customerId ?? null });
    setIsModalOpen(true);
  }, [permissions.canEdit]);

  const handleDelete = useCallback(async (id: string) => {
    if (!permissions.canDelete) return;
    if (confirm(tDelivery('deleteConfirm'))) {
      try {
        await deliveryApi.delete(id);
        setDeliveries(prev => prev.filter(d => d.id !== id));
        setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        clearFilterCache();
      } catch (err) {
        alert(err instanceof Error ? err.message : '削除に失敗しました');
      }
    }
  }, [tDelivery, permissions.canDelete]);

  const handleStatusChange = useCallback(async (id: string, newStatus: Delivery['status']) => {
    if (!permissions.canChangeStatus) return;
    try {
      const updated = await deliveryApi.update(id, { status: newStatus });
      setDeliveries(prev => prev.map(d => d.id === id ? updated : d));
      clearFilterCache();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ステータス更新に失敗しました');
    }
  }, [permissions.canChangeStatus]);

  const handleToggleSelect = useCallback((id: string) => {
    if (!permissions.canSelectAll) return;
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }, [permissions.canSelectAll]);

  const handleToggleSelectAll = useCallback(() => {
    if (!permissions.canSelectAll) return;
    isAllSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(paginatedDeliveries.map(d => d.id)));
  }, [isAllSelected, paginatedDeliveries, permissions.canSelectAll]);

  const handleBulkDelete = useCallback(async () => {
    if (!permissions.canBulkDelete || selectedIds.size === 0) return;
    if (confirm(tDelivery('bulkDeleteConfirm', { count: selectedIds.size }))) {
      try {
        await Promise.all(Array.from(selectedIds).map(id => deliveryApi.delete(id)));
        setDeliveries(prev => prev.filter(d => !selectedIds.has(d.id)));
        setSelectedIds(new Set());
        clearFilterCache();
      } catch (err) {
        alert(err instanceof Error ? err.message : '一括削除に失敗しました');
      }
    }
  }, [selectedIds, tDelivery, permissions.canBulkDelete]);

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
  }, [selectedIds, permissions.canBulkStatusChange]);

  const handleSort = useCallback((key: keyof Delivery) => {
    if (sortKey === key) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortOrder('asc'); }
  }, [sortKey]);

  const handlePrint = useCallback((id: string) => { setPrintDeliveryIds([id]); setIsPrintPreview(true); }, []);
  const handleBulkPrint = useCallback(() => { if (!permissions.canBulkPrint || selectedIds.size === 0) return; setPrintDeliveryIds(Array.from(selectedIds)); setIsPrintPreview(true); }, [selectedIds, permissions.canBulkPrint]);

  const handleQuickFilter = useCallback((filterType: QuickFilterType) => {
    if (activeQuickFilter === filterType) setActiveQuickFilter(null);
    else { setActiveQuickFilter(filterType); setAdvancedFilters(createEmptyFilters()); }
    setCurrentPage(1);
  }, [activeQuickFilter]);

  const handleClearFilters = useCallback(() => { setAdvancedFilters(createEmptyFilters()); setActiveQuickFilter(null); setSearchTerm(''); setStatusFilter('all'); setCurrentPage(1); }, []);
  const handleOpenModal = useCallback(() => { if (!permissions.canCreate) return; setEditingDelivery(null); setFormData({ name: '', address: '', status: 'pending', deliveryDate: '', staffId: null, customerId: null }); setIsModalOpen(true); }, [permissions.canCreate]);
  const handleAutoRefresh = useCallback(() => { fetchDeliveries(); }, [fetchDeliveries]);
  const anyModalOpen =
    isModalOpen || showExportModal || showImportModal ||
    showBackupRestoreModal || showNotificationSettings ||
    isAnalyticsModalOpen || showAdvancedFilter ||
    showFilterPresets || showShortcutHelp;

  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterModalType, setMasterModalType] = useState<MasterType>('staff');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);

  useKeyboardShortcuts(
    {
      onNew: handleOpenModal,
      onFocus: () => searchInputRef.current?.focus(),
      onVirtual: () => setUseVirtualScroll(v => !v),
      onRefresh: fetchDeliveries,
      onHelp: () => setShowShortcutHelp(true),
      onEscape: () => {
        if (showShortcutHelp) { setShowShortcutHelp(false); return; }
        if (isModalOpen) { setIsModalOpen(false); return; }
        if (showAdvancedFilter) { setShowAdvancedFilter(false); return; }
        if (showFilterPresets) { setShowFilterPresets(false); return; }
        if (showExportModal) { setShowExportModal(false); return; }
        if (showImportModal) { setShowImportModal(false); return; }
        if (showBackupRestoreModal) { setShowBackupRestoreModal(false); return; }
        if (showNotificationSettings) { setShowNotificationSettings(false); return; }
        if (isAnalyticsModalOpen) { setIsAnalyticsModalOpen(false); return; }
        // フィルターが有効なら解除
        if (hasActiveFilters(advancedFilters) || activeQuickFilter) {
          handleClearFilters();
        }
      },
    },
    !anyModalOpen || true // Escapeは常に有効にするためtrueを渡す
  );
  // ────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => { if (!permissions.canDragAndDrop) return; dragItemId.current = id; e.dataTransfer.effectAllowed = 'move'; (e.currentTarget as HTMLElement).style.opacity = '0.5'; }, [permissions.canDragAndDrop]);
  const handleDragEnd = useCallback((e: React.DragEvent) => { (e.currentTarget as HTMLElement).style.opacity = '1'; dragItemId.current = null; setDragOverId(null); }, []);
  const handleDragOver = useCallback((e: React.DragEvent, id: string) => { if (!permissions.canDragAndDrop) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverId(id); }, [permissions.canDragAndDrop]);
  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    if (!permissions.canDragAndDrop) return;
    e.preventDefault();
    const sourceId = dragItemId.current;
    if (!sourceId || sourceId === targetId) { setDragOverId(null); return; }
    const newOrdered = [...orderedIds];
    const si = newOrdered.indexOf(sourceId); const ti = newOrdered.indexOf(targetId);
    if (si === -1 || ti === -1) { setDragOverId(null); return; }
    const [removed] = newOrdered.splice(si, 1); newOrdered.splice(ti, 0, removed);
    setOrderedIds(newOrdered); setDragOverId(null);
  }, [orderedIds, permissions.canDragAndDrop]);

  if (!isMounted) return null;
  if (isPrintPreview) {
    return <PrintableDeliverySlip deliveries={deliveries.filter(d => printDeliveryIds.includes(d.id))} onClose={() => setIsPrintPreview(false)} />;
  }

  const statusColors = { pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
  const roleBadge = role === 'admin' ? { label: '👑 管理者', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' } : role === 'user' ? { label: '👤 一般ユーザー', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' } : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{tCommon('appTitle')}</h1>
              {roleBadge && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge.className}`}>{roleBadge.label}</span>}
              <span className="text-sm text-gray-500 dark:text-gray-400">Day 34: Zodバリデーション</span>
            </div>
            <div className="flex items-center gap-2">
              {permissions.canViewAnalytics && (
                <button onClick={() => setIsAnalyticsModalOpen(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2" aria-label="分析モーダルを開く">
                  <BarChart3 className="w-4 h-4" aria-hidden="true" /><span>{tCommon('analytics') ?? 'Analytics'}</span>
                </button>
              )}
              {permissions.canCreate && (
              <button
                onClick={() => { setMasterModalType('staff'); setShowMasterModal(true); }}
                className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm"
                aria-label="マスタ管理を開く"
              >
                <BookUser className="w-4 h-4" />マスタ
              </button>
              )}
              <button onClick={() => setShowNotificationSettings(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="通知設定を開く"><Bell className="w-5 h-5" /></button>
              <LanguageSwitcher currentLocale={locale} />
              
              <button
                onClick={() => setShowShortcutHelp(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="キーボードショートカット一覧を開く"
                title="キーボードショートカット (?)">
                <Keyboard className="w-5 h-5" aria-hidden="true" />
              </button>
              
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        <DashboardStats deliveries={deliveries} />
        <RoleBanner role={role} />
        <AutoRefreshBar onRefresh={handleAutoRefresh} />

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
            <div className="flex items-center justify-between">
              <span className="text-red-700 dark:text-red-300 text-sm">⚠️ {apiError}</span>
              <button onClick={fetchDeliveries} className="text-sm text-red-600 dark:text-red-400 hover:underline ml-4">再試行</button>
            </div>
          </div>
        )}

        <div className="mb-6" role="group" aria-label="クイックフィルター">
          <div className="flex flex-wrap gap-2">
            {quickFilters.map(filter => (
              <button key={filter.type} onClick={() => handleQuickFilter(filter.type)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeQuickFilter === filter.type ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`} aria-pressed={activeQuickFilter === filter.type} aria-label={`${filter.label}でフィルター`}>
                <span className="mr-1" aria-hidden="true">{filter.icon}</span>{filter.label}
              </button>
            ))}
          </div>
        </div>

        {(hasActiveFilters(advancedFilters) || activeQuickFilter) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800" role="status" aria-live="polite">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">適用中のフィルター:</span>
                {activeQuickFilter && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm">{quickFilters.find(f => f.type === activeQuickFilter)?.label}</span>}
                {hasActiveFilters(advancedFilters) && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm">{formatFilterDescription(advancedFilters)}</span>}
              </div>
              <button onClick={handleClearFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1" aria-label="フィルターをクリア">
                <X className="w-4 h-4" />{tCommon('reset')}
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search-input" className="sr-only">配送データを検索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                <input id="search-input" ref={searchInputRef} type="text" placeholder={`${tCommon('search')}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" aria-label="配送データを検索" aria-describedby="search-help" />
              </div>
              <span id="search-help" className="sr-only">名前、住所、またはIDを入力して検索</span>
            </div>
            <div>
              <label htmlFor="status-filter" className="sr-only">ステータスでフィルター</label>
              <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" aria-label="ステータスでフィルター">
                <option value="all">{tFilter('allStatus')}</option>
                <option value="pending">{tStatus('pending')}</option>
                <option value="in_transit">{tStatus('in_transit')}</option>
                <option value="completed">{tStatus('completed')}</option>
              </select>
            </div>
            <button onClick={() => setShowAdvancedFilter(true)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2" aria-label="詳細フィルター">
              <Filter className="w-4 h-4" />{tCommon('filter')}
            </button>
            <button onClick={() => setShowFilterPresets(true)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2" aria-label="フィルタープリセット">
              <Bookmark className="w-4 h-4" />{tCommon('presets')}
            </button>
            {permissions.canCreate && (
              <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2" aria-label="新規配送データを登録">
                <Plus className="w-4 h-4" />{tDelivery('addNew')}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="データ操作">
            {permissions.canExportCsv && <button onClick={() => setShowExportModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2" aria-label="エクスポート"><Download className="w-4 h-4" />{tCommon('export')}</button>}
            {permissions.canImportCsv && <button onClick={() => setShowImportModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2" aria-label="インポート"><Upload className="w-4 h-4" />{tCommon('import')}</button>}
            {permissions.canBackupRestore && <button onClick={() => setShowBackupRestoreModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2" aria-label="バックアップ/リストア"><Save className="w-4 h-4" />{tCommon('backupRestore')}</button>}

            {/* ── Day 27: 仮想スクロール切替 & テストデータ生成 ── */}
            <button
              onClick={() => setUseVirtualScroll(v => !v)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                useVirtualScroll
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
              title={useVirtualScroll ? '通常テーブルに切替' : '仮想スクロールに切替（大量データ向け）'}
              aria-pressed={useVirtualScroll}
            >
              {useVirtualScroll ? '📜 仮想OFF' : '⚡ 仮想ON'}
            </button>
            {permissions.canCreate && (
              <button
                onClick={handleGenerateTestData}
                disabled={isGenerating}
                className="px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                title="200件のテストデータを追加（パフォーマンス確認用）"
              >
                {isGenerating ? '⏳ 生成中...' : '🗂️ テストデータ+200'}
              </button>
            )}
            {/* ─────────────────────────────────────────────────── */}

            {selectedIds.size > 0 && (
              <>
                {permissions.canBulkPrint && <button onClick={handleBulkPrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" aria-label={`${selectedIds.size}件印刷`}>{tCommon('print')} ({selectedIds.size})</button>}
                {permissions.canBulkStatusChange && (
                  <>
                    <button onClick={() => handleBulkStatusChange('in_transit')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{tStatus('in_transit')}に変更</button>
                    <button onClick={() => handleBulkStatusChange('completed')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{tStatus('completed')}に変更</button>
                  </>
                )}
                {permissions.canBulkDelete && <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{tDelivery('bulkDelete')}</button>}
              </>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
            {tDelivery('totalCount', { count: orderedFilteredDeliveries.length })}
            {orderedFilteredDeliveries.length !== deliveries.length && <span className="ml-2 text-blue-600 dark:text-blue-400">（全{deliveries.length}件中）</span>}
          </div>
          {!useVirtualScroll && permissions.canDragAndDrop && <span className="text-xs text-gray-400 dark:text-gray-500">↕ 行をドラッグして順番を変更できます</span>}
          {useVirtualScroll && <span className="text-xs text-purple-500 dark:text-purple-400">⚡ 仮想スクロールモード — ページネーションなしで全件表示</span>}
        </div>

        {/* ── Day 27: 仮想スクロール / 通常テーブル 切替 ── */}
        {useVirtualScroll ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
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
          // ── 通常テーブル（既存コード） ──────────────────────
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="配送データ一覧">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr role="row">
                    {permissions.canDragAndDrop && <th className="px-4 py-3 text-left w-8" role="columnheader" scope="col"></th>}
                    {permissions.canSelectAll && (
                      <th className="px-4 py-3 text-left" role="columnheader" scope="col">
                        <input type="checkbox" checked={isAllSelected} onChange={handleToggleSelectAll} className="w-4 h-4 cursor-pointer" aria-label="すべて選択" />
                      </th>
                    )}
                    {[{ key: 'id' as keyof Delivery, label: tDelivery('id') }, { key: 'name' as keyof Delivery, label: tDelivery('name') }, { key: 'address' as keyof Delivery, label: tDelivery('address') }, { key: 'status' as keyof Delivery, label: tDelivery('status') }, { key: 'deliveryDate' as keyof Delivery, label: tDelivery('deliveryDate') }].map(({ key, label }) => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort(key)} role="columnheader" scope="col" aria-sort={sortKey === key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(key); } }}>
                        {label} {sortKey === key && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" role="columnheader" scope="col">{tCommon('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr role="row">
                      <td colSpan={6 + (permissions.canDragAndDrop ? 1 : 0) + (permissions.canSelectAll ? 1 : 0)} role="cell">
                        <LoadingSpinner />
                      </td>
                    </tr>
                  ) : paginatedDeliveries.length === 0 ? (
                    <tr role="row"><td colSpan={6 + (permissions.canDragAndDrop ? 1 : 0) + (permissions.canSelectAll ? 1 : 0)} className="px-4 py-8 text-center text-gray-500" role="cell">{tCommon('noData')}</td></tr>
                  ) : (
                    paginatedDeliveries.map(delivery => {
                      const isSelected = selectedIds.has(delivery.id);
                      const isDragOver = dragOverId === delivery.id;
                      return (
                        <tr key={delivery.id} draggable={permissions.canDragAndDrop} onDragStart={e => handleDragStart(e, delivery.id)} onDragEnd={handleDragEnd} onDragOver={e => handleDragOver(e, delivery.id)} onDrop={e => handleDrop(e, delivery.id)} className={`transition-colors ${permissions.canDragAndDrop ? 'cursor-grab active:cursor-grabbing' : ''} ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} ${isDragOver ? 'border-t-2 border-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''}`} role="row" aria-label={permissions.canDragAndDrop ? `${delivery.name} - ドラッグで並び替え可能` : delivery.name}>
                          {permissions.canDragAndDrop && <td className="px-2 py-3 text-gray-400 dark:text-gray-500 select-none" role="cell"><span className="text-lg leading-none">⠿</span></td>}
                          {permissions.canSelectAll && <td className="px-4 py-3" role="cell"><input type="checkbox" checked={isSelected} onChange={() => handleToggleSelect(delivery.id)} className="w-4 h-4 cursor-pointer" aria-label={`${delivery.name}を選択`} /></td>}
                          <td className="px-4 py-3 text-sm" role="cell">{delivery.id}</td>
                          <td className="px-4 py-3 text-sm font-medium" role="cell">{delivery.name}</td>
                          <td className="px-4 py-3 text-sm" role="cell">{delivery.address}</td>
                          <td className="px-4 py-3 text-sm" role="cell">
                            {permissions.canChangeStatus ? (
                              <select value={delivery.status} onChange={e => handleStatusChange(delivery.id, e.target.value as Delivery['status'])} className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer appearance-none ${statusColors[delivery.status]}`} aria-label={`${delivery.name}のステータス`}>
                                <option value="pending">{tStatus('pending')}</option>
                                <option value="in_transit">{tStatus('in_transit')}</option>
                                <option value="completed">{tStatus('completed')}</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs ${statusColors[delivery.status]}`}>{statusLabels[delivery.status]}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm" role="cell">{delivery.deliveryDate}</td>
                          <td className="px-4 py-3 text-sm" role="cell">
                            <div className="flex gap-2">
                              <button onClick={() => handlePrint(delivery.id)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800" aria-label={`${delivery.name}を印刷`}>{tCommon('print')}</button>
                              {permissions.canEdit && <button onClick={() => handleEdit(delivery)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800" aria-label={`${delivery.name}を編集`}>{tCommon('edit')}</button>}
                              {permissions.canDelete && <button onClick={() => handleDelete(delivery.id)} className="text-red-600 dark:text-red-400 hover:text-red-800" aria-label={`${delivery.name}を削除`}>{tCommon('delete')}</button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between" aria-label="ページネーション">
                <div className="text-sm text-gray-700 dark:text-gray-300" role="status" aria-live="polite">ページ {currentPage} / {totalPages}</div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="前のページ">前へ</button>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="次のページ">次へ</button>
                </div>
              </nav>
            )}
          </div>
        )}
        {/* ─────────────────────────────────────────────────────── */}
      </main>

      {isModalOpen && permissions.canCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 id="modal-title" className="text-xl font-bold mb-4">
              {editingDelivery ? tDelivery('editDelivery') : tDelivery('addNew')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* 氏名 */}
              <div>
                <label htmlFor="delivery-name" className="block text-sm font-medium mb-1">
                  {tDelivery('name')} <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="delivery-name"
                  type="text"
                  value={formData.name}
                  onChange={e => {
                    setFormData({ ...formData, name: e.target.value });
                    clearError('name');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  aria-describedby={formErrors.name ? 'name-error' : undefined}
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* 住所 */}
              <div>
                <label htmlFor="delivery-address" className="block text-sm font-medium mb-1">
                  {tDelivery('address')} <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="delivery-address"
                  type="text"
                  value={formData.address}
                  onChange={e => {
                    setFormData({ ...formData, address: e.target.value });
                    clearError('address');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 ${
                    formErrors.address
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  aria-describedby={formErrors.address ? 'address-error' : undefined}
                  aria-invalid={!!formErrors.address}
                />
                {formErrors.address && (
                  <p id="address-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* ステータス */}
              <div>
                <label htmlFor="delivery-status" className="block text-sm font-medium mb-1">
                  {tDelivery('status')}
                </label>
                <select
                  id="delivery-status"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as Delivery['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="pending">{tStatus('pending')}</option>
                  <option value="in_transit">{tStatus('in_transit')}</option>
                  <option value="completed">{tStatus('completed')}</option>
                </select>
              </div>

              {/* 担当者選択 */}
              <div>
                <label htmlFor="delivery-staff" className="block text-sm font-medium mb-1">
                  担当者
                </label>
                <select
                  id="delivery-staff"
                  value={formData.staffId ?? ''}
                  onChange={e => setFormData({ ...formData, staffId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">未割当</option>
                  {staffList.filter(s => s.isActive).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* 顧客選択 */}
              <div>
                <label htmlFor="delivery-customer" className="block text-sm font-medium mb-1">
                  顧客
                </label>
                <select
                  id="delivery-customer"
                  value={formData.customerId ?? ''}
                  onChange={e => setFormData({ ...formData, customerId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">未選択</option>
                  {customerList.filter(c => c.isActive).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 配送日 */}
              <div>
                <label htmlFor="delivery-date" className="block text-sm font-medium mb-1">
                  {tDelivery('deliveryDate')} <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="delivery-date"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={e => {
                    setFormData({ ...formData, deliveryDate: e.target.value });
                    clearError('deliveryDate');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 ${
                    formErrors.deliveryDate
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  aria-describedby={formErrors.deliveryDate ? 'date-error' : undefined}
                  aria-invalid={!!formErrors.deliveryDate}
                />
                {formErrors.deliveryDate && (
                  <p id="date-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {formErrors.deliveryDate}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingDelivery ? tCommon('save') : tCommon('add')}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); clearAllErrors(); }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  {tCommon('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CsvExportModal isOpen={showExportModal} deliveries={deliveries} filteredDeliveries={orderedFilteredDeliveries} selectedIds={selectedIds} onClose={() => setShowExportModal(false)} />
      {showImportModal && permissions.canImportCsv && <CsvImportModal onClose={() => setShowImportModal(false)} onImportComplete={async (data, mode) => {
        try {
          if (mode === 'overwrite') {
            await Promise.all(deliveries.map(d => deliveryApi.delete(d.id)));
            const created = await Promise.all(data.map(d => deliveryApi.create({ name: d.name, address: d.address, status: d.status, deliveryDate: d.deliveryDate })));
            setDeliveries(created);
          } else {
            const created = await Promise.all(data.map(d => deliveryApi.create({ name: d.name, address: d.address, status: d.status, deliveryDate: d.deliveryDate })));
            setDeliveries(prev => [...prev, ...created]);
          }
          setShowImportModal(false);
          clearFilterCache();
        } catch (err) {
          alert(err instanceof Error ? err.message : 'インポートに失敗しました');
        }
      }} />}
      <BackupRestoreModal isOpen={showBackupRestoreModal} deliveries={deliveries} onRestore={async (data) => {
        if (!permissions.canBackupRestore) return;
        try {
          await Promise.all(deliveries.map(d => deliveryApi.delete(d.id)));
          const created = await Promise.all(data.map(d => deliveryApi.create({ name: d.name, address: d.address, status: d.status, deliveryDate: d.deliveryDate })));
          setDeliveries(created);
          setShowBackupRestoreModal(false);
          clearFilterCache();
        } catch (err) {
          alert(err instanceof Error ? err.message : 'リストアに失敗しました');
        }
      }} onClose={() => setShowBackupRestoreModal(false)} />
      <NotificationSettingsModal isOpen={showNotificationSettings} settings={notificationSettings} onSettingsChange={setNotificationSettings} notificationPermission={typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'} onRequestPermission={async () => { if ('Notification' in window) await Notification.requestPermission(); }} onTestNotification={() => { if (Notification.permission === 'granted') new Notification('テスト通知', { body: '通知機能が正常に動作しています', icon: '/icon.png' }); }} onClose={() => setShowNotificationSettings(false)} />
      {permissions.canViewAnalytics && <AnalyticsModal isOpen={isAnalyticsModalOpen} deliveries={deliveries} onClose={() => setIsAnalyticsModalOpen(false)} />}
      <AdvancedFilterModal isOpen={showAdvancedFilter} filters={advancedFilters} onApply={filters => { setAdvancedFilters(filters); setActiveQuickFilter(null); setShowAdvancedFilter(false); setCurrentPage(1); }} onClose={() => setShowAdvancedFilter(false)} />
      <FilterPresetsModal isOpen={showFilterPresets} presets={filterPresets} currentFilters={advancedFilters} onSavePreset={name => { setFilterPresets(prev => [...prev, { id: `preset_${Date.now()}`, name, filters: advancedFilters, createdAt: new Date().toISOString() }]); }} onLoadPreset={preset => { setAdvancedFilters(preset.filters); setActiveQuickFilter(null); setShowFilterPresets(false); setCurrentPage(1); }} onDeletePreset={presetId => setFilterPresets(prev => prev.filter(p => p.id !== presetId))} onClose={() => setShowFilterPresets(false)} />
      <KeyboardShortcutHelp
        isOpen={showShortcutHelp}
        isAdmin={permissions.canCreate}
        onClose={() => setShowShortcutHelp(false)}
      />      
      <MasterModal
        isOpen={showMasterModal}
        type={masterModalType}
        onClose={() => setShowMasterModal(false)}
      />
      <PerformanceMonitor />
    </div>
  );
}