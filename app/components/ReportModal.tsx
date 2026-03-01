// app/components/ReportModal.tsx
'use client';

import { useState, useMemo, useRef, useId } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { FileText, Download, X, Calendar, Loader2 } from 'lucide-react';
import type { Delivery, ReportConfig, DateRange } from '../types/delivery';
import {
  filterDeliveriesByPeriod,
  calcReportStats,
  getStatusChartData,
  getDailyChartData,
  generateReportTitle,
  getCurrentMonthRange,
  getLastMonthRange,
} from '../utils/reportGenerator';
import { usePdfExport } from '../hooks/usePdfExport';

interface Props {
  isOpen: boolean;
  deliveries: Delivery[];
  onClose: () => void;
}

const PERIOD_PRESETS = [
  { label: '今月', getValue: getCurrentMonthRange },
  { label: '先月', getValue: getLastMonthRange },
] as const;

export default function ReportModal({ isOpen, deliveries, onClose }: Props) {
  const titleId = useId();
  const reportId = 'report-preview-content';
  const { exportToPdf, isExporting } = usePdfExport();

  const [config, setConfig] = useState<ReportConfig>({
    title: '配送レポート',
    period: getCurrentMonthRange(),
    includeStats: true,
    includeChart: true,
    includeDeliveryList: true,
    groupBy: 'status',
  });

  const [showPreview, setShowPreview] = useState(false);

  // フィルタ済みデータ（C#: LINQ Where に相当）
  const filteredDeliveries = useMemo(
    () => filterDeliveriesByPeriod(deliveries, config.period),
    [deliveries, config.period]
  );

  const stats = useMemo(() => calcReportStats(filteredDeliveries), [filteredDeliveries]);
  const statusChartData = useMemo(() => getStatusChartData(filteredDeliveries), [filteredDeliveries]);
  const dailyChartData = useMemo(
    () => getDailyChartData(filteredDeliveries, config.period),
    [filteredDeliveries, config.period]
  );

  const handlePeriodPreset = (getValue: () => DateRange) => {
    setConfig(prev => ({ ...prev, period: getValue() }));
  };

  const handleExport = async () => {
    try {
      setShowPreview(true);
      // DOMレンダリング待ち
      await new Promise(r => setTimeout(r, 300));
      const filename = `${config.title}_${config.period.startDate}_${config.period.endDate}.pdf`;
      await exportToPdf(reportId, filename, { orientation: 'portrait' });
    } catch {
      alert('PDF出力に失敗しました。もう一度お試しください。');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl my-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h2 id={titleId} className="text-xl font-bold">レポート自動生成</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 設定パネル */}
          <section aria-label="レポート設定">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
              レポート設定
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* タイトル */}
              <div>
                <label htmlFor="report-title" className="block text-sm font-medium mb-1">
                  レポートタイトル
                </label>
                <input
                  id="report-title"
                  type="text"
                  value={config.title}
                  onChange={e => setConfig(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* グループ化 */}
              <div>
                <label htmlFor="report-groupby" className="block text-sm font-medium mb-1">
                  グループ化
                </label>
                <select
                  id="report-groupby"
                  value={config.groupBy}
                  onChange={e => setConfig(prev => ({ ...prev, groupBy: e.target.value as ReportConfig['groupBy'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="status">ステータス別</option>
                  <option value="date">日付別</option>
                  <option value="staff">担当者別</option>
                </select>
              </div>

              {/* 期間プリセット */}
              <div>
                <span className="block text-sm font-medium mb-1">期間プリセット</span>
                <div className="flex gap-2">
                  {PERIOD_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => handlePeriodPreset(preset.getValue)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Calendar className="w-3 h-3 inline mr-1" aria-hidden="true" />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 期間指定 */}
              <div>
                <span className="block text-sm font-medium mb-1">期間指定</span>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={config.period.startDate}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      period: { ...prev.period, startDate: e.target.value },
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                    aria-label="開始日"
                  />
                  <span className="text-gray-500 text-sm">〜</span>
                  <input
                    type="date"
                    value={config.period.endDate}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      period: { ...prev.period, endDate: e.target.value },
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500"
                    aria-label="終了日"
                  />
                </div>
              </div>
            </div>

            {/* 含める要素 */}
            <div className="mt-4 flex flex-wrap gap-4">
              {[
                { key: 'includeStats' as const, label: '統計サマリー' },
                { key: 'includeChart' as const, label: 'グラフ' },
                { key: 'includeDeliveryList' as const, label: '配送一覧' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config[item.key]}
                    onChange={e => setConfig(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* 対象件数表示 */}
          <div
            className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
            role="status"
            aria-live="polite"
          >
            <span className="text-blue-700 dark:text-blue-300">
              📊 対象期間の配送データ: <strong>{filteredDeliveries.length}件</strong>
              （{config.period.startDate} 〜 {config.period.endDate}）
            </span>
          </div>

          {/* プレビュー切替 */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(v => !v)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              {showPreview ? 'プレビューを閉じる' : 'プレビューを表示'}
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || filteredDeliveries.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm transition-colors"
              aria-label="PDFをダウンロード"
            >
              {isExporting ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />生成中...</>
              ) : (
                <><Download className="w-4 h-4" aria-hidden="true" />PDF出力</>
              )}
            </button>
          </div>

          {/* レポートプレビュー */}
          {showPreview && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                プレビュー（PDF出力内容）
              </div>
              <ReportPreview
                id={reportId}
                config={config}
                deliveries={filteredDeliveries}
                stats={stats}
                statusChartData={statusChartData}
                dailyChartData={dailyChartData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── レポートプレビュー本体 ────────────────────────────────────────────────────
interface PreviewProps {
  id: string;
  config: ReportConfig;
  deliveries: Delivery[];
  stats: ReturnType<typeof calcReportStats>;
  statusChartData: ReturnType<typeof getStatusChartData>;
  dailyChartData: ReturnType<typeof getDailyChartData>;
}

function ReportPreview({ id, config, deliveries, stats, statusChartData, dailyChartData }: PreviewProps) {
  const generatedAt = new Date().toLocaleString('ja-JP');

  return (
    <div
      id={id}
      className="bg-white p-8 text-gray-900 min-h-[600px]"
      style={{ fontFamily: 'sans-serif' }}
    >
      {/* レポートヘッダー */}
      <div className="border-b-2 border-blue-600 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-600">{generateReportTitle(config)}</h1>
        <p className="text-sm text-gray-500 mt-1">生成日時: {generatedAt}</p>
      </div>

      {/* 統計サマリー */}
      {config.includeStats && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">
            サマリー
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '総配送件数', value: `${stats.total}件`, color: '#3B82F6' },
              { label: '完了件数', value: `${stats.completed}件`, color: '#10B981' },
              { label: '完了率', value: `${stats.completionRate}%`, color: '#8B5CF6' },
              { label: '配送待ち', value: `${stats.pending}件`, color: '#F59E0B' },
              { label: '配送中', value: `${stats.inTransit}件`, color: '#3B82F6' },
              { label: '1日平均', value: `${stats.averagePerDay}件`, color: '#6B7280' },
            ].map(item => (
              <div
                key={item.label}
                className="p-3 rounded-lg border"
                style={{ borderColor: item.color, borderLeftWidth: 4 }}
              >
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className="text-2xl font-bold mt-1" style={{ color: item.color }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* グラフ */}
      {config.includeChart && deliveries.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">
            グラフ
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* ステータス円グラフ */}
            <div>
              <p className="text-sm text-gray-600 mb-2 text-center">ステータス別割合</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 日別棒グラフ（最大14日分） */}
            <div>
              <p className="text-sm text-gray-600 mb-2 text-center">日別配送件数</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyChartData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="合計" fill="#3B82F6" />
                  <Bar dataKey="completed" name="完了" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* 配送一覧 */}
      {config.includeDeliveryList && deliveries.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-l-4 border-blue-500 pl-3">
            配送一覧（{deliveries.length}件）
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {['配送日', '氏名', '住所', 'ステータス'].map(h => (
                  <th key={h} className="px-3 py-2 text-left border border-gray-200 text-xs font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliveries.slice(0, 50).map((d, i) => (
                <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-1.5 border border-gray-200">{d.deliveryDate}</td>
                  <td className="px-3 py-1.5 border border-gray-200">{d.name}</td>
                  <td className="px-3 py-1.5 border border-gray-200 text-xs">{d.address}</td>
                  <td className="px-3 py-1.5 border border-gray-200">
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
              {deliveries.length > 50 && (
                <tr>
                  <td colSpan={4} className="px-3 py-2 text-center text-gray-500 text-xs border border-gray-200">
                    ※ 表示は50件まで。全{deliveries.length}件のデータが対象です。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {deliveries.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          指定期間に配送データがありません
        </div>
      )}

      {/* フッター */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-right">
        配送管理システム — 自動生成レポート
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Delivery['status'] }) {
  const map = {
    pending:    { label: '配送待ち', color: '#F59E0B' },
    in_transit: { label: '配送中',   color: '#3B82F6' },
    completed:  { label: '完了',     color: '#10B981' },
  };
  const { label, color } = map[status];
  return (
    <span
      className="px-2 py-0.5 rounded-full text-white text-xs"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}