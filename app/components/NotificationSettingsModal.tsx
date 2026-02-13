'use client';

import { X, Bell, BellOff, AlertCircle } from 'lucide-react';
import { NotificationSettings } from '../types/delivery';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  notificationPermission: NotificationPermission;
  onRequestPermission: () => Promise<void>;
  onTestNotification: () => void;
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  notificationPermission,
  onRequestPermission,
  onTestNotification,
}: NotificationSettingsModalProps) {
  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const isNotificationSupported = 'Notification' in window;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              通知設定
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* ブラウザ通知サポート確認 */}
          {!isNotificationSupported && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  お使いのブラウザは通知機能に対応していません。
                </div>
              </div>
            </div>
          )}

          {/* 通知許可状態 */}
          {isNotificationSupported && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ブラウザの通知許可
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {notificationPermission === 'granted' && '✓ 許可されています'}
                    {notificationPermission === 'denied' && '✗ 拒否されています'}
                    {notificationPermission === 'default' && '未設定です'}
                  </p>
                </div>
                {notificationPermission !== 'granted' && (
                  <button
                    onClick={onRequestPermission}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    許可する
                  </button>
                )}
              </div>

              {notificationPermission === 'denied' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      通知が拒否されています。ブラウザの設定から許可してください。
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

          {/* 通知設定トグル */}
          <div className="space-y-4">
            {/* 通知全体の有効/無効 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.enabled ? (
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    通知を有効にする
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    すべての通知を制御します
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('enabled')}
                disabled={!isNotificationSupported || notificationPermission !== 'granted'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enabled
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${
                  !isNotificationSupported || notificationPermission !== 'granted'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 配送期限アラート */}
            <div className="flex items-center justify-between pl-8">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  配送期限アラート
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  今日・明日の配送予定を通知
                </p>
              </div>
              <button
                onClick={() => handleToggle('deadlineAlert')}
                disabled={!settings.enabled || !isNotificationSupported || notificationPermission !== 'granted'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.deadlineAlert && settings.enabled
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${
                  !settings.enabled || !isNotificationSupported || notificationPermission !== 'granted'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.deadlineAlert && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* ステータス変更通知 */}
            <div className="flex items-center justify-between pl-8">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  ステータス変更通知
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  配送状態の変更を通知
                </p>
              </div>
              <button
                onClick={() => handleToggle('statusChangeAlert')}
                disabled={!settings.enabled || !isNotificationSupported || notificationPermission !== 'granted'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.statusChangeAlert && settings.enabled
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${
                  !settings.enabled || !isNotificationSupported || notificationPermission !== 'granted'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.statusChangeAlert && settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* テスト通知ボタン */}
          {settings.enabled && notificationPermission === 'granted' && (
            <button
              onClick={onTestNotification}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
            >
              テスト通知を送信
            </button>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}