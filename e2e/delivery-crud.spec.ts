import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/メールアドレス/i).fill('admin@clinic.com');
  await page.getByLabel(/パスワード/i).fill('admin123');
  await page.getByRole('button', { name: /ログイン/i }).click();
  await expect(page).toHaveURL('/', { timeout: 10000 });
  await page.waitForSelector('table', { timeout: 10000 });
}

test.describe('配送データ CRUD（管理者）', () => {
  let testDeliveryName: string;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    testDeliveryName = `E2Eテスト_${Date.now()}`;
  });

  test('新規配送データを登録できる', async ({ page }) => {
    await page.getByRole('button', { name: /新規|追加|登録/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    await page.locator('#delivery-name').fill(testDeliveryName);
    await page.locator('#delivery-address').fill('東京都テスト区テスト1-1');
    await page.locator('#delivery-date').fill('2026-12-31');

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /追加|登録|保存/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // 登録後：検索で絞り込んで確認（ページネーション関係なく見つかる）
    const searchInput = page.getByPlaceholder(/検索/i);
    await searchInput.fill(testDeliveryName);
    await page.waitForTimeout(300);
    await expect(page.getByText(testDeliveryName)).toBeVisible({ timeout: 5000 });
  });

  test('配送データを削除できる', async ({ page }) => {
    // 登録
    await page.getByRole('button', { name: /新規|追加|登録/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await page.locator('#delivery-name').fill(testDeliveryName);
    await page.locator('#delivery-address').fill('削除テスト住所');
    await page.locator('#delivery-date').fill('2026-12-31');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /追加|登録|保存/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // 検索で絞り込み
    const searchInput = page.getByPlaceholder(/検索/i);
    await searchInput.fill(testDeliveryName);
    await page.waitForTimeout(300);
    await expect(page.getByText(testDeliveryName)).toBeVisible({ timeout: 5000 });

    // 削除
    page.on('dialog', d => d.accept());
    const row = page.getByRole('row').filter({ hasText: testDeliveryName });
    await row.getByRole('button', { name: /削除/i }).click();
    await expect(page.getByText(testDeliveryName)).not.toBeVisible({ timeout: 5000 });
  });

  test('ステータスを変更できる', async ({ page }) => {
    // 登録
    await page.getByRole('button', { name: /新規|追加|登録/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await page.locator('#delivery-name').fill(testDeliveryName);
    await page.locator('#delivery-address').fill('ステータステスト');
    await page.locator('#delivery-date').fill('2026-12-31');
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /追加|登録|保存/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // 検索で絞り込み
    const searchInput = page.getByPlaceholder(/検索/i);
    await searchInput.fill(testDeliveryName);
    await page.waitForTimeout(300);
    await expect(page.getByText(testDeliveryName)).toBeVisible({ timeout: 5000 });

    // ステータス変更
    const row = page.getByRole('row').filter({ hasText: testDeliveryName });
    const statusSelect = row.getByRole('combobox');
    await statusSelect.selectOption('in_transit');
    await expect(statusSelect).toHaveValue('in_transit', { timeout: 5000 });
  });
});