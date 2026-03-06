'use client';

import { useState } from 'react';
import { Info, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';

interface DemoBannerProps {
  isAdmin: boolean;
  onResetDemo: () => Promise<void>;
}

export default function DemoBanner({ isAdmin, onResetDemo }: DemoBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  if (isDismissed) return null;

  const handleReset = async () => {
    if (!confirm('デモデータをリセットしますか？現在のデータはすべて削除されます。')) return;
    setIsResetting(true);
    setResetMessage(null);
    try {
      await onResetDemo();
      setResetMessage('✅ デモデータをリセットしました');
      setTimeout(() => setResetMessage(null), 3000);
    } catch {
      setResetMessage('❌ リセットに失敗しました');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg overflow-hidden">
      {/* メインバー */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">🏥 配送管理システム — デモ環境</p>
            <p className="text-blue-100 text-xs">
              クリニック向け配送管理システムのデモです。自由にお試しください。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(v => !v)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            詳細
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="バナーを閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 展開部分 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/20">
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ログイン情報 */}
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs font-semibold mb-2 text-blue-100">🔑 デモアカウント</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-200">管理者</span>
                  <code className="bg-white/20 px-1.5 py-0.5 rounded">admin@clinic.com / admin123</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">一般ユーザー</span>
                  <code className="bg-white/20 px-1.5 py-0.5 rounded">tanaka@clinic.com / user123</code>
                </div>
              </div>
            </div>

            {/* 主な機能 */}
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs font-semibold mb-2 text-blue-100">✨ 主な機能</p>
              <ul className="text-xs text-blue-100 space-y-1">
                <li>📦 配送CRUD・ステータス管理</li>
                <li>📊 統計ダッシュボード・レポート出力</li>
                <li>👥 担当者・顧客・拠点マスタ</li>
                <li>🔐 ロール別アクセス制御（RBAC）</li>
              </ul>
            </div>
          </div>

          {/* デモリセットボタン（管理者のみ） */}
          {isAdmin && (
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                {isResetting ? 'リセット中...' : 'デモデータをリセット'}
              </button>
              {resetMessage && (
                <span className="text-sm text-blue-100">{resetMessage}</span>
              )}
              <span className="text-xs text-blue-200">※ 現在のデータを削除してサンプルデータを再投入します</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}