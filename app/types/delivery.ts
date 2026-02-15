// app/types/delivery.ts
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

// ★Day 17: 期間選択の型定義★
export type PeriodType = 'week' | 'month' | 'last30days' | 'custom';

export interface DateRange {
  startDate: string;  // YYYY-MM-DD形式
  endDate: string;    // YYYY-MM-DD形式
}

export interface PeriodSelection {
  type: PeriodType;
  dateRange?: DateRange;  // type='custom'の場合に使用
}