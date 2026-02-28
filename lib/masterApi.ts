import type { Staff, Customer } from '@/app/types/master';

// C#: HttpClient + JsonSerializer に対応するAPIクライアント

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const staffApi = {
  getAll: () => request<Staff[]>('/api/staff'),
  create: (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Staff>('/api/staff', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Staff>) =>
    request<Staff>(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/api/staff/${id}`, { method: 'DELETE' }),
};

export const customerApi = {
  getAll: () => request<Customer[]>('/api/customers'),
  create: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Customer>) =>
    request<Customer>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/api/customers/${id}`, { method: 'DELETE' }),
};