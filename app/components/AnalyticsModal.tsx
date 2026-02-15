// app/components/AnalyticsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, TrendingUp, MapPin, Clock } from 'lucide-react';
import { Delivery } from '../types/delivery';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  getDateRange,
  generateTrendData,
  generateAreaData,
  generateTimeSlotData,
  generateStatsSummary
} from '../utils/analytics';
import DateRangePicker from './DateRangePicker';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveries: Delivery[];
}

// ★Day 17: PeriodTypeにcustomを追加★
type PeriodType = 'week' | 'month' | 'last30days' | 'custom';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface PeriodSelection {
  type: PeriodType;
  dateRange?: DateRange;
}

const COLORS = {
  pending: '#f59e0b',
  in_transit: '#3b82f6',
  completed: '#10b981'
};

export default function AnalyticsModal({ isOpen, onClose, deliveries }: AnalyticsModalProps) {
  // ★Day 17: 期間選択の状態管理（LocalStorageから復元）★
  const [periodSelection, setPeriodSelection] = useState<PeriodSelection>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('analytics_period_selection');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return { type: 'week' };
        }
      }
    }
    return { type: 'week' };
  });

  // 期間選択が変更されたらLocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_period_selection', JSON.stringify(periodSelection));
    }
  }, [periodSelection]);

  if (!isOpen) return null;

  // ★Day 17: カスタム期間対応のフィルタリング★
  const getFilteredDeliveries = (): Delivery[] => {
    if (periodSelection.type === 'custom' && periodSelection.dateRange) {
      const { startDate, endDate } = periodSelection.dateRange;
      return deliveries.filter(d => 
        d.deliveryDate >= startDate && d.deliveryDate <= endDate
      );
    }

    // 既存のプリセット期間処理
    const dateRange = getDateRange(periodSelection.type as 'week' | 'month' | 'last30days');
    return deliveries.filter(d => {
      const deliveryDate = new Date(d.deliveryDate);
      return deliveryDate >= dateRange.start && deliveryDate <= dateRange.end;
    });
  };

  const filteredDeliveries = getFilteredDeliveries();

  const trendData = generateTrendData(filteredDeliveries, periodSelection.type);
  const areaData = generateAreaData(filteredDeliveries);
  const timeSlotData = generateTimeSlotData(filteredDeliveries);
  const stats = generateStatsSummary(filteredDeliveries);

  // ★Day 17: 期間タイプ変更ハンドラー★
  const handlePeriodTypeChange = (type: PeriodType) => {
    if (type === 'custom') {
      // カスタム期間の場合、デフォルトで過去30日間を設定
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      setPeriodSelection({
        type: 'custom',
        dateRange: { startDate: startDateStr, endDate }
      });
    } else {
      setPeriodSelection({ type });
    }
  };

  // ★Day 17: カスタム期間変更ハンドラー★
  const handleDateRangeChange = (dateRange: DateRange) => {
    setPeriodSelection({
      type: 'custom',
      dateRange
    });
  };

  // 利用可能な最小日付を計算（最も古い配送日）
  const getMinDate = (): string => {
    if (deliveries.length === 0) return '';
    const dates = deliveries.map(d => d.deliveryDate).sort();
    return dates[0];
  };

  // カスタムラベル関数（型エラー修正版）
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            配送実績分析
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* ★Day 17: 期間選択UI★ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">期間選択:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePeriodTypeChange('week')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    periodSelection.type === 'week'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  今週
                </button>
                <button
                  onClick={() => handlePeriodTypeChange('month')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    periodSelection.type === 'month'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  今月
                </button>
                <button
                  onClick={() => handlePeriodTypeChange('last30days')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    periodSelection.type === 'last30days'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  過去30日
                </button>
                <button
                  onClick={() => handlePeriodTypeChange('custom')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    periodSelection.type === 'custom'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  カスタム期間
                </button>
              </div>
            </div>

            {/* カスタム期間選択UI */}
            {periodSelection.type === 'custom' && periodSelection.dateRange && (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <DateRangePicker
                  dateRange={periodSelection.dateRange}
                  onChange={handleDateRangeChange}
                  minDate={getMinDate()}
                />
              </div>
            )}
          </div>

          {/* 統計サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">総配送件数</div>
              <div className="text-2xl font-bold mt-1">{stats.totalDeliveries}件</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">完了率</div>
              <div className="text-2xl font-bold mt-1">{stats.completionRate}%</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">平均完了日数</div>
              <div className="text-2xl font-bold mt-1">{stats.avgCompletionDays}日</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">配送中</div>
              <div className="text-2xl font-bold mt-1">{stats.inTransitCount}件</div>
            </div>
          </div>

          {/* 配送実績の推移 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              配送実績の推移
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(31, 41, 55)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                />
                <Legend />
                <Bar dataKey="配送前" stackId="a" fill={COLORS.pending} />
                <Bar dataKey="配送中" stackId="a" fill={COLORS.in_transit} />
                <Bar dataKey="完了" stackId="a" fill={COLORS.completed} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* エリア別 & 時間帯別 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* エリア別配送状況 */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                エリア別配送状況
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={areaData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis
                    dataKey="prefecture"
                    type="category"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(31, 41, 55)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 時間帯別配送状況 */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                時間帯別配送状況
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timeSlotData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeSlotData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(31, 41, 55)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}