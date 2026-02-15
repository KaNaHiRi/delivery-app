export interface Delivery {
  id: string;
  name: string;
  address: string;
  status: 'pending' | 'in_transit' | 'completed';
  deliveryDate: string;
}

export interface NotificationSettings {
  enabled: boolean;
  deadlineAlert: boolean;
  statusChangeAlert: boolean;
}

export type NotificationPermission = 'granted' | 'denied' | 'default';

export type PeriodType = 'week' | 'month' | 'last30days' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PeriodSelection {
  type: PeriodType;
  dateRange?: DateRange;
}

// ===== Day 18: 高度なフィルター機能の型定義 =====

/**
 * 詳細フィルター条件
 */
export interface AdvancedFilters {
  statuses: ('pending' | 'in_transit' | 'completed')[];  // 選択中のステータス（複数可）
  dateRange: {
    startDate: string;  // YYYY-MM-DD
    endDate: string;    // YYYY-MM-DD
  } | null;
  addressKeyword: string;  // 住所キーワード
  nameKeyword: string;     // 名前キーワード
}

/**
 * フィルタープリセット
 */
export interface FilterPreset {
  id: string;
  name: string;
  filters: AdvancedFilters;
  createdAt: string;  // ISO 8601形式
}

/**
 * クイックフィルターの種類
 */
export type QuickFilterType = 
  | 'today'           // 今日配送予定
  | 'tomorrow'        // 明日配送予定
  | 'this_week'       // 今週配送予定
  | 'overdue'         // 配送遅延（pending で過去日付）
  | 'in_transit_only' // 配送中のみ
  | 'completed_today'; // 本日完了分