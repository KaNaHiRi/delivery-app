'use client';

import { useTranslations } from 'next-intl';

// 各名前空間のショートカット
export function useCommonT() {
  return useTranslations('common');
}

export function useDeliveryT() {
  return useTranslations('delivery');
}

export function useStatusT() {
  return useTranslations('status');
}

export function useDashboardT() {
  return useTranslations('dashboard');
}

export function useFilterT() {
  return useTranslations('filter');
}

export function usePwaT() {
  return useTranslations('pwa');
}