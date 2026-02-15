import * as XLSX from 'xlsx';
import { Delivery } from '../types/delivery';

// ステータスの日本語変換
const getStatusLabel = (status: Delivery['status']): string => {
  const labels = {
    pending: '配送前',
    in_transit: '配送中',
    completed: '完了'
  };
  return labels[status];
};

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

// データシートの作成
const createDataSheet = (deliveries: Delivery[]): XLSX.WorkSheet => {
  // ヘッダー行
  const headers = ['ID', '名前', '住所', 'ステータス', '配送日'];
  
  // データ行
  const data = deliveries.map(d => [
    d.id,
    d.name,
    d.address,
    getStatusLabel(d.status),
    d.deliveryDate
  ]);
  
  // ワークシート作成
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // 列幅の設定
  ws['!cols'] = [
    { wch: 10 },  // ID
    { wch: 20 },  // 名前
    { wch: 40 },  // 住所
    { wch: 12 },  // ステータス
    { wch: 12 }   // 配送日
  ];
  
  // ヘッダー行のスタイル設定
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:E1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;
    
    ws[cellAddress].s = {
      fill: { fgColor: { rgb: '4F46E5' } },  // Indigo-600
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }
  
  return ws;
};

// 統計サマリーシートの作成
const createSummarySheet = (deliveries: Delivery[]): XLSX.WorkSheet => {
  const summaryData: any[][] = [];
  
  // タイトル
  summaryData.push(['配送管理システム - 統計サマリー']);
  summaryData.push([]);
  
  // ステータス別集計
  summaryData.push(['■ ステータス別集計']);
  summaryData.push(['ステータス', '件数', '割合']);
  
  const totalCount = deliveries.length;
  const statusCounts = {
    pending: deliveries.filter(d => d.status === 'pending').length,
    in_transit: deliveries.filter(d => d.status === 'in_transit').length,
    completed: deliveries.filter(d => d.status === 'completed').length
  };
  
  summaryData.push([
    '配送前',
    statusCounts.pending,
    totalCount > 0 ? `${((statusCounts.pending / totalCount) * 100).toFixed(1)}%` : '0%'
  ]);
  summaryData.push([
    '配送中',
    statusCounts.in_transit,
    totalCount > 0 ? `${((statusCounts.in_transit / totalCount) * 100).toFixed(1)}%` : '0%'
  ]);
  summaryData.push([
    '完了',
    statusCounts.completed,
    totalCount > 0 ? `${((statusCounts.completed / totalCount) * 100).toFixed(1)}%` : '0%'
  ]);
  summaryData.push(['合計', totalCount, '100%']);
  summaryData.push([]);
  
  // エリア別集計
  summaryData.push(['■ エリア別集計（都道府県）']);
  summaryData.push(['都道府県', '件数', '完了率']);
  
  const prefectureCounts = new Map<string, { total: number; completed: number }>();
  deliveries.forEach(d => {
    const pref = extractPrefecture(d.address);
    const current = prefectureCounts.get(pref) || { total: 0, completed: 0 };
    current.total++;
    if (d.status === 'completed') current.completed++;
    prefectureCounts.set(pref, current);
  });
  
  const sortedPrefectures = Array.from(prefectureCounts.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);  // 上位10件
  
  sortedPrefectures.forEach(([pref, counts]) => {
    const completionRate = counts.total > 0
      ? `${((counts.completed / counts.total) * 100).toFixed(1)}%`
      : '0%';
    summaryData.push([pref, counts.total, completionRate]);
  });
  summaryData.push([]);
  
  // 日別集計（過去7日間）
  summaryData.push(['■ 日別集計（過去7日間）']);
  summaryData.push(['日付', '配送前', '配送中', '完了', '合計']);
  
  const today = new Date();
  const dateCounts = new Map<string, { pending: number; in_transit: number; completed: number }>();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateCounts.set(dateStr, { pending: 0, in_transit: 0, completed: 0 });
  }
  
  deliveries.forEach(d => {
    const counts = dateCounts.get(d.deliveryDate);
    if (counts) {
      counts[d.status]++;
    }
  });
  
  dateCounts.forEach((counts, date) => {
    const total = counts.pending + counts.in_transit + counts.completed;
    summaryData.push([date, counts.pending, counts.in_transit, counts.completed, total]);
  });
  
  // ワークシート作成
  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  
  // 列幅の設定
  ws['!cols'] = [
    { wch: 25 },  // 項目名
    { wch: 12 },  // 値1
    { wch: 12 },  // 値2
    { wch: 12 },  // 値3
    { wch: 12 }   // 値4
  ];
  
  return ws;
};

// Excel エクスポート
export const exportToExcel = (
  deliveries: Delivery[],
  filename: string = 'deliveries'
): void => {
  // ワークブック作成
  const wb = XLSX.utils.book_new();
  
  // データシート追加
  const dataSheet = createDataSheet(deliveries);
  XLSX.utils.book_append_sheet(wb, dataSheet, '配送データ');
  
  // 統計サマリーシート追加
  const summarySheet = createSummarySheet(deliveries);
  XLSX.utils.book_append_sheet(wb, summarySheet, '統計サマリー');
  
  // タイムスタンプ付きファイル名
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;
  
  // ファイル出力
  XLSX.writeFile(wb, fullFilename);
};