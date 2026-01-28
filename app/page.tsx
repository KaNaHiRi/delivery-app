'use client';

import { useState } from 'react';
import { Delivery } from './types/delivery';

export default function Home() {
  // ダミーデータ（3件の配送先）
  const [deliveries] = useState<Delivery[]>([
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

  // ステータスの日本語表示
  const getStatusLabel = (status: Delivery['status']) => {
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
  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          配送管理システム
        </h1>
        <p className="text-gray-600 mb-8">
          配送先一覧を表示しています
        </p>

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

          <div className="overflow-x-auto">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 進捗表示 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">今日の進捗</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              開発環境構築完了
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              最初のNext.jsアプリ作成
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              TypeScript型定義作成
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              配送先一覧表示機能完成
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}