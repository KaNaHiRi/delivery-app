import { UserRole } from '@/app/hooks/useRole';

export interface Permissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canBulkDelete: boolean;
  canBulkStatusChange: boolean;
  canBulkPrint: boolean;
  canImportCsv: boolean;
  canExportCsv: boolean;
  canBackupRestore: boolean;
  canViewAnalytics: boolean;
  canChangeStatus: boolean;
  canDragAndDrop: boolean;
  canSelectAll: boolean;
}

const ADMIN_PERMISSIONS: Permissions = {
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canBulkDelete: true,
  canBulkStatusChange: true,
  canBulkPrint: true,
  canImportCsv: true,
  canExportCsv: true,
  canBackupRestore: true,
  canViewAnalytics: true,
  canChangeStatus: true,
  canDragAndDrop: true,
  canSelectAll: true,
};

const USER_PERMISSIONS: Permissions = {
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canBulkDelete: false,
  canBulkStatusChange: false,
  canBulkPrint: true,   // 印刷は閲覧系なのでOK
  canImportCsv: false,
  canExportCsv: true,   // エクスポートは閲覧系なのでOK
  canBackupRestore: false,
  canViewAnalytics: true,
  canChangeStatus: true, // ステータス変更はOK
  canDragAndDrop: false,
  canSelectAll: false,
};

const GUEST_PERMISSIONS: Permissions = {
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canBulkDelete: false,
  canBulkStatusChange: false,
  canBulkPrint: false,
  canImportCsv: false,
  canExportCsv: false,
  canBackupRestore: false,
  canViewAnalytics: false,
  canChangeStatus: false,
  canDragAndDrop: false,
  canSelectAll: false,
};

export function getPermissions(role: UserRole | undefined): Permissions {
  if (role === 'admin') return ADMIN_PERMISSIONS;
  if (role === 'user') return USER_PERMISSIONS;
  return GUEST_PERMISSIONS;
}
