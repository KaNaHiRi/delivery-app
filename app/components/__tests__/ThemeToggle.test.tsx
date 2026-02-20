import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle', () => {
  let setItemSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    // localStorageのsetItemをスパイ
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    setItemSpy.mockRestore();
  });

  test('ボタンが表示されること', async () => {
    render(<ThemeToggle />);
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /ダークモードに切り替え/i });
      expect(button).toBeInTheDocument();
    });
  });

  test('クリックでダークモードに切り替わること', async () => {
    render(<ThemeToggle />);
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /ダークモードに切り替え/i });
      expect(button).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /ダークモードに切り替え/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  test('再度クリックでライトモードに戻ること', async () => {
    render(<ThemeToggle />);
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /ダークモードに切り替え/i });
      expect(button).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /ダークモードに切り替え/i });
    
    // ダークモードに切り替え
    fireEvent.click(button);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    
    // ライトモードに戻す
    const lightButton = screen.getByRole('button', { name: /ライトモードに切り替え/i });
    fireEvent.click(lightButton);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(setItemSpy).toHaveBeenCalledWith('theme', 'light');
    });
  });

  test('初期状態でライトモードであること', async () => {
    render(<ThemeToggle />);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});