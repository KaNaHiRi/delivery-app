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

// CSV出力オプション
export interface CsvExportOptions {
  encoding?: 'utf8' | 'sjis';
  delimiter?: 'comma' | 'tab';
  includeBOM?: boolean;
  filename?: string;
}

// CSV文字列生成
const generateCsvString = (
  deliveries: Delivery[],
  delimiter: 'comma' | 'tab'
): string => {
  const delim = delimiter === 'comma' ? ',' : '\t';
  
  // ヘッダー行（IDは除外）
  const headers = ['名前', '住所', 'ステータス', '配送日'];
  const headerRow = headers.join(delim);
  
  // データ行
  const dataRows = deliveries.map(d => {
    const row = [
      d.name,
      d.address,
      getStatusLabel(d.status),
      d.deliveryDate
    ];
    return row.map(cell => `"${cell}"`).join(delim);
  });
  
  return [headerRow, ...dataRows].join('\n');
};

// CSV エクスポート
export const exportToCSV = (
  deliveries: Delivery[],
  options: CsvExportOptions = {}
): void => {
  const {
    encoding = 'utf8',
    delimiter = 'comma',
    includeBOM = true,
    filename = 'deliveries'
  } = options;
  
  // CSV文字列生成
  const csvString = generateCsvString(deliveries, delimiter);
  
  // BOM付与（UTF-8の場合）
  const bom = includeBOM && encoding === 'utf8' ? '\uFEFF' : '';
  const content = bom + csvString;
  
  // Blob作成
  let blob: Blob;
  if (encoding === 'sjis') {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(content);
    blob = new Blob([uint8Array], { type: 'text/csv;charset=Shift-JIS' });
  } else {
    blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  }
  
  // ダウンロード
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // タイムスタンプ付きファイル名
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  link.download = `${filename}_${timestamp}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// CSVインポート用のパース関数
export const parseCSV = (csvText: string): any[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  // ヘッダー行を解析
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  // データ行を解析
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    
    const row: any = { lineNumber: index + 2 };
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    
    return row;
  });
};

// CSVバリデーション（ID列は無視）
export const validateCsvData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  data.forEach((row) => {
    const lineNum = row.lineNumber;
    
    // 名前チェック
    if (!row['名前'] || row['名前'].trim() === '') {
      errors.push(`${lineNum}行目: 名前が入力されていません`);
    }
    
    // 住所チェック
    if (!row['住所'] || row['住所'].trim() === '') {
      errors.push(`${lineNum}行目: 住所が入力されていません`);
    }
    
    // ステータスチェック
    const validStatuses = ['配送前', '配送中', '完了', 'pending', 'in_transit', 'completed'];
    if (!row['ステータス'] || !validStatuses.includes(row['ステータス'])) {
      errors.push(`${lineNum}行目: ステータスが不正です（配送前/配送中/完了のいずれかを指定）`);
    }
    
    // 配送日チェック
    if (!row['配送日'] || !/^\d{4}-\d{2}-\d{2}$/.test(row['配送日'])) {
      errors.push(`${lineNum}行目: 配送日の形式が不正です（YYYY-MM-DD形式で入力）`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};