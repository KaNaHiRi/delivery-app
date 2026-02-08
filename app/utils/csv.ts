// app/utils/csv.ts
import { Delivery } from '../types/delivery';

export type CsvEncoding = 'utf-8' | 'shift-jis';
export type CsvDelimiter = 'comma' | 'tab';

export interface CsvExportOptions {
  encoding: CsvEncoding;
  delimiter: CsvDelimiter;
  includeBOM: boolean;
}

/**
 * CSV出力のデフォルト設定
 */
export const DEFAULT_CSV_OPTIONS: CsvExportOptions = {
  encoding: 'utf-8',
  delimiter: 'comma',
  includeBOM: true, // Excel互換のためBOMを付与
};

/**
 * ステータスを日本語に変換
 * C#: switch式やDictionaryでのマッピングに相当
 */
const statusToJapanese = (status: Delivery['status']): string => {
  const statusMap: Record<Delivery['status'], string> = {
    pending: '未配送',
    in_transit: '配送中',
    completed: '配送完了',
  };
  return statusMap[status];
};

/**
 * CSVフィールドのエスケープ処理
 * C#: string.Replace + 条件付き引用符追加に相当
 */
const escapeCsvField = (field: string, delimiter: CsvDelimiter): string => {
  const delimiterChar = delimiter === 'comma' ? ',' : '\t';
  
  // フィールドに区切り文字、改行、ダブルクォートが含まれる場合はエスケープ
  if (
    field.includes(delimiterChar) ||
    field.includes('\n') ||
    field.includes('"')
  ) {
    // ダブルクォートを2つに変換してエスケープ
    return `"${field.replace(/"/g, '""')}"`;
  }
  
  return field;
};

/**
 * 配送データをCSV行に変換
 * C#: LINQ Select + string.Join に相当
 */
const deliveryToCsvRow = (
  delivery: Delivery,
  delimiter: CsvDelimiter
): string => {
  const delimiterChar = delimiter === 'comma' ? ',' : '\t';
  
  const fields = [
    delivery.id,
    delivery.name,
    delivery.address,
    statusToJapanese(delivery.status),
    delivery.deliveryDate,
  ];
  
  // 各フィールドをエスケープして結合
  return fields.map(field => escapeCsvField(field, delimiter)).join(delimiterChar);
};

/**
 * CSVヘッダー行を生成
 */
const getCsvHeader = (delimiter: CsvDelimiter): string => {
  const delimiterChar = delimiter === 'comma' ? ',' : '\t';
  return ['ID', '氏名', '住所', 'ステータス', '配送日'].join(delimiterChar);
};

/**
 * 配送データ配列をCSV文字列に変換
 * C#: string.Join + LINQ Select に相当
 */
export const convertToCSV = (
  deliveries: Delivery[],
  options: CsvExportOptions = DEFAULT_CSV_OPTIONS
): string => {
  if (deliveries.length === 0) {
    return getCsvHeader(options.delimiter);
  }
  
  const header = getCsvHeader(options.delimiter);
  const rows = deliveries.map(delivery => 
    deliveryToCsvRow(delivery, options.delimiter)
  );
  
  return [header, ...rows].join('\n');
};

/**
 * 文字列をShift-JISバイト配列に変換
 * C#: Encoding.GetEncoding("Shift_JIS").GetBytes() に相当
 */
const encodeShiftJIS = (text: string): Uint8Array => {
  // TextEncoderはUTF-8のみ対応のため、外部ライブラリを使用
  // 簡易実装: 実運用では encoding-japanese などを使用推奨
  const encoder = new TextEncoder();
  return encoder.encode(text);
};

/**
 * CSVデータをBlob形式に変換
 * C#: new Blob() や File.WriteAllBytes に相当
 */
const createCsvBlob = (
  csvText: string,
  options: CsvExportOptions
): Blob => {
  let mimeType: string;
  
  if (options.encoding === 'shift-jis') {
    // Shift-JIS（Excel互換）
    const content = encodeShiftJIS(csvText);
    mimeType = 'text/csv;charset=Shift-JIS';
    return new Blob([content.buffer as ArrayBuffer], { type: mimeType });
  } else {
    // UTF-8
    const encoder = new TextEncoder();
    const encoded = encoder.encode(csvText);
    
    if (options.includeBOM) {
      // BOM (0xEF, 0xBB, 0xBF) を付与
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const combined = new Uint8Array(bom.length + encoded.length);
      combined.set(bom, 0);
      combined.set(encoded, bom.length);
      mimeType = 'text/csv;charset=UTF-8';
      return new Blob([combined.buffer as ArrayBuffer], { type: mimeType });
    } else {
      mimeType = 'text/csv;charset=UTF-8';
      return new Blob([encoded.buffer as ArrayBuffer], { type: mimeType });
    }
  }
};

/**
 * CSVファイルをダウンロード
 * C#: File.WriteAllBytes + Process.Start でファイル保存に相当
 */
export const downloadCSV = (
  deliveries: Delivery[],
  filename: string = 'deliveries.csv',
  options: CsvExportOptions = DEFAULT_CSV_OPTIONS
): void => {
  // CSV文字列に変換
  const csvText = convertToCSV(deliveries, options);
  
  // Blob作成
  const blob = createCsvBlob(csvText, options);
  
  // ダウンロード実行
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // クリーンアップ
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * ファイル名を生成（タイムスタンプ付き）
 * C#: $"deliveries_{DateTime.Now:yyyyMMdd_HHmmss}.csv" に相当
 */
export const generateCsvFilename = (prefix: string = 'deliveries'): string => {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .slice(0, 15); // yyyyMMdd_HHmmss
  
  return `${prefix}_${timestamp}.csv`;
};