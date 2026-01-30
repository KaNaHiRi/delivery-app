'use client';

import { useState } from 'react';
import { Delivery, DeliveryStatus } from './types/delivery';

export default function Home() {
  // ダミーデータ（3件の配送先）
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: '1',
      name: '山田商店',
      address: '東京都渋谷区神南1-2-3',
      status: 'pending',
      deliveryDate: '2026-02-01'
    },
    {
      id: '2',
      name: '鈴木物流センター',
      address: '大阪府大阪市北区梅田2-3-4',
      status: 'in_transit',
      deliveryDate: '2026-01-30'
    },
    {
      id: '3',
      name: '佐藤工業株式会社',
      address: '愛知県名古屋市中区栄3-4-5',
      status: 'completed',
      deliveryDate: '2026-01-28'
    }
  ]);

  // フォームの状態管理
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    deliveryDate: '',
    status: 'pending' as DeliveryStatus
  });

  // エラー状態管理
  const [errors, setErrors] = useState({
    name: '',
    address: '',
    deliveryDate: ''
  });

  // 削除用のstate
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // 編集用のstate
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 入力値の変更ハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  
    // デバッグ用：入力値をコンソールに表示
    console.log('フィールド名:', name);
    console.log('入力値:', value);
    console.log('全体のフォームデータ:', { ...formData, [name]: value });
  };

  // バリデーション関数
  const validate = () => {
    const newErrors = {
      name: formData.name.trim() === '' ? '配送先名を入力してください' : '',
      address: formData.address.trim() === '' ? '住所を入力してください' : '',
      deliveryDate: formData.deliveryDate === '' ? '配送予定日を選択してください' : ''
    };
    
    setErrors(newErrors);
    
    // エラーがない場合はtrue
    return !Object.values(newErrors).some(error => error !== '');
  };

  // フォーム送信ハンドラー（追加と編集の両方に対応）
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーションチェック
    if (!validate()) {
      console.log('入力エラーがあります');
      return;
    }

    if (isEditing && editingId) {
      // 編集モード：既存データを更新
      setDeliveries(prev =>
        prev.map(delivery =>
          delivery.id === editingId
            ? {
                ...delivery,
                name: formData.name,
                address: formData.address,
                status: formData.status,
                deliveryDate: formData.deliveryDate
              }
            : delivery
        )
      );
      console.log('配送先を更新しました:', editingId);
      
      // 編集モードを解除
      setIsEditing(false);
      setEditingId(null);
    } else {
      // 新規追加モード
      const newDelivery: Delivery = {
        id: Date.now().toString(),
        name: formData.name,
        address: formData.address,
        status: formData.status,
        deliveryDate: formData.deliveryDate
      };

      setDeliveries(prev => [newDelivery, ...prev]);
      console.log('配送先を追加しました:', newDelivery);
    }

    // フォームをリセット
    setFormData({
      name: '',
      address: '',
      deliveryDate: '',
      status: 'pending'
    });

    setErrors({
      name: '',
      address: '',
      deliveryDate: ''
    });
  };

  // 削除確認ダイアログを表示
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  // 削除実行
  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      setDeliveries(prev => prev.filter(d => d.id !== deleteTargetId));
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      console.log('配送先を削除しました:', deleteTargetId);
    }
  };

  // 削除キャンセル
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  // 編集モードに切り替え
  const handleEditClick = (id: string) => {
    const delivery = deliveries.find(d => d.id === id);
    if (delivery) {
      setFormData({
        name: delivery.name,
        address: delivery.address,
        deliveryDate: delivery.deliveryDate,
        status: delivery.status
      });
      setEditingId(id);
      setIsEditing(true);
      // エラーをクリア
      setErrors({
        name: '',
        address: '',
        deliveryDate: ''
      });
      // スクロールしてフォームを表示
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 編集をキャンセル
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      address: '',
      deliveryDate: '',
      status: 'pending'
    });
    setErrors({
      name: '',
      address: '',
      deliveryDate: ''
    });
  };

  // ステータスの日本語表示
  const getStatusLabel = (status: DeliveryStatus) => {
    switch (status) {
      case 'pending':
        return '未配送';
      case 'in_transit':
        return '配送中';
      case 'completed':
        return '完了';
    }
  };

  // ステータスの色
  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          配送管理システム
        </h1>
        <p className="text-gray-600 mb-8">
          配送先の追加・編集・削除ができます
        </p>

        {/* 配送先追加/編集フォーム */}
        <div className={`bg-white p-6 rounded-lg shadow mb-6 transition-all ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isEditing ? '配送先の編集' : '新規配送先追加'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 配送先名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  配送先名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例：山田商店"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* 住所 */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  住所 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例：東京都渋谷区1-2-3"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* 配送予定日 */}
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  配送予定日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.deliveryDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>
                )}
              </div>

              {/* ステータス */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">未配送</option>
                  <option value="in_transit">配送中</option>
                  <option value="completed">完了</option>
                </select>
              </div>
            </div>

            {/* 追加/更新ボタン */}
            <div className="flex justify-end gap-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                disabled={formData.name === '' || formData.address === '' || formData.deliveryDate === ''}
                className={`px-6 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  formData.name === '' || formData.address === '' || formData.deliveryDate === ''
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditing ? '更新' : '追加'}
              </button>
            </div>
          </form>

          {/* デバッグ表示（開発中のみ） */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              デバッグ情報（入力値の確認）
            </h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify({ formData, isEditing, editingId }, null, 2)}
            </pre>
          </div>
        </div>

        {/* 配送先一覧 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              配送先一覧
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              全 {deliveries.length} 件
            </p>
          </div>

          {/* テーブル（PC表示） */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
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
                    配送予定日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {delivery.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                        {getStatusLabel(delivery.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.deliveryDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditClick(delivery.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(delivery.id)}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* カード表示（スマホ表示） */}
          <div className="md:hidden divide-y divide-gray-200">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {delivery.name}
                  </h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                    {getStatusLabel(delivery.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  {delivery.address}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  配送予定日: {delivery.deliveryDate}
                </p>
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleEditClick(delivery.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteClick(delivery.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 進捗表示 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Day 4の進捗</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              配送先削除機能完成
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              削除確認ダイアログ実装
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              配送先編集機能完成
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              編集モード切替実装
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">→</span>
              次: LocalStorage実装予定
            </li>
          </ul>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              削除の確認
            </h3>
            <p className="text-gray-600 mb-6">
              この配送先を削除してもよろしいですか？
              <br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}