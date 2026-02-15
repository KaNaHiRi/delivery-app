import { Delivery, AdvancedFilters, QuickFilterType } from '../types/delivery';

/**
 * 詳細フィルターを適用
 */
export function applyAdvancedFilters(
  deliveries: Delivery[],
  filters: AdvancedFilters
): Delivery[] {
  return deliveries.filter(delivery => {
    // ステータスフィルター
    if (filters.statuses.length > 0 && !filters.statuses.includes(delivery.status)) {
      return false;
    }

    // 日付範囲フィルター
    if (filters.dateRange) {
      const deliveryDate = delivery.deliveryDate;
      if (deliveryDate < filters.dateRange.startDate || deliveryDate > filters.dateRange.endDate) {
        return false;
      }
    }

    // 住所キーワードフィルター
    if (filters.addressKeyword.trim() !== '') {
      if (!delivery.address.toLowerCase().includes(filters.addressKeyword.toLowerCase())) {
        return false;
      }
    }

    // 名前キーワードフィルター
    if (filters.nameKeyword.trim() !== '') {
      if (!delivery.name.toLowerCase().includes(filters.nameKeyword.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

/**
 * クイックフィルターを適用
 */
export function applyQuickFilter(
  deliveries: Delivery[],
  filterType: QuickFilterType
): Delivery[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  // 今週の開始日（日曜日）
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const weekStart = startOfWeek.toISOString().split('T')[0];
  
  // 今週の終了日（土曜日）
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const weekEnd = endOfWeek.toISOString().split('T')[0];

  switch (filterType) {
    case 'today':
      // 今日配送予定
      return deliveries.filter(d => d.deliveryDate === today);

    case 'tomorrow':
      // 明日配送予定
      return deliveries.filter(d => d.deliveryDate === tomorrow);

    case 'this_week':
      // 今週配送予定
      return deliveries.filter(d => d.deliveryDate >= weekStart && d.deliveryDate <= weekEnd);

    case 'overdue':
      // 配送遅延（pending で過去日付）
      return deliveries.filter(d => d.status === 'pending' && d.deliveryDate < today);

    case 'in_transit_only':
      // 配送中のみ
      return deliveries.filter(d => d.status === 'in_transit');

    case 'completed_today':
      // 本日完了分
      return deliveries.filter(d => d.status === 'completed' && d.deliveryDate === today);

    default:
      return deliveries;
  }
}

/**
 * 空のフィルター条件を生成
 */
export function createEmptyFilters(): AdvancedFilters {
  return {
    statuses: [],
    dateRange: null,
    addressKeyword: '',
    nameKeyword: '',
  };
}

/**
 * フィルターが適用されているかチェック
 */
export function hasActiveFilters(filters: AdvancedFilters): boolean {
  return (
    filters.statuses.length > 0 ||
    filters.dateRange !== null ||
    filters.addressKeyword.trim() !== '' ||
    filters.nameKeyword.trim() !== ''
  );
}

/**
 * フィルター条件を読みやすいテキストに変換
 */
export function formatFilterDescription(filters: AdvancedFilters): string[] {
  const descriptions: string[] = [];

  if (filters.statuses.length > 0) {
    const statusLabels = filters.statuses.map(s => {
      switch (s) {
        case 'pending': return '配送前';
        case 'in_transit': return '配送中';
        case 'completed': return '完了';
      }
    });
    descriptions.push(`ステータス: ${statusLabels.join(', ')}`);
  }

  if (filters.dateRange) {
    descriptions.push(`期間: ${filters.dateRange.startDate} 〜 ${filters.dateRange.endDate}`);
  }

  if (filters.addressKeyword.trim() !== '') {
    descriptions.push(`住所: "${filters.addressKeyword}"`);
  }

  if (filters.nameKeyword.trim() !== '') {
    descriptions.push(`名前: "${filters.nameKeyword}"`);
  }

  return descriptions;
}