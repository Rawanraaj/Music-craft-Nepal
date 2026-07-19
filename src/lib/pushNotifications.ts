import { createPushSubscription } from './api';

// Public VAPID Key. In a production environment, this matches the private key on the push server.
const VAPID_PUBLIC_KEY = 'BO3W_6S3y4k6qPzMoc1X7fPpeB-p8V1n_o5N3KzC17u_g_xP9Q_m3X-qTzT3Z1u_oO3N3KzC17u_g_xP9Q';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushNotifications(userId: string | null): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported in this browser.');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    // Subscribe to push notifications
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    };

    const subscription = await registration.pushManager.subscribe(subscribeOptions);

    // Save registration JSON to Supabase
    await createPushSubscription(userId, subscription.toJSON());
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
}
