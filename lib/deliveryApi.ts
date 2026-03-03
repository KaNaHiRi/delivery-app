import type { Delivery } from '@/app/types/delivery';

type CreateDeliveryInput = {
  name: string;
  address: string;
  status?: Delivery['status'];
  deliveryDate: string;
  staffId?: string | null;
  customerId?: string | null;
  locationId?: string | null;  // ← Day 40追加
};

type UpdateDeliveryInput = Partial<CreateDeliveryInput> & { status?: Delivery['status'] };

export const deliveryApi = {
  getAll: async (locationId?: string): Promise<Delivery[]> => {
    // ── Day 40: 拠点フィルタークエリパラメータ ──
    const url = locationId
      ? `/api/deliveries?locationId=${encodeURIComponent(locationId)}`
      : '/api/deliveries';
    const res = await fetch(url);
    if (!res.ok) throw new Error('配送データの取得に失敗しました');
    return res.json();
  },

  getById: async (id: string): Promise<Delivery> => {
    const res = await fetch(`/api/deliveries/${id}`);
    if (!res.ok) throw new Error('配送データの取得に失敗しました');
    return res.json();
  },

  create: async (data: CreateDeliveryInput): Promise<Delivery> => {
    const res = await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || '配送データの作成に失敗しました');
    }
    return res.json();
  },

  update: async (id: string, data: UpdateDeliveryInput): Promise<Delivery> => {
    const res = await fetch(`/api/deliveries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || '配送データの更新に失敗しました');
    }
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/deliveries/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('配送データの削除に失敗しました');
  },
};