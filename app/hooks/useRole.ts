'use client';

import { useSession } from 'next-auth/react';

export type UserRole = 'admin' | 'user';

export function useRole() {
  const { data: session, status } = useSession();

  const role = (session?.user as any)?.role as UserRole | undefined;
  const isAdmin = role === 'admin';
  const isUser = role === 'user';
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  return {
    role,
    isAdmin,
    isUser,
    isLoading,
    isAuthenticated,
  };
}
