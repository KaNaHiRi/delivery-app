'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // LocalStorageからテーマを読み込み
    const stored = localStorage.getItem('theme');
    const isDarkMode = stored === 'dark';
    setIsDark(isDarkMode);
    
    // DOMにクラスを適用
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // マウント前はプレースホルダーを表示（ちらつき防止）
  if (!isMounted) {
    return (
      <div className="p-2 rounded-lg">
        <div className="w-5 h-5"></div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
      aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}