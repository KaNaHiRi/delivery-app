export interface Staff {
  id: string; 
  name: string; 
  email: string; 
  phone?: string | null;
  department?: string | null; 
  isActive: boolean; 
  createdAt: string; 
  updatedAt: string;
}

export interface Customer {
  id: string; 
  name: string; 
  address: string; 
  phone?: string | null;
  email?: string | null; 
  note?: string | null; 
  isActive: boolean; 
  createdAt: string; 
  updatedAt: string;
}

// ── Day 40: 拠点マスタ ──
export interface Location {
  id: string; 
  name: string; 
  address: string; 
  phone?: string | null;
  isActive: boolean; 
  createdAt: string; 
  updatedAt: string;
}

export type MasterType = 'staff' | 'customer' | 'location';