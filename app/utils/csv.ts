import type { Delivery } from '../types/delivery';

export interface CSVExportOptions {
  encoding: 'utf-8' | 'shift-jis';
  delimiter: ',' | '\t';
  includeBOM: boolean;
}

export interface CSVParseResult {
  data: Delivery[];
  errors: string[];
}

/**
 * 配送データをCSV文字列に変換
 */
export function generateCSV(
  deliveries: Delivery[],
  options: CSVExportOptions
): string {
  const { delimiter, includeBOM } = options;
  
  // ヘッダー行
  const headers = ['ID', '名前', '住所', 'ステータス', '配送日'];
  let csv = headers.join(delimiter) + '\n';
  
  // データ行
  deliveries.forEach((delivery) => {
    const statusMap: Record<Delivery['status'], string> = {
      pending: '配送前',
      in_transit: '配送中',
      completed: '配送完了',
    };
    
    const row = [
      delivery.id,
      delivery.name,
      delivery.address,
      statusMap[delivery.status],
      delivery.deliveryDate,
    ];
    
    csv += row.join(delimiter) + '\n';
  });
  
  // BOM追加
  if (includeBOM) {
    csv = '\uFEFF' + csv;
  }
  
  return csv;
}

/**
 * CSV文字列を配送データに変換
 */
export function parseCSV(csvContent: string): CSVParseResult {
  const lines = csvContent.trim().split('\n');
  const data: Delivery[] = [];
  const errors: string[] = [];
  
  // ヘッダー行をスキップ
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(',');
    
    // バリデーション
    if (columns.length < 5) {
      errors.push(`行 ${i + 1}: 列数が不足しています`);
      continue;
    }
    
    const [id, name, address, status, deliveryDate] = columns;
    
    // 必須項目チェック
    if (!name || !name.trim()) {
      errors.push(`行 ${i + 1}: 名前が入力されていません`);
      continue;
    }
    
    if (!address || !address.trim()) {
      errors.push(`行 ${i + 1}: 住所が入力されていません`);
      continue;
    }
    
    // ステータスチェック
    const statusMap: Record<string, Delivery['status']> = {
      '配送前': 'pending',
      '配送中': 'in_transit',
      '配送完了': 'completed',
      'pending': 'pending',
      'in_transit': 'in_transit',
      'completed': 'completed',
    };
    
    const normalizedStatus = statusMap[status];
    if (!normalizedStatus) {
      errors.push(`行 ${i + 1}: ステータスが不正です（${status}）`);
      continue;
    }
    
    // 日付チェック
    if (!deliveryDate || !deliveryDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.push(`行 ${i + 1}: 配送日の形式が不正です（${deliveryDate}）`);
      continue;
    }
    
    // データ追加
    data.push({
      id: id || `DEL${Date.now()}_${i}`,
      name: name.trim(),
      address: address.trim(),
      status: normalizedStatus,
      deliveryDate: deliveryDate.trim(),
    });
  }
  
  return { data, errors };
}

/**
 * CSVデータのバリデーション
 */
export function validateCsvData(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('データが配列ではありません');
    return { isValid: false, errors };
  }
  
  if (data.length === 0) {
    errors.push('データが空です');
    return { isValid: false, errors };
  }
  
  data.forEach((item, index) => {
    if (!item.name || typeof item.name !== 'string') {
      errors.push(`行 ${index + 1}: 名前が不正です`);
    }
    if (!item.address || typeof item.address !== 'string') {
      errors.push(`行 ${index + 1}: 住所が不正です`);
    }
    if (!['pending', 'in_transit', 'completed'].includes(item.status)) {
      errors.push(`行 ${index + 1}: ステータスが不正です`);
    }
    if (!item.deliveryDate || !item.deliveryDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.push(`行 ${index + 1}: 配送日が不正です`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
}

/**
 * CSVエクスポート（ダウンロード）
 */
export function exportToCSV(
  deliveries: Delivery[],
  options: CSVExportOptions,
  filename: string
): void {
  const csvContent = generateCSV(deliveries, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * CSVファイルをダウンロード
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * タイムスタンプ付きファイル名を生成
 */
export function generateFilename(prefix: string, extension: string): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, -5);
  return `${prefix}_${timestamp}.${extension}`;
}