'use client';

import { useMemo, useState, useEffect } from 'react';
import { Package, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Delivery } from '../types/delivery';

interface DashboardStatsProps {
  deliveries: Delivery[];
}

export default function DashboardStats({ deliveries }: DashboardStatsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = useMemo(() => {
    const total = deliveries.length;
    const inTransit = deliveries.filter(d => d.status === 'in_transit').length;
    const completed = deliveries.filter(d => d.status === 'completed').length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayDeliveries = deliveries.filter(d => d.deliveryDate === today).length;

    return { total, inTransit, completed, todayDeliveries };
  }, [deliveries]);

  // マウント前はスケルトン表示
  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="h-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 総配送数 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">総配送数</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* 配送中 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">配送中</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.inTransit}</p>
          </div>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      {/* 完了 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">完了</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.completed}</p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* 本日の配送 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">本日の配送</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.todayDeliveries}</p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
}