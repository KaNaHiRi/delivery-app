import { z } from 'zod';

// ─── 配送ステータス ───────────────────────────────────────
export const deliveryStatusSchema = z.enum(['pending', 'in_transit', 'completed'], {
  error: 'ステータスは pending / in_transit / completed のいずれかを選択してください',
});

// ─── 配送データ作成スキーマ ────────────────────────────────
export const createDeliverySchema = z.object({
  name: z
    .string()
    .min(1, '氏名は必須です')
    .max(100, '氏名は100文字以内で入力してください')
    .trim(),

  address: z
    .string()
    .min(1, '住所は必須です')
    .max(200, '住所は200文字以内で入力してください')
    .trim(),

  status: deliveryStatusSchema.optional(),

  deliveryDate: z
    .string()
    .min(1, '配送日は必須です')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '配送日はYYYY-MM-DD形式で入力してください'),

  // ── Day 36〜40 で追加されたリレーションID ──
  staffId:    z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  locationId: z.string().nullable().optional(),
});

// ─── 配送データ更新スキーマ（部分更新）────────────────────
export const updateDeliverySchema = z.object({
  name: z
    .string()
    .min(1, '氏名は必須です')
    .max(100, '氏名は100文字以内で入力してください')
    .trim()
    .optional(),

  address: z
    .string()
    .min(1, '住所は必須です')
    .max(200, '住所は200文字以内で入力してください')
    .trim()
    .optional(),

  status: deliveryStatusSchema.optional(),

  deliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '配送日はYYYY-MM-DD形式で入力してください')
    .optional(),

  // ── Day 36〜40 で追加されたリレーションID ──
  staffId:    z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  locationId: z.string().nullable().optional(),
});

// ─── ID スキーマ ───────────────────────────────────────────
export const deliveryIdSchema = z.string().min(1, 'IDは必須です');

// ─── TypeScript型の自動生成 ────────────────────────────────
export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;

// ─── Zodエラーをフラットなオブジェクトに変換 ──────────────
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const field = issue.path.join('.') || 'root';
    errors[field] = issue.message;
  });
  return errors;
}

// ─── 安全なパース ──────────────────────────────────────────
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: formatZodErrors(result.error) };
}