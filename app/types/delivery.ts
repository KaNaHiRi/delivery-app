export interface Delivery {
  id: string;
  name: string;
  address: string;
  status: 'pending' | 'in_transit' | 'completed';
  deliveryDate: string;
  staffId?: string | null;
  customerId?: string | null;
  staff?: { id: string; name: string } | null;
  customer?: { id: string; name: string } | null;
}

export interface NotificationSettings {
  enabled: boolean;
  deadlineAlert: boolean;
  statusChangeAlert: boolean;
}

export type PeriodType = 'week' | 'month' | 'last30days' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PeriodSelection {
  type: PeriodType;
  dateRange?: DateRange;
}

export interface AdvancedFilters {
  statuses: ('pending' | 'in_transit' | 'completed')[];
  dateRange: {
    startDate: string;
    endDate: string;
  } | null;
  addressKeyword: string;
  nameKeyword: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: AdvancedFilters;
  createdAt: string;
}

export type QuickFilterType =
  | 'today'
  | 'tomorrow'
  | 'this_week'
  | 'overdue'
  | 'in_transit_only'
  | 'completed_today';

  // ── Day 37: ダッシュボードカスタマイズ ──
export type WidgetId = 
  | 'stats_total'
  | 'stats_pending'
  | 'stats_in_transit'
  | 'stats_completed'
  | 'stats_today'
  | 'stats_overdue';

export interface WidgetConfig {
  id: WidgetId;
  label: string;
  enabled: boolean;
  order: number;
  color: 'blue' | 'yellow' | 'green' | 'orange' | 'red' | 'purple';
  icon: string;
}

export type DashboardLayout = 'grid-2' | 'grid-3' | 'grid-4';