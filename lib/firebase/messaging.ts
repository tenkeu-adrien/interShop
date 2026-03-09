import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

let messaging: Messaging | null = null;

// Initialiser Firebase Messaging (seulement côté client)
export const initializeMessaging = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    if (!messaging) {
      const { app } = require('./config');
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.error('Erreur initialisation messaging:', error);
    return null;
  }
};

/**
 * Demande la permission pour les notifications push
 * et récupère le token FCM
 */
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  try {
    // Vérifier si on est côté client
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Les notifications ne sont pas supportées');
      return null;
    }

    // Vérifier la permission actuelle
    let permission = Notification.permission;
    
    // Si pas encore demandé, demander la permission
    if (permission === 'default') {
      console.log('📢 Demande de permission pour les notifications...');
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      console.log('❌ Permission refusée pour les notifications');
      return null;
    }

    console.log('✅ Permission accordée pour les notifications');

    // Initialiser messaging
    const messagingInstance = initializeMessaging();
    if (!messagingInstance) {
      console.error('Impossible d\'initialiser Firebase Messaging');
      return null;
    }

    // Récupérer le token FCM
    // IMPORTANT: Vous devez ajouter votre VAPID key dans Firebase Console
    // Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
    const token = await getToken(messagingInstance, {
      vapidKey: 'VOTRE_VAPID_KEY_ICI' // À remplacer par votre clé VAPID
    });

    if (token) {
      console.log('🔑 Token FCM obtenu:', token);
      
      // Sauvegarder le token dans Firestore
      await saveTokenToFirestore(userId, token);
      
      return token;
    } else {
      console.log('❌ Impossible d\'obtenir le token FCM');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return null;
  }
};

/**
 * Sauvegarde le token FCM dans Firestore
 */
const saveTokenToFirestore = async (userId: string, token: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const tokens = userData.fcmTokens || [];
      
      // Ajouter le token s'il n'existe pas déjà
      if (!tokens.includes(token)) {
        await updateDoc(userRef, {
          fcmTokens: [...tokens, token],
          notificationsEnabled: true,
          lastTokenUpdate: new Date()
        });
        console.log('✅ Token FCM sauvegardé dans Firestore');
      }
    }
  } catch (error) {
    console.error('Erreur sauvegarde token:', error);
  }
};

/**
 * Supprime le token FCM (lors de la déconnexion)
 */
export const removeTokenFromFirestore = async (userId: string, token: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const tokens = userData.fcmTokens || [];
      
      // Retirer le token
      const updatedTokens = tokens.filter((t: string) => t !== token);
      
      await updateDoc(userRef, {
        fcmTokens: updatedTokens
      });
      console.log('✅ Token FCM supprimé de Firestore');
    }
  } catch (error) {
    console.error('Erreur suppression token:', error);
  }
};

/**
 * Écoute les messages en temps réel (quand l'app est ouverte)
 */
export const onMessageListener = (callback: (payload: any) => void) => {
  const messagingInstance = initializeMessaging();
  if (!messagingInstance) return () => {};

  return onMessage(messagingInstance, (payload) => {
    console.log('📬 Message reçu (app ouverte):', payload);
    callback(payload);
  });
};

/**
 * Vérifie si les notifications sont supportées
 */
export const areNotificationsSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         'Notification' in window && 
         'serviceWorker' in navigator &&
         'PushManager' in window;
};

/**
 * Vérifie le statut de la permission
 */
export const getNotificationPermissionStatus = (): NotificationPermission | null => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }
  return Notification.permission;
};
