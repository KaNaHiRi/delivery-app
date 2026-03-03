import type { Staff, Customer, Location } from '@/app/types/master';

// ── Staff API ──────────────────────────────────────────────
export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    const res = await fetch('/api/staff');
    if (!res.ok) throw new Error('スタッフ一覧の取得に失敗しました');
    return res.json();
  },
  create: async (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<Staff> => {
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('スタッフの作成に失敗しました');
    return res.json();
  },
  update: async (id: string, data: Partial<Staff>): Promise<Staff> => {
    const res = await fetch(`/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('スタッフの更新に失敗しました');
    return res.json();
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('スタッフの削除に失敗しました');
  },
};

// ── Customer API ───────────────────────────────────────────
export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('顧客一覧の取得に失敗しました');
    return res.json();
  },
  create: async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('顧客の作成に失敗しました');
    return res.json();
  },
  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('顧客の更新に失敗しました');
    return res.json();
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('顧客の削除に失敗しました');
  },
};

// ── Location API（Day 40追加）──────────────────────────────
export const locationApi = {
  getAll: async (): Promise<Location[]> => {
    const res = await fetch('/api/locations');
    if (!res.ok) throw new Error('拠点一覧の取得に失敗しました');
    return res.json();
  },
  create: async (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> => {
    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('拠点の作成に失敗しました');
    return res.json();
  },
  update: async (id: string, data: Partial<Location>): Promise<Location> => {
    const res = await fetch(`/api/locations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('拠点の更新に失敗しました');
    return res.json();
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('拠点の削除に失敗しました');
  },
};