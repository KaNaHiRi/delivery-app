import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onNew: () => void;       // N
  onFocus: () => void;     // F
  onVirtual: () => void;   // V
  onRefresh: () => void;   // R
  onHelp: () => void;      // ?
  onEscape: () => void;    // Escape
}

/**
 * キーボードショートカット管理フック
 *
 * C# WPF との対応:
 *   WPF: KeyBinding + RoutedCommand
 *   React: document.addEventListener('keydown') で一元管理
 *
 * テキスト入力中（input/textarea/select）は無効化
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // テキスト入力中はショートカット無効
    // C#: TextBox.IsFocused チェックに相当
    const target = e.target as HTMLElement;
    const isTyping =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable;

    // Escapeだけは入力中でも動作させる
    if (e.key === 'Escape') {
      handlers.onEscape();
      return;
    }

    if (isTyping) return;

    // Ctrl/Meta/Alt との組み合わせは無視（ブラウザのデフォルト優先）
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.key) {
      case 'n':
      case 'N':
        e.preventDefault();
        handlers.onNew();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        handlers.onFocus();
        break;
      case 'v':
      case 'V':
        e.preventDefault();
        handlers.onVirtual();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        handlers.onRefresh();
        break;
      case '?':
        e.preventDefault();
        handlers.onHelp();
        break;
    }
  }, [enabled, handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}