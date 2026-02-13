export interface Delivery {
  id: string;
  name: string;
  address: string;
  status: 'pending' | 'in_transit' | 'completed';
  deliveryDate: string;
}

// Day 14: 通知設定の型定義
export interface NotificationSettings {
  enabled: boolean;              // 通知全体の有効/無効
  deadlineAlert: boolean;         // 配送期限アラートの有効/無効
  statusChangeAlert: boolean;     // ステータス変更通知の有効/無効
}

// 通知許可状態の型定義
export type NotificationPermission = 'granted' | 'denied' | 'default';