'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Download, Upload, Trash2, Package, 
  TrendingUp, CheckCircle, Clock, Sun, Moon, Printer,
  Save, RotateCcw, Bell, BarChart3, Filter, Star, Zap
} from 'lucide-react';
import { Delivery, NotificationSettings, AdvancedFilters, FilterPreset, QuickFilterType } from './types/delivery';
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
import {
  isNotificationSupported,
  requestNotificationPermission,
  sendNotification,
  sendDeadlineAlert,
  sendStatusChangeNotification,
  loadNotificationSettings,
  saveNotificationSettings,
} from './utils/notifications';
import {
  applyAdvancedFilters,
  applyQuickFilter,
  createEmptyFilters,
  hasActiveFilters,
  formatFilterDescription,
} from './utils/filters';

export default function Home() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Delivery['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'deliveryDate'>('deliveryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBackupRestoreModal, setShowBackupRestoreModal] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [printDeliveries, setPrintDeliveries] = useState<Delivery[]>([]);
  
  // Day 14: 通知関連のstate
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    deadlineAlert: true,
    statusChangeAlert: true,
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const hasCheckedDeadline = useRef(false);

  // Day 15: 分析モーダル
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  // Day 18: 高度なフィルター機能
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(createEmptyFilters());
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showFilterPresets, setShowFilterPresets] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType | null>(null);

  // Day 18: Hydration Error対策
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'pending' as Delivery['status'],
    deliveryDate: '',
  });

  // Day 18: クライアントサイドマウント検知
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // LocalStorageからデータ読み込み（マウント後のみ）
  useEffect(() => {
    if (!isMounted) return;

    const stored = localStorage.getItem('delivery_app_data');
    if (stored) {
      setDeliveries(JSON.parse(stored));
    }

    const storedFilters = localStorage.getItem('delivery_app_filters');
    if (storedFilters) {
      const filters = JSON.parse(storedFilters);
      setStatusFilter(filters.statusFilter || 'all');
      setSortBy(filters.sortBy || 'deliveryDate');
      setSortOrder(filters.sortOrder || 'asc');
    }

    // Day 14: 通知設定を読み込み
    const settings = loadNotificationSettings();
    setNotificationSettings(settings);

    // 通知許可状態を取得
    if (isNotificationSupported()) {
      setNotificationPermission(Notification.permission);
    }

    // Day 18: フィルタープリセットを読み込み
    const storedPresets = localStorage.getItem('filter_presets');
    if (storedPresets) {
      setFilterPresets(JSON.parse(storedPresets));
    }

    // Day 18: 詳細フィルター設定を読み込み
    const storedAdvancedFilters = localStorage.getItem('advanced_filters');
    if (storedAdvancedFilters) {
      setAdvancedFilters(JSON.parse(storedAdvancedFilters));
    }
  }, [isMounted]);

  // データ保存
  useEffect(() => {
    if (!isMounted) return;
    if (deliveries.length > 0) {
      localStorage.setItem('delivery_app_data', JSON.stringify(deliveries));
    }
  }, [deliveries, isMounted]);

  // フィルター保存
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('delivery_app_filters', JSON.stringify({
      statusFilter,
      sortBy,
      sortOrder,
    }));
  }, [statusFilter, sortBy, sortOrder, isMounted]);

  // Day 18: 詳細フィルター保存
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('advanced_filters', JSON.stringify(advancedFilters));
  }, [advancedFilters, isMounted]);

  // Day 18: プリセット保存
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('filter_presets', JSON.stringify(filterPresets));
  }, [filterPresets, isMounted]);

  // Day 14: 配送期限アラートチェック（初回のみ）
  useEffect(() => {
    if (
      !hasCheckedDeadline.current &&
      deliveries.length > 0 &&
      notificationSettings.enabled &&
      notificationSettings.deadlineAlert &&
      notificationPermission === 'granted'
    ) {
      sendDeadlineAlert(deliveries, notificationSettings);
      hasCheckedDeadline.current = true;
    }
  }, [deliveries, notificationSettings, notificationPermission]);

  // Day 14: 通知許可リクエスト
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted' && !notificationSettings.enabled) {
      const newSettings = { ...notificationSettings, enabled: true };
      setNotificationSettings(newSettings);
      saveNotificationSettings(newSettings);
    }
  };

  // Day 14: 通知設定変更ハンドラ
  const handleNotificationSettingsChange = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    saveNotificationSettings(settings);
  };

  // Day 14: テスト通知送信
  const handleTestNotification = () => {
    sendNotification(
      '配送管理システム',
      'これはテスト通知です。通知が正常に動作しています！',
      'test-notification'
    );
  };

  // Day 14: ステータス変更時に通知を送信
  const handleStatusChangeWithNotification = (
    delivery: Delivery,
    newStatus: Delivery['status']
  ) => {
    const oldStatus = delivery.status;
    
    setDeliveries(deliveries.map(d =>
      d.id === delivery.id ? { ...d, status: newStatus } : d
    ));

    if (oldStatus !== newStatus) {
      sendStatusChangeNotification(delivery, oldStatus, newStatus, notificationSettings);
    }
  };

  // Day 18: 詳細フィルター適用
  const handleApplyAdvancedFilters = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    setActiveQuickFilter(null); // クイックフィルターをクリア
    setCurrentPage(1); // ページを1に戻す
  };

  // Day 18: 詳細フィルタークリア
  const handleClearAdvancedFilters = () => {
    setAdvancedFilters(createEmptyFilters());
    setActiveQuickFilter(null);
    setCurrentPage(1);
  };

  // Day 18: クイックフィルター適用
  const handleQuickFilter = (filterType: QuickFilterType) => {
    if (activeQuickFilter === filterType) {
      // 同じフィルターをクリックした場合は解除
      setActiveQuickFilter(null);
    } else {
      setActiveQuickFilter(filterType);
      setAdvancedFilters(createEmptyFilters()); // 詳細フィルターをクリア
    }
    setCurrentPage(1);
  };

  // Day 18: プリセット保存
  const handleSavePreset = (name: string) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters: advancedFilters,
      createdAt: new Date().toISOString(),
    };
    setFilterPresets([...filterPresets, newPreset]);
  };

  // Day 18: プリセット読み込み
  const handleLoadPreset = (preset: FilterPreset) => {
    setAdvancedFilters(preset.filters);
    setActiveQuickFilter(null);
    setCurrentPage(1);
  };

  // Day 18: プリセット削除
  const handleDeletePreset = (id: string) => {
    setFilterPresets(filterPresets.filter(p => p.id !== id));
  };

  // Day 18: フィルター適用ロジック
  let filteredDeliveries = deliveries;

  // まず検索とステータスフィルターを適用
  filteredDeliveries = filteredDeliveries.filter(delivery => {
    const matchesSearch = delivery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        delivery.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // クイックフィルターを適用
  if (activeQuickFilter) {
    filteredDeliveries = applyQuickFilter(filteredDeliveries, activeQuickFilter);
  }

  // 詳細フィルターを適用
  if (hasActiveFilters(advancedFilters)) {
    filteredDeliveries = applyAdvancedFilters(filteredDeliveries, advancedFilters);
  }

  // ソート
  filteredDeliveries = filteredDeliveries.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name, 'ja');
    } else {
      comparison = new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDeliveries = filteredDeliveries.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && editingDelivery) {
      setDeliveries(deliveries.map(d =>
        d.id === editingDelivery.id ? { ...editingDelivery, ...formData } : d
      ));
    } else {
      const newDelivery: Delivery = {
        id: Date.now().toString(),
        ...formData,
      };
      setDeliveries([...deliveries, newDelivery]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      status: 'pending',
      deliveryDate: '',
    });
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingDelivery(null);
  };

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setFormData(delivery);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('本当に削除しますか？')) {
      setDeliveries(deliveries.filter(d => d.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedDeliveries.map(d => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`選択した${selectedIds.size}件を削除しますか？`)) {
      setDeliveries(deliveries.filter(d => !selectedIds.has(d.id)));
      setSelectedIds(new Set<string>());
    }
  };

  const handleBulkStatusChange = (newStatus: Delivery['status']) => {
    if (selectedIds.size === 0) return;
    setDeliveries(deliveries.map(d =>
      selectedIds.has(d.id) ? { ...d, status: newStatus } : d
    ));
    setSelectedIds(new Set<string>());
  };

  const handlePrint = (delivery: Delivery) => {
    setPrintDeliveries([delivery]);
    setIsPrintPreview(true);
  };

  const handleBulkPrint = () => {
    if (selectedIds.size === 0) return;
    const selected = deliveries.filter(d => selectedIds.has(d.id));
    setPrintDeliveries(selected);
    setIsPrintPreview(true);
  };

  const handlePrintCancel = () => {
    setIsPrintPreview(false);
    setPrintDeliveries([]);
  };

  const getStatusBadgeClass = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getStatusLabel = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return '配送前';
      case 'in_transit': return '配送中';
      case 'completed': return '配送完了';
    }
  };

  // Day 18: クイックフィルターのラベルを取得
  const getQuickFilterLabel = (filterType: QuickFilterType): string => {
    switch (filterType) {
      case 'today': return '今日配送';
      case 'tomorrow': return '明日配送';
      case 'this_week': return '今週配送';
      case 'overdue': return '配送遅延';
      case 'in_transit_only': return '配送中のみ';
      case 'completed_today': return '本日完了';
    }
  };

  // Day 18: マウント前は何も表示しない（Hydration Error回避）
  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {isPrintPreview && (
        <PrintableDeliverySlip
          deliveries={printDeliveries}
          onClose={handlePrintCancel}
        />
      )}

      <div className="no-print">
        <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">配送管理システム</h1>
              </div>
              <div className="flex items-center gap-2">
                {/* Day 14: 通知設定ボタン */}
                <button
                  onClick={() => setShowNotificationSettings(true)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="通知設定"
                >
                  <Bell className="w-5 h-5" />
                </button>
                {/* Day 15: 分析ボタン */}
                <button
                  onClick={() => setIsAnalyticsModalOpen(true)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="配送実績分析"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardStats deliveries={deliveries} />

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
            {/* Day 18: クイックフィルターバー */}
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  クイックフィルター
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['today', 'tomorrow', 'this_week', 'overdue', 'in_transit_only', 'completed_today'] as QuickFilterType[]).map((filterType) => (
                  <button
                    key={filterType}
                    type="button"
                    onClick={() => handleQuickFilter(filterType)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      activeQuickFilter === filterType
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getQuickFilterLabel(filterType)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="名前または住所で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Delivery['status'] | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="all">すべて</option>
                <option value="pending">配送前</option>
                <option value="in_transit">配送中</option>
                <option value="completed">配送完了</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'deliveryDate')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="deliveryDate">配送日順</option>
                <option value="name">名前順</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {sortOrder === 'asc' ? '昇順 ↑' : '降順 ↓'}
              </button>
            </div>

            {/* Day 18: 詳細フィルター操作ボタン */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setShowAdvancedFilter(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Filter className="w-5 h-5" />
                詳細フィルター
                {hasActiveFilters(advancedFilters) && (
                  <span className="ml-1 px-2 py-0.5 bg-purple-800 rounded-full text-xs">ON</span>
                )}
              </button>
              <button
                onClick={() => setShowFilterPresets(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Star className="w-5 h-5" />
                プリセット
                {filterPresets.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-indigo-800 rounded-full text-xs">{filterPresets.length}</span>
                )}
              </button>
              {(hasActiveFilters(advancedFilters) || activeQuickFilter) && (
                <button
                  onClick={handleClearAdvancedFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  フィルタークリア
                </button>
              )}
            </div>

            {/* Day 18: 適用中のフィルター表示 */}
            {(hasActiveFilters(advancedFilters) || activeQuickFilter) && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      適用中のフィルター:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeQuickFilter && (
                        <span 
                          key="quick-filter"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs"
                        >
                          <Zap className="w-3 h-3" />
                          {getQuickFilterLabel(activeQuickFilter)}
                        </span>
                      )}
                      {formatFilterDescription(advancedFilters).map((desc, idx) => (
                        <span
                          key={`filter-desc-${idx}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                        >
                          {desc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsEditMode(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                新規追加
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                CSV出力
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload className="w-5 h-5" />
                CSVインポート
              </button>
              <button
                onClick={() => setShowBackupRestoreModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                バックアップ/リストア
              </button>
              {selectedIds.size > 0 && (
                <>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    選択削除 ({selectedIds.size})
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('pending')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    配送前に変更
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('in_transit')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    配送中に変更
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    配送完了に変更
                  </button>
                  <button
                    onClick={handleBulkPrint}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                    一括印刷 ({selectedIds.size})
                  </button>
                </>
              )}
            </div>

            {/* Day 18: 検索結果件数表示 */}
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              {filteredDeliveries.length !== deliveries.length ? (
                <span>
                  全{deliveries.length}件中 <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredDeliveries.length}件</span> を表示
                </span>
              ) : (
                <span>全 {deliveries.length}件</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 transition-colors">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={paginatedDeliveries.length > 0 && paginatedDeliveries.every(d => selectedIds.has(d.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      住所
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      配送日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                  {paginatedDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(delivery.id)}
                          onChange={(e) => handleSelectOne(delivery.id, e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {delivery.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {delivery.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(delivery.status)}`}>
                          {getStatusLabel(delivery.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {delivery.deliveryDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(delivery)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(delivery.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          削除
                        </button>
                        <button
                          onClick={() => handlePrint(delivery)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          印刷
                        </button>
                        {delivery.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChangeWithNotification(delivery, 'in_transit')}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            配送開始
                          </button>
                        )}
                        {delivery.status === 'in_transit' && (
                          <button
                            onClick={() => handleStatusChangeWithNotification(delivery, 'completed')}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            配送完了
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  前へ
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  次へ
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-colors">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {isEditMode ? '配送情報を編集' : '新規配送を追加'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    名前
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    住所
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ステータス
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Delivery['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  >
                    <option value="pending">配送前</option>
                    <option value="in_transit">配送中</option>
                    <option value="completed">配送完了</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    配送日
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    {isEditMode ? '更新' : '追加'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-medium transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* モーダルコンポーネント群 */}
      {showExportModal && (
        <CsvExportModal
          isOpen={showExportModal}
          deliveries={deliveries}
          filteredDeliveries={filteredDeliveries}
          selectedIds={selectedIds}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showImportModal && (
        <CsvImportModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={(newDeliveries: Delivery[], mode: 'add' | 'overwrite') => {
            if (mode === 'overwrite') {
              setDeliveries(newDeliveries);
            } else {
              setDeliveries([...deliveries, ...newDeliveries]);
            }
            setShowImportModal(false);
          }}
        />
      )}

      {showBackupRestoreModal && (
        <BackupRestoreModal
          isOpen={showBackupRestoreModal}
          onClose={() => setShowBackupRestoreModal(false)}
          deliveries={deliveries}
          onRestore={(restoredDeliveries: Delivery[]) => {
            setDeliveries(restoredDeliveries);
            setShowBackupRestoreModal(false);
          }}
        />
      )}

      {showNotificationSettings && (
        <NotificationSettingsModal
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
          settings={notificationSettings}
          onSettingsChange={handleNotificationSettingsChange}
          notificationPermission={notificationPermission}
          onRequestPermission={handleRequestPermission}
          onTestNotification={handleTestNotification}
        />
      )}

      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        deliveries={filteredDeliveries}
      />

      {/* Day 18: 詳細フィルターモーダル */}
      <AdvancedFilterModal
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        filters={advancedFilters}
        onApply={handleApplyAdvancedFilters}
      />

      {/* Day 18: フィルタープリセットモーダル */}
      <FilterPresetsModal
        isOpen={showFilterPresets}
        onClose={() => setShowFilterPresets(false)}
        presets={filterPresets}
        currentFilters={advancedFilters}
        onSavePreset={handleSavePreset}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
      />
    </div>
  );
}