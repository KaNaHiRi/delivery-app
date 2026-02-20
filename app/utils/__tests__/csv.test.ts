import { parseCSV, generateCSV } from '../csv';
import type { Delivery } from '@/app/types/delivery';

describe('CSV Utils', () => {
  const mockDeliveries: Delivery[] = [
    {
      id: '1',
      name: '山田太郎',
      address: '東京都新宿区1-1-1',
      status: 'pending',
      deliveryDate: '2024-02-20',
    },
    {
      id: '2',
      name: '佐藤花子',
      address: '大阪府大阪市2-2-2',
      status: 'completed',
      deliveryDate: '2024-02-21',
    },
  ];

  describe('generateCSV', () => {
    test('CSV形式の文字列を生成できること', () => {
      const csv = generateCSV(mockDeliveries, {
        encoding: 'utf-8',
        delimiter: ',',
        includeBOM: false,
      });

      expect(csv).toContain('ID,名前,住所,ステータス,配送日');
      expect(csv).toContain('山田太郎');
      expect(csv).toContain('東京都新宿区1-1-1');
    });

    test('タブ区切りでCSVを生成できること', () => {
      const csv = generateCSV(mockDeliveries, {
        encoding: 'utf-8',
        delimiter: '\t',
        includeBOM: false,
      });

      expect(csv).toContain('\t');
      expect(csv.split('\t').length).toBeGreaterThan(1);
    });

    test('BOMを含めてCSVを生成できること', () => {
      const csv = generateCSV(mockDeliveries, {
        encoding: 'utf-8',
        delimiter: ',',
        includeBOM: true,
      });

      expect(csv.charCodeAt(0)).toBe(0xfeff);
    });
  });

  describe('parseCSV', () => {
    test('CSV形式の文字列を配送データに変換できること', () => {
      const csvContent = `ID,名前,住所,ステータス,配送日
1,山田太郎,東京都新宿区1-1-1,pending,2024-02-20
2,佐藤花子,大阪府大阪市2-2-2,completed,2024-02-21`;

      const result = parseCSV(csvContent);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('山田太郎');
      expect(result.errors).toHaveLength(0);
    });

    test('不正なデータの場合エラーを返すこと', () => {
      const csvContent = `ID,名前,住所,ステータス,配送日
1,,東京都新宿区1-1-1,pending,2024-02-20`;

      const result = parseCSV(csvContent);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('名前');
    });

    test('不正なステータスの場合エラーを返すこと', () => {
      const csvContent = `ID,名前,住所,ステータス,配送日
1,山田太郎,東京都新宿区1-1-1,invalid_status,2024-02-20`;

      const result = parseCSV(csvContent);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('ステータス');
    });
  });
});