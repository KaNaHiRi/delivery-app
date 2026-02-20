'use client';

import { useServiceWorker } from '../hooks/useServiceWorker';
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  const { isUpdateAvailable, update } = useServiceWorker();

  // 更新が利用可能な場合の通知
  useEffect(() => {
    if (isUpdateAvailable) {
      const shouldUpdate = window.confirm(
        'アプリの新しいバージョンが利用可能です。今すぐ更新しますか？'
      );
      if (shouldUpdate) {
        update();
      }
    }
  }, [isUpdateAvailable, update]);

  return null;
}