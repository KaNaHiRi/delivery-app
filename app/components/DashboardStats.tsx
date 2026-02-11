'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Delivery } from '../types/delivery';

interface DashboardStatsProps {
  deliveries: Delivery[];
}

// ステータス表示名マッピング
const STATUS_LABELS: Record<Delivery['status'], string> = {
  pending: '未着手',
  in_transit: '配送中',
  completed: '完了',
};

// グラフの色
const STATUS_COLORS: Record<Delivery['status'], string> = {
  pending: '#f59e0b',
  in_transit: '#3b82f6',
  completed: '#10b981',
};

export default function DashboardStats({ deliveries }: DashboardStatsProps) {
  // ── 集計処理 ──────────────────────────────────────────
  // C# LINQ: deliveries.GroupBy(d => d.status).ToDictionary(g => g.Key, g => g.Count())
  const statusCounts = deliveries.reduce<Record<string, number>>(
    (acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const total = deliveries.length;
  const pending = statusCounts['pending'] ?? 0;
  const inTransit = statusCounts['in_transit'] ?? 0;
  const completed = statusCounts['completed'] ?? 0;

  // 完了率（0除算ガード）
  // C# LINQ: deliveries.Count(d => d.status == "completed") / (double)total * 100
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // グラフ用データ
  const barData = [
    { name: '未着手', value: pending, fill: STATUS_COLORS.pending },
    { name: '配送中', value: inTransit, fill: STATUS_COLORS.in_transit },
    { name: '完了', value: completed, fill: STATUS_COLORS.completed },
  ];

  const pieData = barData.filter((d) => d.value > 0);

  // 今日の配送件数
  // C# LINQ: deliveries.Count(d => d.deliveryDate == today)
  const today = new Date().toISOString().split('T')[0];
  const todayCount = deliveries.filter((d) => d.deliveryDate === today).length;

  // ── カード定義 ──────────────────────────────────────────
  const cards = [
    {
      label: '総配送件数',
      value: total,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-200',
    },
    {
      label: '配送中',
      value: inTransit,
      icon: Truck,
      color: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-200',
    },
    {
      label: '完了',
      value: completed,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      border: 'border-green-200',
    },
    {
      label: '本日の配送',
      value: todayCount,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      border: 'border-amber-200',
    },
  ];

  return (
    <div className="mb-8 space-y-6">
      {/* ── 集計カード ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color, border }) => (
          <div
            key={label}
            className={`rounded-xl border ${border} bg-white p-4 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`rounded-lg p-2 ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
            {label === '完了' && total > 0 && (
              <p className="mt-1 text-xs text-gray-400">完了率 {completionRate}%</p>
            )}
          </div>
        ))}
      </div>

      {/* ── グラフエリア ── */}
      {total > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 棒グラフ */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-600">
              ステータス別件数
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number | undefined) => 
                    value !== undefined ? [`${value}件`, '件数'] : ['0件', '件数']
                  }
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 円グラフ */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-600">
              ステータス構成比
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={false}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number | undefined) => 
                    value !== undefined ? [`${value}件`] : ['0件']
                  } 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => {
                    const item = pieData.find(d => d.name === value);
                    const percent = item && pieData.length > 0
                      ? ((item.value / pieData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(0)
                      : '0';
                    return `${value} (${percent}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* データなし */}
      {total === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-sm text-gray-400">
          配送データがありません。データを追加するとグラフが表示されます。
        </div>
      )}
    </div>
  );
}