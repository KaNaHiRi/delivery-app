'use client';

import dynamic from 'next/dynamic';

// モーダルコンポーネントを遅延ロード
export const CsvExportModal = dynamic(() => import('./CsvExportModal'), {
  loading: () => <div>読み込み中...</div>,
  ssr: false,
});

export const CsvImportModal = dynamic(() => import('./CsvImportModal'), {
  loading: () => <div>読み込み中...</div>,
  ssr: false,
});

export const BackupRestoreModal = dynamic(() => import('./BackupRestoreModal'), {
  loading: () => <div>読み込み中...</div>,
  ssr: false,
});

export const NotificationSettingsModal = dynamic(() => import('./NotificationSettingsModal'), {
  loading: () => <div>読み込み中...</div>,
  ssr: false,
});

export const AnalyticsModal = dynamic(() => import('./AnalyticsModal'), {
  loading: () => <div>読み込み中...</div>,
  ssr: false,
});

export const AdvancedFilterModal = dynamic(() => import('./AdvancedFilterModal'), {
  loading: () => <div>読み込み中...</div>,
  ssr: false,
});

export const FilterPresetsModal = dynamic(() => import('./FilterPresetsModal'), {
  loading: () => <div>読み込み中...</div>,
  ssr: false,
});