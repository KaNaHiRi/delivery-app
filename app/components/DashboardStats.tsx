'use client';

import { useMemo } from 'react';
import type { Delivery, WidgetConfig, DashboardLayout } from '../types/delivery';

interface Props {
  deliveries: Delivery[];
  widgets: WidgetConfig[];
  layout: DashboardLayout;
}

// ── C#: Dictionary<string, Func<IEnumerable<Delivery>, int>> に対応 ──
const WIDGET_VALUE_MAP: Record<string, (deliveries: Delivery[]) => number> = {
  stats_total: (d) => d.length,
  stats_pending: (d) => d.filter(x => x.status === 'pending').length,
  stats_in_transit: (d) => d.filter(x => x.status === 'in_transit').length,
  stats_completed: (d) => d.filter(x => x.status === 'completed').length,
  stats_today: (d) => {
    const today = new Date().toISOString().split('T')[0];
    return d.filter(x => x.deliveryDate === today).length;
  },
  stats_overdue: (d) => {
    const today = new Date().toISOString().split('T')[0];
    return d.filter(x => x.deliveryDate < today && x.status !== 'completed').length;
  },
};

const COLOR_CLASSES: Record<string, { card: string; value: string; badge: string }> = {
  blue:   { card: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',   value: 'text-blue-600 dark:text-blue-400',   badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  yellow: { card: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', value: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' },
  green:  { card: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',  value: 'text-green-600 dark:text-green-400',  badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
  orange: { card: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', value: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' },
  red:    { card: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',     value: 'text-red-600 dark:text-red-400',     badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' },
  purple: { card: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', value: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
};

const LAYOUT_CLASSES: Record<DashboardLayout, string> = {
  'grid-2': 'grid grid-cols-2 sm:grid-cols-2 gap-4',
  'grid-3': 'grid grid-cols-2 sm:grid-cols-3 gap-4',
  'grid-4': 'grid grid-cols-2 sm:grid-cols-4 gap-4',
};

export default function DashboardStats({ deliveries, widgets, layout }: Props) {
  const values = useMemo(() => {
    const map: Record<string, number> = {};
    widgets.forEach(w => {
      map[w.id] = WIDGET_VALUE_MAP[w.id]?.(deliveries) ?? 0;
    });
    return map;
  }, [deliveries, widgets]);

  const enabledWidgets = useMemo(
    () => [...widgets].sort((a, b) => a.order - b.order).filter(w => w.enabled),
    [widgets]
  );

  if (enabledWidgets.length === 0) {
    return (
      <div className="mb-6 p-8 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
        ウィジェットが非表示になっています。カスタマイズから表示設定を変更してください。
      </div>
    );
  }

  return (
    <div className={`${LAYOUT_CLASSES[layout]} mb-6`} role="region" aria-label="ダッシュボード統計">
      {enabledWidgets.map(widget => {
        const colors = COLOR_CLASSES[widget.color];
        const value = values[widget.id] ?? 0;
        return (
          <div
            key={widget.id}
            className={`p-4 rounded-lg border ${colors.card} transition-all`}
            role="article"
            aria-label={`${widget.label}: ${value}件`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl" aria-hidden="true">{widget.icon}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                {widget.label}
              </span>
            </div>
            <div className={`text-3xl font-bold ${colors.value}`}>
              {value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">件</div>
          </div>
        );
      })}
    </div>
  );
}