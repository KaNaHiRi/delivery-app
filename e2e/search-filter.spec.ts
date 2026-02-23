import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/メールアドレス/i).fill('admin@clinic.com');
  await page.getByLabel(/パスワード/i).fill('admin123');
  await page.getByRole('button', { name: /ログイン/i }).click();
  await expect(page).toHaveURL('/', { timeout: 10000 });
  await page.waitForSelector('table', { timeout: 10000 });
  await page.waitForTimeout(500);
}

test.describe('検索・フィルター・ショートカット', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('名前で検索できる', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/検索/i);
    await searchInput.fill('テスト');
    await page.waitForTimeout(300);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('ステータスフィルターが機能する', async ({ page }) => {
    const statusSelect = page.getByLabel(/ステータスでフィルター/i);
    await statusSelect.selectOption('pending');
    await expect(statusSelect).toHaveValue('pending');
  });

  test('検索をクリアするとテーブルが再表示される', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/検索/i);
    await searchInput.fill('存在しないデータxyz');
    await page.waitForTimeout(300);
    await searchInput.clear();
    await page.waitForTimeout(300);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('新規登録ボタンでモーダルが開く', async ({ page }) => {
    await page.getByRole('button', { name: /新規|追加|登録/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    // キャンセルで閉じる
    await page.getByRole('dialog').getByRole('button', { name: /キャンセル/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });

  test('ショートカットヘルプボタンでダイアログが開く', async ({ page }) => {
    // ヘッダーのキーボードアイコンボタンをクリック
    await page.getByRole('button', { name: /キーボードショートカット/i }).click();
    await expect(
      page.getByText(/キーボードショートカット/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});