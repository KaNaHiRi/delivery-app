// app/utils/csv.ts
import { Delivery } from '../types/delivery';

// ========================================
// 型定義
// ========================================

export type CsvEncoding = 'utf-8' | 'shift-jis';
export type CsvDelimiter = 'comma' | 'tab';

export interface CsvExportOptions {
  encoding: CsvEncoding;
  delimiter: CsvDelimiter;
  includeBOM: boolean;
}

export interface CsvParseResult {
  success: boolean;
  data: Delivery[];
  errors: string[];
}

// ========================================
// CSV出力関数（Day 8 - 既存機能を維持）
// ========================================

export const DEFAULT_CSV_OPTIONS: CsvExportOptions = {
  encoding: 'utf-8',
  delimiter: 'comma',
  includeBOM: true,
};

const statusToJapanese = (status: Delivery['status']): string => {
  const statusMap: Record<Delivery['status'], string> = {
    pending: '未配送',
    in_transit: '配送中',
    completed: '配送完了',
  };
  return statusMap[status];
};

const escapeCsvField = (field: string, delimiter: CsvDelimiter): string => {
  const delimiterChar = delimiter === 'comma' ? ',' : '\t';
  
  if (
    field.includes(delimiterChar) ||
    field.includes('\n') ||
    field.includes('"')
  ) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  
  return field;
};

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
  
  return fields.map(field => escapeCsvField(field, delimiter)).join(delimiterChar);
};

const getCsvHeader = (delimiter: CsvDelimiter): string => {
  const delimiterChar = delimiter === 'comma' ? ',' : '\t';
  return ['ID', '氏名', '住所', 'ステータス', '配送日'].join(delimiterChar);
};

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

const encodeShiftJIS = (text: string): Uint8Array => {
  const encoder = new TextEncoder();
  return encoder.encode(text);
};

const createCsvBlob = (
  csvText: string,
  options: CsvExportOptions
): Blob => {
  let mimeType: string;
  
  if (options.encoding === 'shift-jis') {
    const content = encodeShiftJIS(csvText);
    mimeType = 'text/csv;charset=Shift-JIS';
    return new Blob([content.buffer as ArrayBuffer], { type: mimeType });
  } else {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(csvText);
    
    if (options.includeBOM) {
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

export const downloadCSV = (
  deliveries: Delivery[],
  filename: string = 'deliveries.csv',
  options: CsvExportOptions = DEFAULT_CSV_OPTIONS
): void => {
  const csvText = convertToCSV(deliveries, options);
  const blob = createCsvBlob(csvText, options);
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateCsvFilename = (prefix: string = 'deliveries'): string => {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .slice(0, 15);
  
  return `${prefix}_${timestamp}.csv`;
};

// ========================================
// CSV読み込み関数（Day 9 - 新規追加）
// ========================================

/**
 * CSVファイルを読み込んでDelivery配列に変換
 * C#の StreamReader + CsvHelper に相当
 */
export const parseCsvFile = async (file: File): Promise<CsvParseResult> => {
  try {
    // ファイルをテキストとして読み込み
    const text = await file.text();
    return parseCsvText(text);
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`ファイル読み込みエラー: ${error instanceof Error ? error.message : '不明なエラー'}`],
    };
  }
};

/**
 * CSV文字列をパースしてバリデーション
 * C#の CsvReader + LINQ処理に相当
 */
const parseCsvText = (text: string): CsvParseResult => {
  const errors: string[] = [];
  const deliveries: Delivery[] = [];

  const lines = text.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    return { success: false, data: [], errors: ['CSVファイルが空です'] };
  }

  const headerLine = lines[0];
  const delimiter = detectDelimiter(headerLine);

  // ヘッダー検証（「氏名」と「名前」両方を許容）
  const expectedHeaders1 = ['ID', '氏名', '住所', 'ステータス', '配送日'];
  const expectedHeaders2 = ['ID', '名前', '住所', 'ステータス', '配送日'];
  const actualHeaders = parseRow(headerLine, delimiter);

  if (!validateHeaders(actualHeaders, expectedHeaders1) && 
      !validateHeaders(actualHeaders, expectedHeaders2)) {
    errors.push(`ヘッダーが不正です。期待: ${expectedHeaders1.join(', ')} または ${expectedHeaders2.join(', ')}`);
    return { success: false, data: [], errors };
  }

  // データ行を処理
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cells = parseRow(line, delimiter);
    const validationErrors = validateRow(cells, i + 1);

    if (validationErrors.length > 0) {
      errors.push(...validationErrors);
      continue;
    }

    const delivery: Delivery = {
      id: cells[0].trim(),
      name: cells[1].trim(),
      address: cells[2].trim(),
      status: parseStatus(cells[3].trim()),
      deliveryDate: cells[4].trim(),
    };

    deliveries.push(delivery);
  }

  return {
    success: errors.length === 0,
    data: deliveries,
    errors,
  };
};

/**
 * 区切り文字を自動判定（カンマ or タブ）
 */
const detectDelimiter = (line: string): CsvDelimiter => {
  const commaCount = (line.match(/,/g) || []).length;
  const tabCount = (line.match(/\t/g) || []).length;
  return tabCount > commaCount ? 'tab' : 'comma';
};

/**
 * CSV行を解析してセル配列に変換
 * C#の Regex.Split or CsvParser相当
 */
const parseRow = (line: string, delimiter: CsvDelimiter): string[] => {
  const delimiterChar = delimiter === 'comma' ? ',' : '\t';
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiterChar && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
};

/**
 * ヘッダー検証
 */
const validateHeaders = (actual: string[], expected: string[]): boolean => {
  if (actual.length !== expected.length) return false;
  return expected.every((header, i) => actual[i] === header);
};

/**
 * データ行のバリデーション
 * C#の ModelState.IsValid的な処理
 */
const validateRow = (cells: string[], rowNumber: number): string[] => {
  const errors: string[] = [];

  if (cells.length !== 5) {
    errors.push(`${rowNumber}行目: 列数が不正です（期待: 5列、実際: ${cells.length}列）`);
    return errors;
  }

  if (!cells[0].trim()) errors.push(`${rowNumber}行目: IDが空です`);
  if (!cells[1].trim()) errors.push(`${rowNumber}行目: 名前が空です`);
  if (!cells[2].trim()) errors.push(`${rowNumber}行目: 住所が空です`);
  if (!cells[3].trim()) errors.push(`${rowNumber}行目: ステータスが空です`);
  if (!cells[4].trim()) errors.push(`${rowNumber}行目: 配送日が空です`);

  const status = cells[3].trim();
  const validStatuses = ['未配送', '配送中', '配送完了', 'pending', 'in_transit', 'completed'];
  if (status && !validStatuses.includes(status)) {
    errors.push(`${rowNumber}行目: ステータスが不正です（${status}）`);
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (cells[4].trim() && !datePattern.test(cells[4].trim())) {
    errors.push(`${rowNumber}行目: 配送日の形式が不正です（YYYY-MM-DD形式で入力してください）`);
  }

  return errors;
};

/**
 * ステータス文字列を status型に変換
 */
const parseStatus = (statusText: string): 'pending' | 'in_transit' | 'completed' => {
  switch (statusText) {
    case '未配送':
    case 'pending':
      return 'pending';
    case '配送中':
    case 'in_transit':
      return 'in_transit';
    case '配送完了':
    case 'completed':
      return 'completed';
    default:
      return 'pending';
  }
};