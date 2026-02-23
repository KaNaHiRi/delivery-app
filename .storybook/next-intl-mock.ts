const translations: Record<string, Record<string, string>> = {
  common: {
    appTitle: '配送管理システム',
    search: '検索',
    edit: '編集',
    delete: '削除',
    save: '保存',
    cancel: 'キャンセル',
    add: '追加',
    print: '印刷',
    export: 'エクスポート',
    import: 'インポート',
    backupRestore: 'バックアップ/リストア',
    analytics: 'Analytics',
    action: '操作',
    noData: 'データがありません',
    reset: 'リセット',
    filter: 'フィルター',
    presets: 'プリセット',
  },
  delivery: {
    id: 'ID',
    name: '名前',
    address: '住所',
    status: 'ステータス',
    deliveryDate: '配送日',
    addNew: '新規登録',
    editDelivery: '編集',
    deleteConfirm: '削除しますか？',
    bulkDelete: '一括削除',
    bulkDeleteConfirm: '{count}件削除しますか？',
    totalCount: '合計 {count} 件',
  },
  status: {
    pending: '未着手',
    in_transit: '配送中',
    completed: '完了',
  },
  filter: {
    allStatus: '全ステータス',
    today: '今日',
    tomorrow: '明日',
    thisWeek: '今週',
    overdue: '期限切れ',
    inTransitOnly: '配送中のみ',
    completedToday: '今日完了',
  },
};

export function useTranslations(namespace: string) {
  return (key: string, params?: Record<string, unknown>): string => {
    const value = translations[namespace]?.[key] ?? key;
    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(`{${k}}`, String(v)),
        value
      );
    }
    return value;
  };
}