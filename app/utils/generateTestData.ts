import type { Delivery } from '@/app/types/delivery';

const NAMES = ['田中 太郎', '鈴木 花子', '佐藤 次郎', '山田 美咲', '伊藤 健一', '渡辺 京子', '中村 一郎', '小林 奈々'];
const ADDRESSES = ['東京都渋谷区', '大阪府大阪市', '神奈川県横浜市', '愛知県名古屋市', '福岡県福岡市', '北海道札幌市', '宮城県仙台市', '広島県広島市'];
const STATUSES: Delivery['status'][] = ['pending', 'in_transit', 'completed'];

export function generateTestData(count: number): Delivery[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30 - 10));
    return {
      id: `TEST${String(i + 1).padStart(5, '0')}`,
      name: NAMES[i % NAMES.length],
      address: `${ADDRESSES[i % ADDRESSES.length]}${i + 1}丁目`,
      status: STATUSES[i % STATUSES.length],
      deliveryDate: date.toISOString().split('T')[0],
    };
  });
}