import { applyAdvancedFilters, applyQuickFilter, hasActiveFilters, createEmptyFilters } from '../filters';
import type { Delivery, AdvancedFilters, QuickFilterType } from '@/app/types/delivery';

describe('Filter Utils', () => {
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
      status: 'in_transit',
      deliveryDate: '2024-02-21',
    },
    {
      id: '3',
      name: '鈴木一郎',
      address: '東京都渋谷区3-3-3',
      status: 'completed',
      deliveryDate: '2024-02-19',
    },
  ];

  describe('createEmptyFilters', () => {
    test('空のフィルターを作成できること', () => {
      const filters = createEmptyFilters();
      
      expect(filters.statuses).toEqual([]);
      expect(filters.dateRange).toBeNull();
      expect(filters.addressKeyword).toBe('');
      expect(filters.nameKeyword).toBe('');
    });
  });

  describe('hasActiveFilters', () => {
    test('空のフィルターの場合falseを返すこと', () => {
      const filters = createEmptyFilters();
      expect(hasActiveFilters(filters)).toBe(false);
    });

    test('ステータスフィルターがある場合trueを返すこと', () => {
      const filters: AdvancedFilters = {
        statuses: ['pending'],
        dateRange: null,
        addressKeyword: '',
        nameKeyword: '',
      };
      expect(hasActiveFilters(filters)).toBe(true);
    });

    test('キーワードがある場合trueを返すこと', () => {
      const filters: AdvancedFilters = {
        statuses: [],
        dateRange: null,
        addressKeyword: '東京',
        nameKeyword: '',
      };
      expect(hasActiveFilters(filters)).toBe(true);
    });
  });

  describe('applyAdvancedFilters', () => {
    test('ステータスでフィルタリングできること', () => {
      const filters: AdvancedFilters = {
        statuses: ['pending'],
        dateRange: null,
        addressKeyword: '',
        nameKeyword: '',
      };

      const result = applyAdvancedFilters(mockDeliveries, filters);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });

    test('住所キーワードでフィルタリングできること', () => {
      const filters: AdvancedFilters = {
        statuses: [],
        dateRange: null,
        addressKeyword: '東京',
        nameKeyword: '',
      };

      const result = applyAdvancedFilters(mockDeliveries, filters);

      expect(result).toHaveLength(2);
      expect(result.every(d => d.address.includes('東京'))).toBe(true);
    });

    test('名前キーワードでフィルタリングできること', () => {
      const filters: AdvancedFilters = {
        statuses: [],
        dateRange: null,
        addressKeyword: '',
        nameKeyword: '山田',
      };

      const result = applyAdvancedFilters(mockDeliveries, filters);

      expect(result).toHaveLength(1);
      expect(result[0].name).toContain('山田');
    });

    test('日付範囲でフィルタリングできること', () => {
      const filters: AdvancedFilters = {
        statuses: [],
        dateRange: {
          startDate: '2024-02-20',
          endDate: '2024-02-21',
        },
        addressKeyword: '',
        nameKeyword: '',
      };

      const result = applyAdvancedFilters(mockDeliveries, filters);

      expect(result).toHaveLength(2);
      expect(result.find(d => d.id === '3')).toBeUndefined();
    });

    test('複数条件を組み合わせてフィルタリングできること', () => {
      const filters: AdvancedFilters = {
        statuses: ['pending', 'in_transit'],
        dateRange: null,
        addressKeyword: '東京',
        nameKeyword: '',
      };

      const result = applyAdvancedFilters(mockDeliveries, filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('applyQuickFilter', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-02-20'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('今日配送のフィルターが動作すること', () => {
      const result = applyQuickFilter(mockDeliveries, 'today');

      expect(result).toHaveLength(1);
      expect(result[0].deliveryDate).toBe('2024-02-20');
    });

    test('明日配送のフィルターが動作すること', () => {
      const result = applyQuickFilter(mockDeliveries, 'tomorrow');

      expect(result).toHaveLength(1);
      expect(result[0].deliveryDate).toBe('2024-02-21');
    });

    test('配送中のみのフィルターが動作すること', () => {
      const result = applyQuickFilter(mockDeliveries, 'in_transit_only');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('in_transit');
    });

    test('本日完了のフィルターが動作すること', () => {
      const todayCompleted: Delivery = {
        id: '4',
        name: 'テスト',
        address: 'テスト住所',
        status: 'completed',
        deliveryDate: '2024-02-20',
      };

      const result = applyQuickFilter([...mockDeliveries, todayCompleted], 'completed_today');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
    });
  });
});