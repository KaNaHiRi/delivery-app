'use client';

import { useState, useCallback, useMemo } from 'react';
import { X, Mail, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { Delivery } from '@/app/types/delivery';
import { useEmailNotification } from '@/app/hooks/useEmailNotification';

interface EmailNotificationModalProps {
  isOpen: boolean;
  deliveries: Delivery[];
  onClose: () => void;
}

type EmailMode = 'status' | 'deadline';

export default function EmailNotificationModal({
  isOpen,
  deliveries,
  onClose,
}: EmailNotificationModalProps) {
  const [mode, setMode] = useState<EmailMode>('deadline');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');
  const [oldStatus, setOldStatus] = useState<Delivery['status']>('pending');
  const [newStatus, setNewStatus] = useState<Delivery['status']>('in_transit');
  const [sendResult, setSendResult] = useState<'success' | 'error' | null>(null);
  const [isMounted] = useState(true);

  const { sendStatusEmail, sendDeadlineEmail, isSending, lastError } = useEmailNotification();

  // 期限超過・今日の配送（期限アラート対象）
  const overdueDeliveries = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return deliveries.filter(
      d => d.deliveryDate <= today && d.status !== 'completed'
    );
  }, [deliveries]);

  const selectedDelivery = useMemo(
    () => deliveries.find(d => d.id === selectedDeliveryId) ?? null,
    [deliveries, selectedDeliveryId]
  );

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSend = useCallback(async () => {
    if (!isValidEmail(recipientEmail)) return;
    setSendResult(null);

    let ok = false;
    if (mode === 'status' && selectedDelivery) {
      ok = await sendStatusEmail({
        recipientEmail,
        recipientName,
        delivery: selectedDelivery,
        oldStatus,
        newStatus,
      });
    } else if (mode === 'deadline') {
      ok = await sendDeadlineEmail({
        recipientEmail,
        recipientName,
        deliveries: overdueDeliveries,
      });
    }

    setSendResult(ok ? 'success' : 'error');
  }, [
    mode, recipientEmail, recipientName,
    selectedDelivery, oldStatus, newStatus,
    overdueDeliveries, sendStatusEmail, sendDeadlineEmail,
  ]);

  if (!isOpen || !isMounted) return null;

  const canSend =
    isValidEmail(recipientEmail) &&
    !isSending &&
    (mode === 'deadline' ? overdueDeliveries.length > 0 : !!selectedDelivery);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2 id="email-modal-title" className="text-xl font-bold">
              メール通知
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* モード切替 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode('deadline'); setSendResult(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'deadline'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ⚠️ 期限アラート ({overdueDeliveries.length}件)
          </button>
          <button
            onClick={() => { setMode('status'); setSendResult(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            📦 ステータス変更通知
          </button>
        </div>

        <div className="space-y-4">
          {/* 送信先メール */}
          <div>
            <label htmlFor="email-to" className="block text-sm font-medium mb-1">
              送信先メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="email-to"
              type="email"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder="example@clinic.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 宛名 */}
          <div>
            <label htmlFor="email-name" className="block text-sm font-medium mb-1">
              宛名（任意）
            </label>
            <input
              id="email-name"
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="田中 様"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 期限アラートモード */}
          {mode === 'deadline' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                以下の配送が対象です:
              </p>
              {overdueDeliveries.length === 0 ? (
                <p className="text-sm text-gray-500">期限超過・本日期限の配送はありません</p>
              ) : (
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {overdueDeliveries.map(d => (
                    <li key={d.id} className="text-sm text-red-600 dark:text-red-400">
                      • {d.name} ({d.deliveryDate})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ステータス変更モード */}
          {mode === 'status' && (
            <>
              <div>
                <label htmlFor="email-delivery" className="block text-sm font-medium mb-1">
                  対象配送データ <span className="text-red-500">*</span>
                </label>
                <select
                  id="email-delivery"
                  value={selectedDeliveryId}
                  onChange={e => setSelectedDeliveryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">選択してください</option>
                  {deliveries.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.deliveryDate}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="email-old-status" className="block text-sm font-medium mb-1">変更前</label>
                  <select
                    id="email-old-status"
                    value={oldStatus}
                    onChange={e => setOldStatus(e.target.value as Delivery['status'])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="pending">配送待ち</option>
                    <option value="in_transit">配送中</option>
                    <option value="completed">完了</option>
                  </select>
                </div>
                <div className="flex items-end pb-2 text-gray-400">→</div>
                <div className="flex-1">
                  <label htmlFor="email-new-status" className="block text-sm font-medium mb-1">変更後</label>
                  <select
                    id="email-new-status"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as Delivery['status'])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="pending">配送待ち</option>
                    <option value="in_transit">配送中</option>
                    <option value="completed">完了</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* 送信結果 */}
          {sendResult === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800" role="status">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">メールを送信しました！</span>
            </div>
          )}
          {sendResult === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-300">{lastError ?? '送信に失敗しました'}</span>
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="メールを送信"
          >
            {isSending
              ? <><Loader2 className="w-4 h-4 animate-spin" />送信中...</>
              : <><Send className="w-4 h-4" />送信</>
            }
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}