// app/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronUp, ChevronDown, Download, Upload } from 'lucide-react';
import { Delivery } from './types/delivery';
import CsvExportModal from './components/CsvExportModal';
import CsvImportModal from './components/CsvImportModal';
import DashboardStats from './components/DashboardStats';
import ThemeToggle from './components/ThemeToggle';

const ITEMS_PER_PAGE = 10;
const STORAGE_KEY = 'delivery_app_data';
const FILTER_STORAGE_KEY = 'delivery_app_filters';

export default function Home() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', status: 'pending' as Delivery['status'], deliveryDate: '' });
  
  // 検索・フィルター
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Delivery['status'] | 'all'>('all');
  const [sortField, setSortField] = useState<keyof Delivery>('deliveryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  
  // 一括操作
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // CSV出力モーダル
  const [isCsvExportModalOpen, setIsCsvExportModalOpen] = useState(false);
  
  // CSVインポートモーダル
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);

  // LocalStorageからデータを読み込み
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDeliveries(JSON.parse(saved));
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    }
    
    const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSearchTerm(filters.searchTerm || '');
        setStatusFilter(filters.statusFilter || 'all');
        setSortField(filters.sortField || 'deliveryDate');
        setSortOrder(filters.sortOrder || 'asc');
      } catch (error) {
        console.error('フィルター設定の読み込みに失敗しました:', error);
      }
    }
  }, []);

  // データが変更されたらLocalStorageに保存
  useEffect(() => {
    if (deliveries.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
    }
  }, [deliveries]);

  // フィルター設定を保存
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify({
      searchTerm,
      statusFilter,
      sortField,
      sortOrder
    }));
  }, [searchTerm, statusFilter, sortField, sortOrder]);

  // フィルター・ソート・検索処理
  const filteredAndSortedDeliveries = useMemo(() => {
    let result = [...deliveries];

    // 検索フィルター
    if (searchTerm) {
      result = result.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    // ソート
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [deliveries, searchTerm, statusFilter, sortField, sortOrder]);

  // ページネーション計算
  const totalPages = Math.ceil(filteredAndSortedDeliveries.length / ITEMS_PER_PAGE);
  const paginatedDeliveries = filteredAndSortedDeliveries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ページ変更時に先頭にスクロール
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // 全選択の状態を更新
  useEffect(() => {
    const currentPageIds = paginatedDeliveries.map(d => d.id);
    setIsAllSelected(
      currentPageIds.length > 0 && 
      currentPageIds.every(id => selectedIds.has(id))
    );
  }, [paginatedDeliveries, selectedIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.deliveryDate) {
      alert('全ての項目を入力してください');
      return;
    }

    if (editingDelivery) {
      setDeliveries(deliveries.map(d => 
        d.id === editingDelivery.id 
          ? { ...editingDelivery, ...formData }
          : d
      ));
    } else {
      const newDelivery: Delivery = {
        id: Date.now().toString(),
        ...formData
      };
      setDeliveries([...deliveries, newDelivery]);
    }

    setIsModalOpen(false);
    setEditingDelivery(null);
    setFormData({ name: '', address: '', status: 'pending', deliveryDate: '' });
  };

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      name: delivery.name,
      address: delivery.address,
      status: delivery.status,
      deliveryDate: delivery.deliveryDate
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('本当に削除しますか？')) {
      setDeliveries(deliveries.filter(d => d.id !== id));
      selectedIds.delete(id);
      setSelectedIds(new Set(selectedIds));
    }
  };

  const handleSort = (field: keyof Delivery) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      const currentPageIds = paginatedDeliveries.map(d => d.id);
      const newSelected = new Set(selectedIds);
      currentPageIds.forEach(id => newSelected.delete(id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      paginatedDeliveries.forEach(d => newSelected.add(d.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      alert('削除する項目を選択してください');
      return;
    }
    if (confirm(`選択した${selectedIds.size}件を削除しますか？`)) {
      setDeliveries(deliveries.filter(d => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
    }
  };

  const handleBulkStatusChange = (newStatus: Delivery['status']) => {
    if (selectedIds.size === 0) {
      alert('変更する項目を選択してください');
      return;
    }
    setDeliveries(deliveries.map(d => 
      selectedIds.has(d.id) ? { ...d, status: newStatus } : d
    ));
    setSelectedIds(new Set());
  };

  const getStatusLabel = (status: Delivery['status']) => {
    const labels = {
      pending: '配送待ち',
      in_transit: '配送中',
      completed: '完了'
    };
    return labels[status];
  };

  const getStatusColor = (status: Delivery['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status];
  };

  const SortIcon = ({ field }: { field: keyof Delivery }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const handleCsvImportComplete = (importedDeliveries: Delivery[], mode: 'add' | 'overwrite') => {
    if (mode === 'overwrite') {
      setDeliveries(importedDeliveries);
    } else {
      setDeliveries([...deliveries, ...importedDeliveries]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">配送管理システム</h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計ダッシュボード */}
        <DashboardStats deliveries={deliveries} />

        {/* 検索・フィルター・アクションバー */}
        <div className="mb-6 space-y-4">
          {/* 検索バー */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="名前または住所で検索..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as Delivery['status'] | 'all');
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            >
              <option value="all">全てのステータス</option>
              <option value="pending">配送待ち</option>
              <option value="in_transit">配送中</option>
              <option value="completed">完了</option>
            </select>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              新規配送登録
            </button>

            <button
              onClick={() => setIsCsvImportModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              CSVインポート
            </button>

            <button
              onClick={() => setIsCsvExportModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              CSV出力
            </button>

            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  一括削除 ({selectedIds.size})
                </button>

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusChange(e.target.value as Delivery['status']);
                      e.target.value = '';
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  defaultValue=""
                >
                  <option value="">一括ステータス変更...</option>
                  <option value="pending">配送待ちに変更</option>
                  <option value="in_transit">配送中に変更</option>
                  <option value="completed">完了に変更</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* 配送リストテーブル */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      配送先名
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('address')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      住所
                      <SortIcon field="address" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      ステータス
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('deliveryDate')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      配送予定日
                      <SortIcon field="deliveryDate" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      データがありません
                    </td>
                  </tr>
                ) : (
                  paginatedDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(delivery.id)}
                          onChange={() => handleSelectOne(delivery.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {delivery.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {delivery.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                          {getStatusLabel(delivery.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {delivery.deliveryDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(delivery)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(delivery.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  全 <span className="font-medium">{filteredAndSortedDeliveries.length}</span> 件中{' '}
                  <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> 〜{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedDeliveries.length)}
                  </span>{' '}
                  件を表示
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    前へ
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    次へ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 新規登録・編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingDelivery ? '配送情報編集' : '新規配送登録'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  配送先名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  住所 *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ステータス *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Delivery['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="pending">配送待ち</option>
                  <option value="in_transit">配送中</option>
                  <option value="completed">完了</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  配送予定日 *
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                >
                  {editingDelivery ? '更新' : '登録'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingDelivery(null);
                    setFormData({ name: '', address: '', status: 'pending', deliveryDate: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white py-2 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV出力モーダル */}
      {isCsvExportModalOpen && (
        <CsvExportModal
          deliveries={deliveries}
          filteredDeliveries={filteredAndSortedDeliveries}
          selectedIds={selectedIds}
          onClose={() => setIsCsvExportModalOpen(false)}
        />
      )}

      {/* CSVインポートモーダル */}
      {isCsvImportModalOpen && (
        <CsvImportModal
          onClose={() => setIsCsvImportModalOpen(false)}
          onImportComplete={handleCsvImportComplete}
        />
      )}
    </div>
  );
}