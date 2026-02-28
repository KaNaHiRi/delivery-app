'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, UserCheck, Users } from 'lucide-react';
import type { Staff, Customer, MasterType } from '@/app/types/master';
import { staffApi, customerApi } from '@/lib/masterApi';

interface MasterModalProps {
  isOpen: boolean;
  type: MasterType;
  onClose: () => void;
}

// C#: Tabコントロールで担当者・顧客を切り替えるダイアログに対応
export default function MasterModal({ isOpen, type, onClose }: MasterModalProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<MasterType>(type);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 担当者フォーム
  const [staffForm, setStaffForm] = useState({ name: '', email: '', phone: '', department: '', isActive: true });
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [showStaffForm, setShowStaffForm] = useState(false);

  // 顧客フォーム
  const [customerForm, setCustomerForm] = useState({ name: '', address: '', phone: '', email: '', note: '', isActive: true });
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(type);
      fetchAll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [staff, customers] = await Promise.all([
        staffApi.getAll(),
        customerApi.getAll(),
      ]);
      setStaffList(staff);
      setCustomerList(customers);
    } catch (err) {
      setError(err instanceof Error ? err.message : '取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 担当者 CRUD ──────────────────────────────────────
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaffId) {
        const updated = await staffApi.update(editingStaffId, staffForm);
        setStaffList(prev => prev.map(s => s.id === editingStaffId ? updated : s));
      } else {
        const created = await staffApi.create(staffForm);
        setStaffList(prev => [created, ...prev]);
      }
      resetStaffForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作に失敗しました');
    }
  };

  const handleStaffEdit = (staff: Staff) => {
    setEditingStaffId(staff.id);
    setStaffForm({ name: staff.name, email: staff.email, phone: staff.phone ?? '', department: staff.department ?? '', isActive: staff.isActive });
    setShowStaffForm(true);
  };

  const handleStaffDelete = async (id: string) => {
    if (!confirm('この担当者を削除しますか？')) return;
    try {
      await staffApi.delete(id);
      setStaffList(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleStaffToggleActive = async (staff: Staff) => {
    try {
      const updated = await staffApi.update(staff.id, { isActive: !staff.isActive });
      setStaffList(prev => prev.map(s => s.id === staff.id ? updated : s));
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新に失敗しました');
    }
  };

  const resetStaffForm = () => {
    setStaffForm({ name: '', email: '', phone: '', department: '', isActive: true });
    setEditingStaffId(null);
    setShowStaffForm(false);
  };

  // ── 顧客 CRUD ────────────────────────────────────────
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomerId) {
        const updated = await customerApi.update(editingCustomerId, customerForm);
        setCustomerList(prev => prev.map(c => c.id === editingCustomerId ? updated : c));
      } else {
        const created = await customerApi.create(customerForm);
        setCustomerList(prev => [created, ...prev]);
      }
      resetCustomerForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作に失敗しました');
    }
  };

  const handleCustomerEdit = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setCustomerForm({ name: customer.name, address: customer.address, phone: customer.phone ?? '', email: customer.email ?? '', note: customer.note ?? '', isActive: customer.isActive });
    setShowCustomerForm(true);
  };

  const handleCustomerDelete = async (id: string) => {
    if (!confirm('この顧客を削除しますか？')) return;
    try {
      await customerApi.delete(id);
      setCustomerList(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleCustomerToggleActive = async (customer: Customer) => {
    try {
      const updated = await customerApi.update(customer.id, { isActive: !customer.isActive });
      setCustomerList(prev => prev.map(c => c.id === customer.id ? updated : c));
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新に失敗しました');
    }
  };

  const resetCustomerForm = () => {
    setCustomerForm({ name: '', address: '', phone: '', email: '', note: '', isActive: true });
    setEditingCustomerId(null);
    setShowCustomerForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="master-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="master-modal-title" className="text-xl font-bold">マスタ管理</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" aria-label="閉じる">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'staff' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <UserCheck className="w-4 h-4" />担当者
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'customer' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Users className="w-4 h-4" />顧客
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>}
          {isLoading && <div className="text-center py-8 text-gray-500">読み込み中...</div>}

          {/* ── 担当者タブ ─── */}
          {activeTab === 'staff' && !isLoading && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{staffList.length}件の担当者</span>
                <button
                  onClick={() => { resetStaffForm(); setShowStaffForm(true); }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />担当者を追加
                </button>
              </div>

              {showStaffForm && (
                <form onSubmit={handleStaffSubmit} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-sm">{editingStaffId ? '担当者を編集' : '担当者を追加'}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">氏名 *</label>
                      <input type="text" value={staffForm.name} onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">メールアドレス *</label>
                      <input type="email" value={staffForm.email} onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">電話番号</label>
                      <input type="tel" value={staffForm.phone} onChange={e => setStaffForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">部署</label>
                      <input type="text" value={staffForm.department} onChange={e => setStaffForm(f => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">保存</button>
                    <button type="button" onClick={resetStaffForm} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm">キャンセル</button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {staffList.length === 0 && <p className="text-center py-8 text-gray-500 text-sm">担当者が登録されていません</p>}
                {staffList.map(staff => (
                  <div key={staff.id} className={`flex items-center justify-between p-3 rounded-lg border ${staff.isActive ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{staff.name}</span>
                        {!staff.isActive && <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">無効</span>}
                        {staff.department && <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{staff.department}</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{staff.email}{staff.phone && ` / ${staff.phone}`}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStaffToggleActive(staff)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500" title={staff.isActive ? '無効化' : '有効化'}>
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStaffEdit(staff)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-500" aria-label="編集">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleStaffDelete(staff.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500" aria-label="削除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 顧客タブ ─── */}
          {activeTab === 'customer' && !isLoading && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{customerList.length}件の顧客</span>
                <button
                  onClick={() => { resetCustomerForm(); setShowCustomerForm(true); }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />顧客を追加
                </button>
              </div>

              {showCustomerForm && (
                <form onSubmit={handleCustomerSubmit} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-sm">{editingCustomerId ? '顧客を編集' : '顧客を追加'}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">氏名 *</label>
                      <input type="text" value={customerForm.name} onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">電話番号</label>
                      <input type="tel" value={customerForm.phone} onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1">住所 *</label>
                      <input type="text" value={customerForm.address} onChange={e => setCustomerForm(f => ({ ...f, address: e.target.value }))} required className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">メールアドレス</label>
                      <input type="email" value={customerForm.email} onChange={e => setCustomerForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">備考</label>
                      <input type="text" value={customerForm.note} onChange={e => setCustomerForm(f => ({ ...f, note: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">保存</button>
                    <button type="button" onClick={resetCustomerForm} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm">キャンセル</button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {customerList.length === 0 && <p className="text-center py-8 text-gray-500 text-sm">顧客が登録されていません</p>}
                {customerList.map(customer => (
                  <div key={customer.id} className={`flex items-center justify-between p-3 rounded-lg border ${customer.isActive ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{customer.name}</span>
                        {!customer.isActive && <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">無効</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{customer.address}</p>
                      {(customer.phone || customer.email) && <p className="text-xs text-gray-400 dark:text-gray-500">{[customer.phone, customer.email].filter(Boolean).join(' / ')}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleCustomerToggleActive(customer)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500" title={customer.isActive ? '無効化' : '有効化'}>
                        <Users className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleCustomerEdit(customer)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-500" aria-label="編集">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleCustomerDelete(customer.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500" aria-label="削除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}