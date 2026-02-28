import { createDeliverySchema, updateDeliverySchema, safeValidate, formatZodErrors } from '../validation';

describe('createDeliverySchema', () => {
  const validData = {
    name: '田中太郎',
    address: '東京都新宿区1-1-1',
    status: 'pending' as const,
    deliveryDate: '2026-03-01',
  };

  it('正常データを受け入れる', () => {
    const result = safeValidate(createDeliverySchema, validData);
    expect(result.success).toBe(true);
  });

  it('名前が空の場合エラー', () => {
    const result = safeValidate(createDeliverySchema, { ...validData, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.name).toBeDefined();
  });

  it('名前が100文字超の場合エラー', () => {
    const result = safeValidate(createDeliverySchema, { ...validData, name: 'あ'.repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.name).toMatch(/100文字/);
  });

  it('住所が空の場合エラー', () => {
    const result = safeValidate(createDeliverySchema, { ...validData, address: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.address).toBeDefined();
  });

  it('無効なステータスの場合エラー', () => {
    const result = safeValidate(createDeliverySchema, { ...validData, status: 'invalid' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.status).toBeDefined();
  });

  it('日付形式が不正の場合エラー', () => {
    const result = safeValidate(createDeliverySchema, { ...validData, deliveryDate: '2026/03/01' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.deliveryDate).toMatch(/YYYY-MM-DD/);
  });

  it('trim処理される', () => {
    const result = safeValidate(createDeliverySchema, { ...validData, name: '  田中太郎  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('田中太郎');
  });
});

describe('updateDeliverySchema', () => {
  it('空オブジェクトを許可（全フィールドオプショナル）', () => {
    const result = safeValidate(updateDeliverySchema, {});
    expect(result.success).toBe(true);
  });

  it('ステータスのみの更新を許可', () => {
    const result = safeValidate(updateDeliverySchema, { status: 'completed' });
    expect(result.success).toBe(true);
  });
});

describe('formatZodErrors', () => {
  it('Zodエラーをフラットオブジェクトに変換', () => {
    const result = createDeliverySchema.safeParse({ name: '', address: '', status: 'pending', deliveryDate: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      expect(typeof errors).toBe('object');
      expect(errors.name).toBeDefined();
    }
  });
});