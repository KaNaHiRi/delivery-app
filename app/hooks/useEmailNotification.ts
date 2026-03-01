'use client';

import { useCallback, useState } from 'react';
import type { Delivery } from '@/app/types/delivery';

interface SendStatusEmailParams {
  recipientEmail: string;
  recipientName?: string;
  delivery: Delivery;
  oldStatus: string;
  newStatus: string;
}

interface SendDeadlineEmailParams {
  recipientEmail: string;
  recipientName?: string;
  deliveries: Delivery[];
}

export function useEmailNotification() {
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const sendStatusEmail = useCallback(async (params: SendStatusEmailParams): Promise<boolean> => {
    setIsSending(true);
    setLastError(null);
    try {
      const res = await fetch('/api/email/send-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: params.recipientEmail,
          recipientName: params.recipientName,
          deliveryName: params.delivery.name,
          deliveryAddress: params.delivery.address,
          deliveryDate: params.delivery.deliveryDate,
          oldStatus: params.oldStatus,
          newStatus: params.newStatus,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Send failed');
      }
      return true;
    } catch (err) {
      setLastError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendDeadlineEmail = useCallback(async (params: SendDeadlineEmailParams): Promise<boolean> => {
    setIsSending(true);
    setLastError(null);
    try {
      const res = await fetch('/api/email/send-deadline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: params.recipientEmail,
          recipientName: params.recipientName,
          deliveries: params.deliveries,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Send failed');
      }
      return true;
    } catch (err) {
      setLastError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  return { sendStatusEmail, sendDeadlineEmail, isSending, lastError };
}