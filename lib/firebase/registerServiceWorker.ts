/**
 * Enregistre le Service Worker pour Firebase Cloud Messaging
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Workers ne sont pas supportés');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ Service Worker enregistré:', registration);
    return registration;
  } catch (error) {
    console.error('❌ Erreur enregistrement Service Worker:', error);
    return null;
  }
};

/**
 * Vérifie si le Service Worker est enregistré
 */
export const isServiceWorkerRegistered = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    return !!registration;
  } catch (error) {
    return false;
  }
};
