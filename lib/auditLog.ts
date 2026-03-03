// lib/auditLog.ts
import { prisma } from '@/lib/prisma';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditEntityType = 'Delivery' | 'Staff' | 'Customer' | 'Location';

interface CreateAuditLogParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  userId?: string | null;
  userName?: string | null;
}

export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
        newValues: params.newValues ? JSON.stringify(params.newValues) : null,
        userId: params.userId ?? null,
        userName: params.userName ?? null,
      },
    });
  } catch (err) {
    // ログ記録失敗は本体処理を止めない
    console.error('[AuditLog] Failed to create audit log:', err);
  }
}