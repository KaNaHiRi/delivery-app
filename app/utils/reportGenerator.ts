// app/utils/reportGenerator.ts
// C# の PrintDocument / RDLC レポートに相当するユーティリティ

import type { Delivery, ReportConfig, ReportStats, DateRange } from '../types/delivery';

/** 期間内の配送データを抽出（C#: LINQ Where に相当） */
export function filterDeliveriesByPeriod(
  deliveries: Delivery[],
  period: DateRange
): Delivery[] {
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  end.setHours(23, 59, 59, 999);

  return deliveries.filter(d => {
    const date = new Date(d.deliveryDate);
    return date >= start && date <= end;
  });
}

/** 統計を計算（C#: LINQ GroupBy → Select に相当） */
export function calcReportStats(deliveries: Delivery[]): ReportStats {
  const total = deliveries.length;
  const pending = deliveries.filter(d => d.status === 'pending').length;
  const inTransit = deliveries.filter(d => d.status === 'in_transit').length;
  const completed = deliveries.filter(d => d.status === 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // 日数でわって1日平均を算出
  const averagePerDay = total > 0 ? Math.round(total / Math.max(getDayCount(deliveries), 1)) : 0;

  return { total, pending, inTransit, completed, completionRate, averagePerDay };
}

function getDayCount(deliveries: Delivery[]): number {
  const dates = new Set(deliveries.map(d => d.deliveryDate));
  return dates.size;
}

/** ステータス別グラフデータ（recharts 用） */
export function getStatusChartData(deliveries: Delivery[]) {
  const stats = calcReportStats(deliveries);
  return [
    { name: '配送待ち', value: stats.pending, color: '#F59E0B' },
    { name: '配送中', value: stats.inTransit, color: '#3B82F6' },
    { name: '完了', value: stats.completed, color: '#10B981' },
  ];
}

/** 日別配送件数グラフデータ */
export function getDailyChartData(deliveries: Delivery[], period: DateRange) {
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const data: { date: string; count: number; completed: number }[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayDeliveries = deliveries.filter(del => del.deliveryDate === dateStr);
    data.push({
      date: dateStr.slice(5), // MM-DD形式
      count: dayDeliveries.length,
      completed: dayDeliveries.filter(del => del.status === 'completed').length,
    });
  }
  return data;
}

/** レポートタイトル生成 */
export function generateReportTitle(config: ReportConfig): string {
  const start = config.period.startDate;
  const end = config.period.endDate;
  return `${config.title}（${start} 〜 ${end}）`;
}

/** 今月の期間を返す */
export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

/** 先月の期間を返す */
export function getLastMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}