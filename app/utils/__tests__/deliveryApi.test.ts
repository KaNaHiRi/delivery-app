import { deliveryApi } from '@/lib/deliveryApi';
import type { Delivery } from '@/app/types/delivery';

// C#: HttpClient を Mock<HttpMessageHandler> でモックするのと同等
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const sampleDelivery: Delivery = {
  id: 'test-001',
  name: 'テスト太郎',
  address: '東京都新宿区1-1-1',
  status: 'pending',
  deliveryDate: '2025-12-01',
};

describe('deliveryApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── getAll ──────────────────────────────────────────
  describe('getAll', () => {
    it('正常時: Delivery[] を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [sampleDelivery],
      } as Response);

      const result = await deliveryApi.getAll();
      expect(result).toEqual([sampleDelivery]);
      expect(mockFetch).toHaveBeenCalledWith('/api/deliveries', { cache: 'no-store' });
    });

    it('エラー時: Error をスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(deliveryApi.getAll()).rejects.toThrow('データの取得に失敗しました');
    });
  });

  // ── create ──────────────────────────────────────────
  describe('create', () => {
    it('正常時: 作成された Delivery を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sampleDelivery,
      } as Response);

      const input = { name: 'テスト太郎', address: '東京都', status: 'pending' as const, deliveryDate: '2025-12-01' };
      const result = await deliveryApi.create(input);

      expect(result).toEqual(sampleDelivery);
      expect(mockFetch).toHaveBeenCalledWith('/api/deliveries', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }));
    });

    it('エラー時: サーバーのエラーメッセージをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '作成権限がありません' }),
      } as Response);

      await expect(
        deliveryApi.create({ name: '', address: '', status: 'pending', deliveryDate: '' })
      ).rejects.toThrow('作成権限がありません');
    });
  });

  // ── update ──────────────────────────────────────────
  describe('update', () => {
    it('正常時: 更新された Delivery を返す', async () => {
      const updated = { ...sampleDelivery, status: 'completed' as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updated,
      } as Response);

      const result = await deliveryApi.update('test-001', { status: 'completed' });
      expect(result.status).toBe('completed');
      expect(mockFetch).toHaveBeenCalledWith('/api/deliveries/test-001', expect.objectContaining({
        method: 'PUT',
      }));
    });

    it('エラー時: Error をスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '更新に失敗しました' }),
      } as Response);

      await expect(deliveryApi.update('test-001', {})).rejects.toThrow('更新に失敗しました');
    });
  });

  // ── delete ──────────────────────────────────────────
  describe('delete', () => {
    it('正常時: void を返す（エラーなし）', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await expect(deliveryApi.delete('test-001')).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith('/api/deliveries/test-001', { method: 'DELETE' });
    });

    it('エラー時: Error をスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '削除権限がありません' }),
      } as Response);

      await expect(deliveryApi.delete('test-001')).rejects.toThrow('削除権限がありません');
    });
  });
});