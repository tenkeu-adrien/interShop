// Service Worker pour Firebase Cloud Messaging
// Ce fichier DOIT être à la racine du domaine (public/)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (même que dans votre app)
firebase.initializeApp({
  apiKey: "AIzaSyDPFVSTkhfnewg18vtD6jK9qXf_5XvPfmg",
  authDomain: "interappshop.firebaseapp.com",
  projectId: "interappshop",
  storageBucket: "interappshop.firebasestorage.app",
  messagingSenderId: "745680512693",
  appId: "1:745680512693:web:e9939e06d8cae5820800fc",
  measurementId: "G-MMM5B7GQBK"
});

const messaging = firebase.messaging();

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan:', payload);
  
  const notificationTitle = payload.notification?.title || 'InterAppshop';
  const notificationOptions = {
    body: payload.notification?.body || 'Vous avez une nouvelle notification',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.notificationId || 'default',
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer le clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification cliquée:', event);
  
  event.notification.close();
  
  // Ouvrir l'URL appropriée selon le type de notification
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
