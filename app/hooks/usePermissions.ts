'use client';

import { useRole } from './useRole';
import { getPermissions, Permissions } from '@/app/utils/permissions';

export function usePermissions(): Permissions & { isLoading: boolean; role: string | undefined } {
  const { role, isLoading } = useRole();
  const permissions = getPermissions(role);
  return { ...permissions, isLoading, role };
}
