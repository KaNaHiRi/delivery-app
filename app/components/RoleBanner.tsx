import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface RoleBannerProps {
  role: string | undefined;
}

export default function RoleBanner({ role }: RoleBannerProps) {
  if (role === 'admin') {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm mb-6"
        role="status"
        aria-label="ロール情報"
      >
        <ShieldCheck size={16} className="text-purple-600 dark:text-purple-400" aria-hidden="true" />
        <span className="text-purple-700 dark:text-purple-300 font-medium">
          管理者としてログイン中 — 全ての操作が可能です
        </span>
      </div>
    );
  }
  if (role === 'user') {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm mb-6"
        role="status"
        aria-label="ロール情報"
      >
        <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span className="text-amber-700 dark:text-amber-300">
          一般ユーザーとしてログイン中 —{' '}
          <strong className="ml-1">閲覧・ステータス変更・印刷・エクスポート</strong>
          が可能です。追加・編集・削除は管理者にお問い合わせください。
        </span>
      </div>
    );
  }
  return null;
}