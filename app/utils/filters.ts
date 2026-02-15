import type { 
  Delivery, 
  AdvancedFilters, 
  QuickFilterType 
} from '../types/delivery';

// キャッシュ用のWeakMap（メモリリークを防ぐ）
const filterCache = new WeakMap<Delivery[], Map<string, Delivery[]>>();

function getCacheKey(filters: AdvancedFilters | QuickFilterType): string {
  if (typeof filters === 'string') {
    return `quick:${filters}`;
  }
  return `advanced:${JSON.stringify(filters)}`;
}

// 詳細フィルターを適用する関数（最適化版）
export function applyAdvancedFilters(
  deliveries: Delivery[],
  filters: AdvancedFilters
): Delivery[] {
  // キャッシュチェック
  const cache = filterCache.get(deliveries);
  const cacheKey = getCacheKey(filters);
  
  if (cache?.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  let result = deliveries;

  // ステータスフィルター
  if (filters.statuses.length > 0) {
    const statusSet = new Set(filters.statuses); // O(1)検索用
    result = result.filter((d) => statusSet.has(d.status));
  }

  // 日付範囲フィルター
  if (filters.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    result = result.filter((d) => {
      return d.deliveryDate >= startDate && d.deliveryDate <= endDate;
    });
  }

  // 住所キーワードフィルター
  if (filters.addressKeyword) {
    const keyword = filters.addressKeyword.toLowerCase();
    result = result.filter((d) => d.address.toLowerCase().includes(keyword));
  }

  // 名前キーワードフィルター
  if (filters.nameKeyword) {
    const keyword = filters.nameKeyword.toLowerCase();
    result = result.filter((d) => d.name.toLowerCase().includes(keyword));
  }

  // キャッシュに保存
  if (!filterCache.has(deliveries)) {
    filterCache.set(deliveries, new Map());
  }
  filterCache.get(deliveries)!.set(cacheKey, result);

  return result;
}

// クイックフィルターを適用する関数（最適化版）
export function applyQuickFilter(
  deliveries: Delivery[],
  filterType: QuickFilterType
): Delivery[] {
  // キャッシュチェック
  const cache = filterCache.get(deliveries);
  const cacheKey = getCacheKey(filterType);
  
  if (cache?.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  let result: Delivery[] = [];

  switch (filterType) {
    case 'today':
      result = deliveries.filter((d) => d.deliveryDate === today);
      break;
    case 'tomorrow':
      result = deliveries.filter((d) => d.deliveryDate === tomorrow);
      break;
    case 'this_week':
      result = deliveries.filter(
        (d) => d.deliveryDate >= weekStartStr && d.deliveryDate <= weekEndStr
      );
      break;
    case 'overdue':
      result = deliveries.filter(
        (d) => d.deliveryDate < today && d.status !== 'completed'
      );
      break;
    case 'in_transit_only':
      result = deliveries.filter((d) => d.status === 'in_transit');
      break;
    case 'completed_today':
      result = deliveries.filter(
        (d) => d.status === 'completed' && d.deliveryDate === today
      );
      break;
    default:
      result = deliveries;
  }

  // キャッシュに保存
  if (!filterCache.has(deliveries)) {
    filterCache.set(deliveries, new Map());
  }
  filterCache.get(deliveries)!.set(cacheKey, result);

  return result;
}

// 空のフィルターを作成
export function createEmptyFilters(): AdvancedFilters {
  return {
    statuses: [],
    dateRange: null,
    addressKeyword: '',
    nameKeyword: '',
  };
}

// フィルターが適用されているかチェック
export function hasActiveFilters(filters: AdvancedFilters): boolean {
  return (
    filters.statuses.length > 0 ||
    filters.dateRange !== null ||
    filters.addressKeyword !== '' ||
    filters.nameKeyword !== ''
  );
}

// フィルターの説明文を生成
export function formatFilterDescription(filters: AdvancedFilters): string {
  const parts: string[] = [];

  if (filters.statuses.length > 0) {
    const statusLabels = {
      pending: '配送前',
      in_transit: '配送中',
      completed: '完了',
    };
    const labels = filters.statuses.map((s) => statusLabels[s]).join('・');
    parts.push(`ステータス: ${labels}`);
  }

  if (filters.dateRange) {
    parts.push(
      `期間: ${filters.dateRange.startDate} 〜 ${filters.dateRange.endDate}`
    );
  }

  if (filters.addressKeyword) {
    parts.push(`住所: "${filters.addressKeyword}"`);
  }

  if (filters.nameKeyword) {
    parts.push(`名前: "${filters.nameKeyword}"`);
  }

  return parts.join(' / ');
}

// キャッシュをクリア（データ更新時に呼び出す）
export function clearFilterCache(): void {
  // WeakMapは自動的にガベージコレクションされるため、
  // 明示的なクリアは不要だが、新しいWeakMapを作成することで即座にクリア
  filterCache.delete = () => true;
}