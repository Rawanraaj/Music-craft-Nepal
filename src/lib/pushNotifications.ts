import { createPushSubscription } from './api';

// Public VAPID Key (Valid 65-byte uncompressed P-256 EC public key in base64url format)
const VAPID_PUBLIC_KEY = 'BCQ-_4lEkfKwfWeIOicNZRVhkajwvJCCNqboz0RRoWe8IuqVouraHT3vr-6aMvfvGKGSMYn1WywUCHb7wwMGHOI';

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

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export interface PushRegistrationResult {
  success: boolean;
  permission: NotificationPermission | 'unsupported';
  message?: string;
}

export async function registerPushNotifications(userId: string | null): Promise<PushRegistrationResult> {
  if (!isPushSupported()) {
    console.warn('Push messaging is not supported in this browser.');
    return {
      success: false,
      permission: 'unsupported',
      message: 'Push notifications are not supported by your browser.',
    };
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // Request permission (must be triggered by explicit user gesture)
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        permission,
        message: permission === 'denied'
          ? 'Notifications are blocked in your browser settings.'
          : 'Notification permission was not granted.',
      };
    }

    // Subscribe to push notifications
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    };

    const subscription = await registration.pushManager.subscribe(subscribeOptions);

    // Save registration JSON to Supabase
    await createPushSubscription(userId, subscription.toJSON());
    return {
      success: true,
      permission: 'granted',
      message: 'Push notifications successfully enabled!',
    };
  } catch (error: any) {
    console.error('Error subscribing to push notifications:', error);
    return {
      success: false,
      permission: Notification.permission,
      message: error?.message || 'Error enabling push notifications.',
    };
  }
}
