// app/components/MasterModal.tsx（完全版）
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Pencil, Trash2, Loader2, Building2 } from 'lucide-react';
import type { MasterType } from '@/app/types/master';
import type { Staff, Customer, Location } from '@/app/types/master';
import { staffApi, customerApi, locationApi } from '@/lib/masterApi';
import { useRole } from '@/app/hooks/useRole';

interface MasterModalProps {
  isOpen: boolean;
  type: MasterType;
  onClose: () => void;
}

// ── Staff フォーム ──────────────────────────────────────────
function StaffForm({ onSave, onCancel, initial }: {
  onSave: (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  initial?: Staff;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSaving(true);
    try {
      await onSave({ name, email, phone: phone || null, department: department || null, isActive });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">名前 *</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">メール *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">電話番号</label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">部署</label>
          <input value={department} onChange={e => setDepartment(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="staff-active" checked={isActive} onChange={e => setIsActive(e.target.checked)}
          className="w-4 h-4" />
        <label htmlFor="staff-active" className="text-sm">有効</label>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
          {saving && <Loader2 size={12} className="animate-spin" />}保存
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
          キャンセル
        </button>
      </div>
    </form>
  );
}

// ── Customer フォーム ───────────────────────────────────────
function CustomerForm({ onSave, onCancel, initial }: {
  onSave: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  initial?: Customer;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    setSaving(true);
    try {
      await onSave({ name, address, phone: phone || null, email: email || null, note: note || null, isActive });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">顧客名 *</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">住所 *</label>
          <input value={address} onChange={e => setAddress(e.target.value)} required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">電話番号</label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">メール</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">備考</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="customer-active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4" />
        <label htmlFor="customer-active" className="text-sm">有効</label>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
          {saving && <Loader2 size={12} className="animate-spin" />}保存
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
          キャンセル
        </button>
      </div>
    </form>
  );
}

// ── Location フォーム（Day 40新規）────────────────────────
function LocationForm({ onSave, onCancel, initial }: {
  onSave: (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  initial?: Location;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    setSaving(true);
    try {
      await onSave({ name, address, phone: phone || null, isActive });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">拠点名 *</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            placeholder="例: 本院、東京分院" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">住所 *</label>
          <input value={address} onChange={e => setAddress(e.target.value)} required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">電話番号</label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="location-active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4" />
        <label htmlFor="location-active" className="text-sm">有効</label>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
          {saving && <Loader2 size={12} className="animate-spin" />}保存
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
          キャンセル
        </button>
      </div>
    </form>
  );
}

// ── メインコンポーネント ───────────────────────────────────
export default function MasterModal({ isOpen, type: initialType, onClose }: MasterModalProps) {
  const { role } = useRole();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState<MasterType>(initialType);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [locationList, setLocationList] = useState<Location[]>([]);   // ← Day 40
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Staff | Customer | Location | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c, l] = await Promise.all([
        staffApi.getAll(),
        customerApi.getAll(),
        locationApi.getAll(),   // ← Day 40
      ]);
      setStaffList(s);
      setCustomerList(c);
      setLocationList(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAll();
      setActiveTab(initialType);
      setShowForm(false);
      setEditingItem(null);
    }
  }, [isOpen, initialType, fetchAll]);

  const handleSaveStaff = async (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      await staffApi.update(editingItem.id, data);
    } else {
      await staffApi.create(data);
    }
    await fetchAll();
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSaveCustomer = async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      await customerApi.update(editingItem.id, data);
    } else {
      await customerApi.create(data);
    }
    await fetchAll();
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSaveLocation = async (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      await locationApi.update(editingItem.id, data);
    } else {
      await locationApi.create(data);
    }
    await fetchAll();
    setShowForm(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('削除しますか？')) return;
    if (activeTab === 'staff') await staffApi.delete(id);
    else if (activeTab === 'customer') await customerApi.delete(id);
    else await locationApi.delete(id);
    await fetchAll();
  };

  if (!isOpen) return null;

  const tabs: { key: MasterType; label: string; icon: string }[] = [
    { key: 'staff', label: '担当者', icon: '👤' },
    { key: 'customer', label: '顧客', icon: '🏢' },
    { key: 'location', label: '拠点', icon: '🏥' },  // ← Day 40
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog" aria-modal="true" aria-labelledby="master-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="master-modal-title" className="text-lg font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5" />マスタ管理
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="閉じる">
            <X size={20} />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setShowForm(false); setEditingItem(null); }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <span className="mr-1">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* 追加ボタン */}
              {isAdmin && !showForm && (
                <button onClick={() => { setEditingItem(null); setShowForm(true); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  <Plus size={14} />新規追加
                </button>
              )}

              {/* フォーム */}
              {showForm && activeTab === 'staff' && (
                <StaffForm
                  initial={editingItem as Staff | undefined}
                  onSave={handleSaveStaff}
                  onCancel={() => { setShowForm(false); setEditingItem(null); }}
                />
              )}
              {showForm && activeTab === 'customer' && (
                <CustomerForm
                  initial={editingItem as Customer | undefined}
                  onSave={handleSaveCustomer}
                  onCancel={() => { setShowForm(false); setEditingItem(null); }}
                />
              )}
              {showForm && activeTab === 'location' && (
                <LocationForm
                  initial={editingItem as Location | undefined}
                  onSave={handleSaveLocation}
                  onCancel={() => { setShowForm(false); setEditingItem(null); }}
                />
              )}

              {/* スタッフリスト */}
              {activeTab === 'staff' && (
                <div className="space-y-2">
                  {staffList.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">担当者がいません</p>}
                  {staffList.map(s => (
                    <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg border ${s.isActive ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-60'}`}>
                      <div>
                        <div className="font-medium text-sm">{s.name} {!s.isActive && <span className="text-xs text-gray-400">(無効)</span>}</div>
                        <div className="text-xs text-gray-500">{s.email}{s.department && ` ・ ${s.department}`}</div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(s); setShowForm(true); }}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" aria-label="編集">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(s.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" aria-label="削除">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 顧客リスト */}
              {activeTab === 'customer' && (
                <div className="space-y-2">
                  {customerList.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">顧客がいません</p>}
                  {customerList.map(c => (
                    <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border ${c.isActive ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-60'}`}>
                      <div>
                        <div className="font-medium text-sm">{c.name} {!c.isActive && <span className="text-xs text-gray-400">(無効)</span>}</div>
                        <div className="text-xs text-gray-500">{c.address}{c.phone && ` ・ ${c.phone}`}</div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(c); setShowForm(true); }}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" aria-label="編集">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" aria-label="削除">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 拠点リスト（Day 40新規） */}
              {activeTab === 'location' && (
                <div className="space-y-2">
                  {locationList.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">拠点がいません。追加してください。</p>}
                  {locationList.map(l => (
                    <div key={l.id} className={`flex items-center justify-between p-3 rounded-lg border ${l.isActive ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-60'}`}>
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{l.name} {!l.isActive && <span className="text-xs text-gray-400">(無効)</span>}</div>
                          <div className="text-xs text-gray-500">{l.address}{l.phone && ` ・ ${l.phone}`}</div>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(l); setShowForm(true); }}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" aria-label="編集">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(l.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" aria-label="削除">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}