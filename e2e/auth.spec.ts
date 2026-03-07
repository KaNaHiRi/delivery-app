import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('未認証ユーザーはログインページにリダイレクトされる', async ({ page }) => {
    await page.goto('/');
    // middlewareがリダイレクトするのを待つ
    await expect(page).toHaveURL(/\/login/);
  });

  test('誤ったパスワードでログイン失敗', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/メールアドレス/i).fill('admin@clinic.com');
    await page.getByLabel(/パスワード/i).fill('wrongpassword');
    await page.getByRole('button', { name: /ログイン/i }).click();
    // エラーメッセージが表示されることを確認
    await expect(page.getByText(/メールアドレスまたはパスワードが正しくありません/i)).toBeVisible({ timeout: 5000 });
  });

  test('管理者でログイン成功 → ダッシュボード表示', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/メールアドレス/i).fill('admin@clinic.com');
    await page.getByLabel(/パスワード/i).fill('admin123');
    await page.getByRole('button', { name: /ログイン/i }).click();
    // ダッシュボードに遷移
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    // h1をroleで取得（改行による不一致を回避）
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/管理者としてログイン中/i)).toBeVisible({ timeout: 15000 });
  });

  test('一般ユーザーでログイン成功 → 権限制限UI表示', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/メールアドレス/i).fill('tanaka@clinic.com');
    await page.getByLabel(/パスワード/i).fill('user123');
    await page.getByRole('button', { name: /ログイン/i }).click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/一般ユーザーとしてログイン中/i)).toBeVisible({ timeout: 15000 });
    // 「新規登録」ボタンが表示されないことを確認
    await expect(page.getByRole('button', { name: /新規配送登録/i })).not.toBeVisible();
  });
});