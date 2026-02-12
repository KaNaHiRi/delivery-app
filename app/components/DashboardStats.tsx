// app/components/DashboardStats.tsx
'use client';

import { useMemo } from 'react';
import { Delivery } from '../types/delivery';
import { Package, Truck, CheckCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStatsProps {
  deliveries: Delivery[];
}

export default function DashboardStats({ deliveries }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const total = deliveries.length;
    const pending = deliveries.filter(d => d.status === 'pending').length;
    const inTransit = deliveries.filter(d => d.status === 'in_transit').length;
    const completed = deliveries.filter(d => d.status === 'completed').length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayDeliveries = deliveries.filter(d => d.deliveryDate === today).length;

    return { total, pending, inTransit, completed, todayDeliveries };
  }, [deliveries]);

  const barChartData = [
    { name: '配送待ち', count: stats.pending },
    { name: '配送中', count: stats.inTransit },
    { name: '完了', count: stats.completed },
  ];

  const pieChartData = [
    { name: '配送待ち', value: stats.pending },
    { name: '配送中', value: stats.inTransit },
    { name: '完了', value: stats.completed },
  ];

  const COLORS = {
    light: ['#fbbf24', '#3b82f6', '#10b981'],
    dark: ['#f59e0b', '#2563eb', '#059669']
  };

  return (
    <div className="mb-8 space-y-6">
      {/* 集計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">総配送数</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Package className="w-12 h-12 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">配送中</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inTransit}</p>
            </div>
            <Truck className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">完了</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">本日の配送</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayDeliveries}</p>
            </div>
            <Calendar className="w-12 h-12 text-purple-500 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 棒グラフ */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">ステータス別配送数</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'currentColor' }}
                className="text-gray-700 dark:text-gray-300"
              />
              <YAxis 
                tick={{ fill: 'currentColor' }}
                className="text-gray-700 dark:text-gray-300"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31 41 55)',
                  border: '1px solid rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
              />
              <Legend 
                wrapperStyle={{ color: 'currentColor' }}
                className="text-gray-700 dark:text-gray-300"
              />
              <Bar dataKey="count" fill="#3b82f6" name="配送数" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 円グラフ */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">ステータス構成比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => {
                  const { name, percent } = entry;
                  const percentage = percent ? (percent * 100).toFixed(0) : '0';
                  return `${name} ${percentage}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS.dark[index % COLORS.dark.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31 41 55)',
                  border: '1px solid rgb(55 65 81)',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}