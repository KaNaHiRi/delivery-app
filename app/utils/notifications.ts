import { Delivery, NotificationSettings } from '../types/delivery';

/**
 * ブラウザが通知APIをサポートしているかチェック
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * 通知許可をリクエスト
 * C#でいう: MessageBox.Show() の許可ダイアログ相当
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('通知許可リクエストエラー:', error);
    return 'denied';
  }
};

/**
 * 通知を送信
 * C#でいう: ToastNotification.Show() 相当
 */
export const sendNotification = (title: string, body: string, tag?: string): void => {
  if (!isNotificationSupported()) {
    console.warn('このブラウザは通知をサポートしていません');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('通知が許可されていません');
    return;
  }

  try {
    const notification = new Notification(title, {
      body: body,
      tag: tag || 'delivery-notification',
      icon: '/favicon.ico', // プロジェクトのファビコンを使用
      requireInteraction: false, // 自動的に消える
    });

    // 通知クリック時にウィンドウをフォーカス
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('通知送信エラー:', error);
  }
};

/**
 * 今日または明日が配送日の「配送前」ステータスの配送を取得
 * C#でいう: LINQ の Where + Any 相当
 */
export const getUpcomingDeliveries = (deliveries: Delivery[]): {
  today: Delivery[];
  tomorrow: Delivery[];
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // C# LINQ: deliveries.Where(d => d.DeliveryDate.Date == today && d.Status == "pending")
  const todayDeliveries = deliveries.filter(d => {
    const deliveryDate = new Date(d.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);
    return deliveryDate.getTime() === today.getTime() && d.status === 'pending';
  });

  // C# LINQ: deliveries.Where(d => d.DeliveryDate.Date == tomorrow && d.Status == "pending")
  const tomorrowDeliveries = deliveries.filter(d => {
    const deliveryDate = new Date(d.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);
    return deliveryDate.getTime() === tomorrow.getTime() && d.status === 'pending';
  });

  return { today: todayDeliveries, tomorrow: tomorrowDeliveries };
};

/**
 * 配送期限アラートを送信
 */
export const sendDeadlineAlert = (deliveries: Delivery[], settings: NotificationSettings): void => {
  if (!settings.enabled || !settings.deadlineAlert) {
    return;
  }

  const { today, tomorrow } = getUpcomingDeliveries(deliveries);

  // 今日の配送アラート
  if (today.length > 0) {
    const names = today.slice(0, 3).map(d => d.name).join('、');
    const more = today.length > 3 ? ` 他${today.length - 3}件` : '';
    sendNotification(
      '配送管理システム - 本日の配送',
      `本日配送予定: ${names}${more}（計${today.length}件）`,
      'deadline-today'
    );
  }

  // 明日の配送アラート
  if (tomorrow.length > 0) {
    const names = tomorrow.slice(0, 3).map(d => d.name).join('、');
    const more = tomorrow.length > 3 ? ` 他${tomorrow.length - 3}件` : '';
    sendNotification(
      '配送管理システム - 明日の配送',
      `明日配送予定: ${names}${more}（計${tomorrow.length}件）`,
      'deadline-tomorrow'
    );
  }
};

/**
 * ステータス変更通知を送信
 */
export const sendStatusChangeNotification = (
  delivery: Delivery,
  oldStatus: Delivery['status'],
  newStatus: Delivery['status'],
  settings: NotificationSettings
): void => {
  if (!settings.enabled || !settings.statusChangeAlert) {
    return;
  }

  const statusNames: Record<Delivery['status'], string> = {
    pending: '配送前',
    in_transit: '配送中',
    completed: '配送完了',
  };

  sendNotification(
    '配送管理システム - ステータス変更',
    `${delivery.name}様への配送: ${statusNames[oldStatus]} → ${statusNames[newStatus]}`,
    `status-change-${delivery.id}`
  );
};

/**
 * LocalStorageから通知設定を読み込み
 * C#でいう: Registry.GetValue() や Settings.Default.Load() 相当
 */
export const loadNotificationSettings = (): NotificationSettings => {
  try {
    const stored = localStorage.getItem('notification_settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('通知設定の読み込みエラー:', error);
  }

  // デフォルト設定
  return {
    enabled: false,
    deadlineAlert: true,
    statusChangeAlert: true,
  };
};

/**
 * LocalStorageに通知設定を保存
 * C#でいう: Registry.SetValue() や Settings.Default.Save() 相当
 */
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  try {
    localStorage.setItem('notification_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('通知設定の保存エラー:', error);
  }
};