import type { Delivery } from '@/app/types/delivery';

// C# の HttpClient に相当するAPIクライアント
export const deliveryApi = {
  // GET /api/deliveries
  async getAll(): Promise<Delivery[]> {
    const res = await fetch('/api/deliveries', { cache: 'no-store' });
    if (!res.ok) throw new Error('データの取得に失敗しました');
    return res.json();
  },

  // POST /api/deliveries
  async create(data: Omit<Delivery, 'id'>): Promise<Delivery> {
    const res = await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? '作成に失敗しました');
    }
    return res.json();
  },

  // PUT /api/deliveries/[id]
  async update(id: string, data: Partial<Delivery>): Promise<Delivery> {
    const res = await fetch(`/api/deliveries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? '更新に失敗しました');
    }
    return res.json();
  },

  // DELETE /api/deliveries/[id]
  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/deliveries/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? '削除に失敗しました');
    }
  },
};