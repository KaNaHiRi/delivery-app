// app/components/HistoryModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Clock, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditLog {
  id:         string;
  action:     'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId:   string;
  entityName: string;
  oldValues:  string | null;
  newValues:  string | null;
  userId:     string | null;
  userName:   string | null;
  createdAt:  string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACTION_CONFIG = {
  CREATE: { label: '作成',   icon: Plus,   color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  UPDATE: { label: '更新',   icon: Pencil, color: 'bg-blue-100  text-blue-800  dark:bg-blue-900  dark:text-blue-200'  },
  DELETE: { label: '削除',   icon: Trash2, color: 'bg-red-100   text-red-800   dark:bg-red-900   dark:text-red-200'   },
} as const;

const STATUS_LABELS: Record<string, string> = {
  pending:    '配送待ち',
  in_transit: '配送中',
  completed:  '完了',
};

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '（なし）';
  if (key === 'status') return STATUS_LABELS[String(value)] ?? String(value);
  return String(value);
}

function DiffView({ oldValues, newValues }: { oldValues: string | null; newValues: string | null }) {
  const old_ = oldValues ? (JSON.parse(oldValues) as Record<string, unknown>) : null;
  const new_ = newValues ? (JSON.parse(newValues) as Record<string, unknown>) : null;

  const keys = Array.from(new Set([
    ...Object.keys(old_ ?? {}),
    ...Object.keys(new_ ?? {}),
  ]));

  const fieldLabels: Record<string, string> = {
    name:         '氏名',
    address:      '住所',
    status:       'ステータス',
    deliveryDate: '配送日',
    staffId:      '担当者ID',
    customerId:   '顧客ID',
    locationId:   '拠点ID',
  };

  if (keys.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {keys.map(key => (
        <div key={key} className="text-xs grid grid-cols-3 gap-2 items-center">
          <span className="text-gray-500 dark:text-gray-400 font-medium truncate">
            {fieldLabels[key] ?? key}
          </span>
          {old_ && (
            <span className="line-through text-red-600 dark:text-red-400 truncate">
              {formatValue(key, old_[key])}
            </span>
          )}
          {new_ && (
            <span className="text-green-700 dark:text-green-400 font-medium truncate">
              {formatValue(key, new_[key])}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function LogItem({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const config = ACTION_CONFIG[log.action];
  const Icon   = config.icon;
  const hasDiff = log.oldValues || log.newValues;

  const date = new Date(log.createdAt).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${config.color}`}>
            <Icon size={10} />
            {config.label}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {log.entityName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {log.userName ?? log.userId ?? '不明なユーザー'} &middot; {date}
            </p>
          </div>
        </div>
        {hasDiff && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={expanded ? '詳細を閉じる' : '詳細を表示'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {expanded && hasDiff && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {log.action === 'UPDATE' && (
            <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-3 gap-2 mb-1 font-medium">
              <span>項目</span>
              <span>変更前</span>
              <span>変更後</span>
            </div>
          )}
          {log.action === 'CREATE' && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">登録内容</div>
          )}
          {log.action === 'DELETE' && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">削除時の値</div>
          )}
          <DiffView
            oldValues={log.action === 'UPDATE' ? log.oldValues : log.action === 'DELETE' ? log.oldValues : null}
            newValues={log.action === 'UPDATE' ? log.newValues : log.action === 'CREATE' ? log.newValues : null}
          />
        </div>
      )}
    </div>
  );
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [logs,      setLogs]      = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter,    setFilter]    = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE'>('ALL');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audit-logs?limit=200');
      if (!res.ok) throw new Error('取得失敗');
      const data = await res.json() as AuditLog[];
      setLogs(data);
    } catch {
      // サイレントエラー
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchLogs();
  }, [isOpen, fetchLogs]);

  if (!isOpen) return null;

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action === filter);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 id="history-modal-title" className="text-lg font-bold">操作履歴</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">({filtered.length}件)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        {/* フィルター */}
        <div className="flex gap-2 px-6 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          {(['ALL', 'CREATE', 'UPDATE', 'DELETE'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'ALL' ? 'すべて' :
               f === 'CREATE' ? '作成' :
               f === 'UPDATE' ? '更新' : '削除'}
            </button>
          ))}
          <button
            onClick={fetchLogs}
            className="ml-auto px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            再読込
          </button>
        </div>

        {/* ログ一覧 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8 text-gray-500">読み込み中...</div>
          ) : filtered.length === 0 ? (
            <div className="flex justify-center py-8 text-gray-500">履歴がありません</div>
          ) : (
            filtered.map(log => <LogItem key={log.id} log={log} />)
          )}
        </div>
      </div>
    </div>
  );
}