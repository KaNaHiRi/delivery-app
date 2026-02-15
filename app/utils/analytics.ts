// app/utils/analytics.ts
import { Delivery } from '../types/delivery';

// ★Day 17: 期間タイプにcustomを追加★
export type PeriodType = 'week' | 'month' | 'last30days' | 'custom';

// 日付範囲の型定義
export interface DateRange {
  start: Date;
  end: Date;
}

// 日付範囲を取得
export const getDateRange = (period: PeriodType): DateRange => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  switch (period) {
    case 'week':
      // 今週の月曜日
      const dayOfWeek = start.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(start.getDate() - diff);
      break;
    case 'month':
      // 今月の1日
      start.setDate(1);
      break;
    case 'last30days':
      // 過去30日
      start.setDate(start.getDate() - 29);
      break;
    case 'custom':
      // カスタム期間の場合はデフォルト値（過去30日）
      start.setDate(start.getDate() - 29);
      break;
  }
  
  return { start, end };
};

// ★Day 17: 配送実績の推移データ生成（カスタム期間対応版）★
export const generateTrendData = (
  deliveries: Delivery[],
  period: PeriodType | string
): any[] => {
  const dateMap = new Map<string, { pending: number; in_transit: number; completed: number }>();
  
  // ★Day 17: カスタム期間対応★
  if (period === 'custom') {
    // カスタム期間の場合、データから自動計算
    if (deliveries.length === 0) return [];
    
    const dates = deliveries.map(d => new Date(d.deliveryDate));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // カスタム期間の場合、実際のデータ範囲で初期化
    const current = new Date(minDate);
    while (current <= maxDate) {
      const dateStr = current.toISOString().split('T')[0];
      dateMap.set(dateStr, { pending: 0, in_transit: 0, completed: 0 });
      current.setDate(current.getDate() + 1);
    }
  } else {
    // 既存のプリセット期間処理
    const dateRange = getDateRange(period as PeriodType);
    
    // 日付リストを生成
    const current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      const dateStr = current.toISOString().split('T')[0];
      dateMap.set(dateStr, { pending: 0, in_transit: 0, completed: 0 });
      current.setDate(current.getDate() + 1);
    }
  }
  
  // データを集計
  deliveries.forEach(d => {
    const counts = dateMap.get(d.deliveryDate);
    if (counts) {
      counts[d.status]++;
    }
  });
  
  // グラフ用データに変換
  return Array.from(dateMap.entries())
    .map(([date, counts]) => ({
      date: formatDateForDisplay(date, period),
      配送前: counts.pending,
      配送中: counts.in_transit,
      完了: counts.completed
    }))
    .slice(0, getMaxDisplayDays(period));
};

// ★Day 17: 日付フォーマット（表示用）★
function formatDateForDisplay(dateStr: string, period: PeriodType | string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // カスタム期間の場合は月/日表示
  if (period === 'custom') {
    return `${month}/${day}`;
  }

  // 週の場合は曜日も表示
  if (period === 'week') {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${month}/${day}(${weekdays[date.getDay()]})`;
  }

  return `${month}/${day}`;
}

// ★Day 17: 表示する最大日数を取得★
function getMaxDisplayDays(period: PeriodType | string): number {
  switch (period) {
    case 'week':
      return 7;
    case 'month':
      return 31;
    case 'last30days':
      return 30;
    case 'custom':
      return 60; // カスタム期間は最大60日まで表示
    default:
      return 30;
  }
}

// 住所から都道府県を抽出
const extractPrefecture = (address: string): string => {
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  
  for (const pref of prefectures) {
    if (address.includes(pref)) {
      return pref;
    }
  }
  return 'その他';
};

// エリア別配送データ生成
export const generateAreaData = (deliveries: Delivery[]): any[] => {
  const prefectureCounts = new Map<string, number>();
  
  deliveries.forEach(d => {
    const pref = extractPrefecture(d.address);
    prefectureCounts.set(pref, (prefectureCounts.get(pref) || 0) + 1);
  });
  
  return Array.from(prefectureCounts.entries())
    .map(([prefecture, count]) => ({ prefecture, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

// 時間帯を判定（配送日から推測）
const getTimeSlot = (deliveryDate: string): string => {
  const date = new Date(deliveryDate);
  const hour = date.getHours();
  
  if (hour >= 6 && hour < 12) return '午前 (6-12時)';
  if (hour >= 12 && hour < 17) return '午後 (12-17時)';
  if (hour >= 17 && hour < 21) return '夕方 (17-21時)';
  return '夜間 (21-6時)';
};

// 時間帯別配送データ生成
export const generateTimeSlotData = (deliveries: Delivery[]): any[] => {
  const timeSlotCounts = new Map<string, number>();
  
  deliveries.forEach(d => {
    const slot = getTimeSlot(d.deliveryDate);
    timeSlotCounts.set(slot, (timeSlotCounts.get(slot) || 0) + 1);
  });
  
  return Array.from(timeSlotCounts.entries()).map(([name, value]) => ({
    name,
    value
  }));
};

// 統計サマリー生成
export const generateStatsSummary = (deliveries: Delivery[]): {
  totalDeliveries: number;
  completionRate: number;
  avgCompletionDays: number;
  inTransitCount: number;
} => {
  const totalDeliveries = deliveries.length;
  const completedCount = deliveries.filter(d => d.status === 'completed').length;
  const inTransitCount = deliveries.filter(d => d.status === 'in_transit').length;
  
  const completionRate = totalDeliveries > 0
    ? Math.round((completedCount / totalDeliveries) * 100)
    : 0;
  
  // 平均完了日数の計算（簡易版：配送日から今日までの日数）
  const today = new Date();
  const completedDeliveries = deliveries.filter(d => d.status === 'completed');
  const avgCompletionDays = completedDeliveries.length > 0
    ? Math.round(
        completedDeliveries.reduce((sum, d) => {
          const deliveryDate = new Date(d.deliveryDate);
          const diffTime = today.getTime() - deliveryDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0) / completedDeliveries.length
      )
    : 0;
  
  return {
    totalDeliveries,
    completionRate,
    avgCompletionDays,
    inTransitCount
  };
};