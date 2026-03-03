// app/constants/delivery.ts
import type { FormData } from '@/app/types/delivery';

// フォームの初期値（EMPTY_FORMをtypes側から参照できるよう定数として外部化）
export const EMPTY_FORM: FormData = {
  name: '',
  address: '',
  status: 'pending',
  deliveryDate: '',
  staffId: null,
  customerId: null,
  locationId: null,
};

// 自動更新間隔の選択肢
export const REFRESH_INTERVALS = [
  { label: '5秒', value: 5000 },
  { label: '10秒', value: 10000 },
  { label: '30秒', value: 30000 },
  { label: '1分', value: 60000 },
] as const;

// ステータスのカラーマッピング
export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
} as const;

// ページネーション
export const DEFAULT_ITEMS_PER_PAGE = 10;