import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import KeyboardShortcutHelp from '../KeyboardShortcutHelp';

describe('KeyboardShortcutHelp', () => {
  const defaultProps = {
    isOpen: true,
    isAdmin: true,
    onClose: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('isOpen=true のときモーダルが表示される', () => {
    render(<KeyboardShortcutHelp {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('isOpen=false のときモーダルが表示されない', () => {
    render(<KeyboardShortcutHelp {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('×アイコンボタンをクリックすると onClose が呼ばれる', () => {
    render(<KeyboardShortcutHelp {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: 'ヘルプを閉じる' });
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('下部の「閉じる」ボタンをクリックすると onClose が呼ばれる', () => {
    render(<KeyboardShortcutHelp {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const bottomClose = buttons[buttons.length - 1];
    fireEvent.click(bottomClose);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('オーバーレイをクリックすると onClose が呼ばれる', () => {
    render(<KeyboardShortcutHelp {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('isAdmin=true のとき N キーの説明が表示される', () => {
    render(<KeyboardShortcutHelp {...defaultProps} isAdmin={true} />);
    expect(screen.getByText('N')).toBeInTheDocument();
    expect(screen.getByText('管理者のみ')).toBeInTheDocument();
  });

  it('isAdmin=false のとき N キーの説明が表示されない', () => {
    render(<KeyboardShortcutHelp {...defaultProps} isAdmin={false} />);
    expect(screen.queryByText('管理者のみ')).not.toBeInTheDocument();
  });

  it('共通ショートカット（F, V, R, ?, Escape）が表示される', () => {
    render(<KeyboardShortcutHelp {...defaultProps} />);
    // 実際のHTMLは「Escape」と表示（「Esc」ではない）
    ['F', 'V', 'R', '?', 'Escape'].forEach(key => {
      expect(screen.getByText(key)).toBeInTheDocument();
    });
  });

  it('タイトル「キーボードショートカット」が表示される', () => {
    render(<KeyboardShortcutHelp {...defaultProps} />);
    expect(screen.getByText('キーボードショートカット')).toBeInTheDocument();
  });
});