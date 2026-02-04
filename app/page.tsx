'use client';

import { useState, useEffect} from 'react';
import { Delivery } from './types/delivery';

const STORAGE_KEY = 'delivery_app_data';
const FILTERS_STORAGE_KEY = 'delivery_app_filters';

const initialData: Delivery[] = [
  {
    id: '1',
    name: '東京都渋谷区配送センター',
    address: '東京都渋谷区道玄坂1-2-3',
    status: 'completed',
    deliveryDate: '2024-01-15',
  },
  {
    id: '2',
    name: '神奈川県横浜市物流拠点',
    address: '神奈川県横浜市西区みなとみらい4-5-6',
    status: 'in_transit',
    deliveryDate: '2024-01-20',
  },
  {
    id: '3',
    name: '大阪府大阪市配送所',
    address: '大阪府大阪市北区梅田7-8-9',
    status: 'pending',
    deliveryDate: '2024-01-25',
  },
];

export default function Home() {
  // 既存のState
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'pending' as Delivery['status'],
    deliveryDate: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 検索・フィルター用のState
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | Delivery['status']>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ページネーション用のStatefv
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // 一括操作用のState
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // LocalStorageからデータを読み込み（初回のみ）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setDeliveries(JSON.parse(saved));
        } catch {
          setDeliveries(initialData);
        }
      } else {
        setDeliveries(initialData);
      }

      const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters);
          setSearchText(filters.searchText || '');
          setStatusFilter(filters.statusFilter || '');
          setStartDate(filters.startDate || '');
          setEndDate(filters.endDate || '');
          setSortBy(filters.sortBy || 'date');
          setSortOrder(filters.sortOrder || 'asc');
        } catch {
          // エラー時は何もしない
        }
      }
    }
  }, []);

  // deliveriesが変更されたらLocalStorageに保存
  useEffect(() => {
    if (deliveries.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
    }
  }, [deliveries]);

  // 検索条件が変更されたらLocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const filters = {
        searchText,
        statusFilter,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      };
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    }
  }, [searchText, statusFilter, startDate, endDate, sortBy, sortOrder]);

  // フィルター変更時にページを1に戻す
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchText, statusFilter, startDate, endDate]);

  // フィルター処理（C#のLINQに相当）
  const getFilteredDeliveries = () => {
    let filtered = [...deliveries];

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    if (startDate) {
      filtered = filtered.filter((d) => d.deliveryDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((d) => d.deliveryDate <= endDate);
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a.deliveryDate.localeCompare(b.deliveryDate);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredDeliveries = getFilteredDeliveries();

 // 総ページ数の計算
const totalPages = Math.ceil(filteredDeliveries.length / pageSize);

// ページネーション処理
const startIndex = (currentPage - 1) * pageSize;
const endIndex = startIndex + pageSize;
const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

// 現在のページの全アイテムが選択されているか
const isAllSelected = paginatedDeliveries.length > 0 &&
  paginatedDeliveries.every((d) => selectedIds.includes(d.id));

  // フィルタークリア機能
  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // 検索結果のハイライト表示
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // 全選択/全解除
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paginatedDeliveries.map((d) => d.id);
      setSelectedIds(currentPageIds);
    } else {
      setSelectedIds([]);
    }
  };

  // 個別選択
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // 一括削除
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert('削除する項目を選択してください');
      return;
    }

    if (window.confirm(`選択した${selectedIds.length}件を削除しますか？`)) {
      setDeliveries((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    }
  };

  // 一括ステータス変更
  const handleBulkStatusChange = (newStatus: Delivery['status']) => {
    if (selectedIds.length === 0) {
      alert('ステータスを変更する項目を選択してください');
      return;
    }

    setDeliveries((prev) =>
      prev.map((d) =>
        selectedIds.includes(d.id) ? { ...d, status: newStatus } : d
      )
    );
    setSelectedIds([]);
  };

  // バリデーション
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '配送先名を入力してください';
    }
    if (!formData.address.trim()) {
      newErrors.address = '住所を入力してください';
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = '配送日を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信（追加・編集）
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (isEditing && editingId) {
      setDeliveries((prev) =>
        prev.map((delivery) =>
          delivery.id === editingId
            ? { ...formData, id: editingId }
            : delivery
        )
      );
      setIsEditing(false);
      setEditingId(null);
    } else {
      const newDelivery: Delivery = {
        ...formData,
        id: Date.now().toString(),
      };
      setDeliveries((prev) => [...prev, newDelivery]);
    }

    setFormData({
      name: '',
      address: '',
      status: 'pending',
      deliveryDate: '',
    });
    setErrors({});
  };

  // 編集ボタンクリック
  const handleEditClick = (delivery: Delivery) => {
    setFormData({
      name: delivery.name,
      address: delivery.address,
      status: delivery.status,
      deliveryDate: delivery.deliveryDate,
    });
    setIsEditing(true);
    setEditingId(delivery.id);
    setErrors({});
  };

  // 削除確認
  const handleDeleteConfirm = (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
    }
  };

  // データリセット
  const handleResetData = () => {
    if (window.confirm('データを初期状態にリセットしますか？')) {
      setDeliveries(initialData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      setSelectedIds([]);
    }
  };

  // ステータス表示
  const getStatusLabel = (status: Delivery['status']) => {
    const labels = {
      pending: '配送待ち',
      in_transit: '配送中',
      completed: '配送完了',
    };
    return labels[status];
  };

  const getStatusColor = (status: Delivery['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">配送管理システム</h1>
          <p className="mt-2 text-sm text-gray-600">
            配送先の登録・編集・削除ができます
          </p>
        </div>

        {/* 検索・フィルターエリア */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">検索・フィルター</h2>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              フィルタークリア
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 配送先名検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配送先名検索
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="配送先名を入力..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ステータスフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as '' | Delivery['status'])
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                <option value="pending">配送待ち</option>
                <option value="in_transit">配送中</option>
                <option value="completed">配送完了</option>
              </select>
            </div>

            {/* 開始日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配送日（開始）
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 終了日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配送日（終了）
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ソート項目 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ソート項目
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">配送先名</option>
                <option value="date">配送日</option>
              </select>
            </div>

            {/* ソート順序 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ソート順序
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">昇順（A→Z / 古→新）</option>
                <option value="desc">降順（Z→A / 新→古）</option>
              </select>
            </div>
          </div>

          {/* 検索結果数の表示 */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredDeliveries.length} 件の配送先が見つかりました（全{' '}
            {deliveries.length} 件中）
          </div>
        </div>

        {/* フォームエリア */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isEditing ? '配送先を編集' : '新しい配送先を追加'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配送先名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 東京都渋谷区配送センター"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所 *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 東京都渋谷区道玄坂1-2-3"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Delivery['status'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">配送待ち</option>
                  <option value="in_transit">配送中</option>
                  <option value="completed">配送完了</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配送日 *
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDate: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.deliveryDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.deliveryDate}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                {isEditing ? '更新' : '追加'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      address: '',
                      status: 'pending',
                      deliveryDate: '',
                    });
                    setErrors({});
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 一括操作エリア */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedIds.length} 件選択中
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusChange('pending')}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  配送待ちに変更
                </button>
                <button
                  onClick={() => handleBulkStatusChange('in_transit')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  配送中に変更
                </button>
                <button
                  onClick={() => handleBulkStatusChange('completed')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  配送完了に変更
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  一括削除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 配送先一覧（テーブル） */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">配送先一覧</h2>
            <button
              onClick={handleResetData}
              className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              データをリセット
            </button>
          </div>

          {/* デスクトップ表示（テーブル） */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    配送先名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    配送日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(delivery.id)}
                        onChange={(e) =>
                          handleSelectItem(delivery.id, e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {highlightText(delivery.name, searchText)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          delivery.status
                        )}`}
                      >
                        {getStatusLabel(delivery.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.deliveryDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(delivery)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(delivery.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* モバイル表示（カード） */}
          <div className="md:hidden divide-y divide-gray-200">
            {paginatedDeliveries.map((delivery) => (
              <div key={delivery.id} className="p-4">
                <div className="flex items-start justify-between">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(delivery.id)}
                    onChange={(e) =>
                      handleSelectItem(delivery.id, e.target.checked)
                    }
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {highlightText(delivery.name, searchText)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {delivery.address}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          delivery.status
                        )}`}
                      >
                        {getStatusLabel(delivery.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {delivery.deliveryDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleEditClick(delivery)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(delivery.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDeliveries.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              条件に一致する配送先が見つかりませんでした
            </div>
          )}

          {/* ページネーション */}
          {filteredDeliveries.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  ページ {currentPage} / {totalPages}（全{filteredDeliveries.length}件）
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                    }}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    前へ
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    次へ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}