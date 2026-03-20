'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const tCommon = useTranslations('common');

  if (!session?.user) return null;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const roleLabel = (session.user as any).role === 'admin'
    ? `👑 ${tCommon('roleAdmin')}`
    : `👤 ${tCommon('roleUser')}`;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
        aria-label="ユーザーメニュー"
        aria-expanded={isOpen}
      >
        <User size={16} />
        <span className="text-sm font-medium">{session.user.name}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session.user.email}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {roleLabel}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-b-lg"
              aria-label="ログアウト"
            >
              <LogOut size={14} />
              {tCommon('logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}