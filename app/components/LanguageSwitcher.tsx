'use client';

import { useTransition } from 'react';
import { Languages } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLocale: string;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      // Cookieに保存してページリロード
      document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label="言語切替 / Language">
      <Languages
        className="w-4 h-4 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
      />
      <button
        onClick={() => handleLocaleChange('ja')}
        disabled={isPending}
        aria-pressed={currentLocale === 'ja'}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          currentLocale === 'ja'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        日本語
      </button>
      <button
        onClick={() => handleLocaleChange('en')}
        disabled={isPending}
        aria-pressed={currentLocale === 'en'}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          currentLocale === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        EN
      </button>
    </div>
  );
}