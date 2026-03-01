import type { WidgetConfig, DashboardLayout } from '../types/delivery';

// ── C#: static readonly Dictionary に対応 ──
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'stats_total',      label: '総配送件数',       enabled: true,  order: 0, color: 'blue',   icon: '📦' },
  { id: 'stats_pending',    label: '配送待ち',         enabled: true,  order: 1, color: 'yellow', icon: '⏳' },
  { id: 'stats_in_transit', label: '配送中',           enabled: true,  order: 2, color: 'orange', icon: '🚚' },
  { id: 'stats_completed',  label: '完了',             enabled: true,  order: 3, color: 'green',  icon: '✅' },
  { id: 'stats_today',      label: '本日の配送',       enabled: true,  order: 4, color: 'purple', icon: '📅' },
  { id: 'stats_overdue',    label: '期限超過',         enabled: true,  order: 5, color: 'red',    icon: '⚠️' },
];

export const DEFAULT_LAYOUT: DashboardLayout = 'grid-3';

const STORAGE_KEY_WIDGETS = 'dashboard_widgets';
const STORAGE_KEY_LAYOUT  = 'dashboard_layout';

// ── C#: Settings.Default.Load() に対応 ──
export function loadDashboardConfig(): { widgets: WidgetConfig[]; layout: DashboardLayout } {
  try {
    const savedWidgets = localStorage.getItem(STORAGE_KEY_WIDGETS);
    const savedLayout  = localStorage.getItem(STORAGE_KEY_LAYOUT);

    let widgets = DEFAULT_WIDGETS;
    if (savedWidgets) {
      const parsed: WidgetConfig[] = JSON.parse(savedWidgets);
      // 新しいウィジェットがデフォルトに追加された場合にマージ
      const existingIds = new Set(parsed.map(w => w.id));
      const newDefaults = DEFAULT_WIDGETS.filter(w => !existingIds.has(w.id));
      widgets = [...parsed, ...newDefaults];
    }

    const layout: DashboardLayout =
      savedLayout === 'grid-2' || savedLayout === 'grid-3' || savedLayout === 'grid-4'
        ? savedLayout
        : DEFAULT_LAYOUT;

    return { widgets, layout };
  } catch {
    return { widgets: DEFAULT_WIDGETS, layout: DEFAULT_LAYOUT };
  }
}

// ── C#: Settings.Default.Save() に対応 ──
export function saveDashboardConfig(widgets: WidgetConfig[], layout: DashboardLayout): void {
  try {
    localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(widgets));
    localStorage.setItem(STORAGE_KEY_LAYOUT, layout);
  } catch {
    // localStorage 使用不可環境では無視
  }
}