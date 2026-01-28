/**
 * 配送ステータスの型定義
 * pending: 未配送
 * in_transit: 配送中
 * completed: 完了
 */
export type DeliveryStatus = 'pending' | 'in_transit' | 'completed';

/**
 * 配送先のデータ型
 */
export interface Delivery {
  /** 配送先ID（一意の識別子） */
  id: string;
  
  /** 配送先名 */
  name: string;
  
  /** 配送先住所 */
  address: string;
  
  /** 配送ステータス */
  status: DeliveryStatus;
  
  /** 配送予定日（ISO 8601形式の文字列） */
  deliveryDate: string;
}