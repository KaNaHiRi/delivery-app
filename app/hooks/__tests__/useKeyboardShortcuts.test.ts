import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  const createHandlers = () => ({
    onNew: jest.fn(),
    onFocus: jest.fn(),
    onVirtual: jest.fn(),
    onRefresh: jest.fn(),
    onHelp: jest.fn(),
    onEscape: jest.fn(),
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('N キーで onNew が呼ばれる', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    fireEvent.keyDown(document, { key: 'N' });
    expect(handlers.onNew).toHaveBeenCalledTimes(1);
  });

  it('n キー（小文字）でも onNew が呼ばれる', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    fireEvent.keyDown(document, { key: 'n' });
    expect(handlers.onNew).toHaveBeenCalledTimes(1);
  });

  it('F キーで onFocus が呼ばれる', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    fireEvent.keyDown(document, { key: 'F' });
    expect(handlers.onFocus).toHaveBeenCalledTimes(1);
  });

  it('V キーで onVirtual が呼ばれる', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    fireEvent.keyDown(document, { key: 'V' });
    expect(handlers.onVirtual).toHaveBeenCalledTimes(1);
  });

  it('R キーで onRefresh が呼ばれる', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    fireEvent.keyDown(document, { key: 'R' });
    expect(handlers.onRefresh).toHaveBeenCalledTimes(1);
  });

  it('? キーで onHelp が呼ばれる', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    fireEvent.keyDown(document, { key: '?' });
    expect(handlers.onHelp).toHaveBeenCalledTimes(1);
  });

  it('Escape キーで onEscape が呼ばれる', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handlers.onEscape).toHaveBeenCalledTimes(1);
  });

  it('enabled=false のとき N キーを無視する', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, false));
    fireEvent.keyDown(document, { key: 'N' });
    expect(handlers.onNew).not.toHaveBeenCalled();
  });

  it('Ctrl+N は無視する（ブラウザショートカット優先）', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    fireEvent.keyDown(document, { key: 'N', ctrlKey: true });
    expect(handlers.onNew).not.toHaveBeenCalled();
  });

  it('INPUT要素にフォーカス中は N キーを無視する', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    fireEvent.keyDown(input, { key: 'N' });
    expect(handlers.onNew).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('TEXTAREA要素にフォーカス中は N キーを無視する', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();
    fireEvent.keyDown(textarea, { key: 'N' });
    expect(handlers.onNew).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it('Escape は INPUT 要素内でも onEscape が呼ばれる', () => {
    const handlers = createHandlers();
    renderHook(() => useKeyboardShortcuts(handlers, true));
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(handlers.onEscape).toHaveBeenCalledTimes(1);
    document.body.removeChild(input);
  });

  it('アンマウント後はイベントリスナーが削除される', () => {
    const handlers = createHandlers();
    const { unmount } = renderHook(() => useKeyboardShortcuts(handlers, true));
    unmount();
    fireEvent.keyDown(document, { key: 'N' });
    expect(handlers.onNew).not.toHaveBeenCalled();
  });
});