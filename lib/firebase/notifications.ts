import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { Notification, NotificationType, User } from '@/types';
import { sendEmail } from '@/lib/services/emailService';

export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: any
): Promise<void> => {
  const notificationData: any = {
    userId,
    type,
    title,
    message,
    isRead: false,
    createdAt: new Date(),
  };
  
  // Ajouter data seulement s'il existe
  if (data) {
    notificationData.data = data;
  }
  
  await addDoc(collection(db, 'notifications'), notificationData);
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Notification[];
    callback(notifications);
  });
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  const snapshot = await getDocs(q);
  
  const updates = snapshot.docs.map((doc) =>
    updateDoc(doc.ref, { isRead: true })
  );
  
  await Promise.all(updates);
};

// ============================================
// FLEXIBLE WALLET NOTIFICATIONS
// ============================================

/**
 * Récupère les informations d'un utilisateur
 */
async function getUserInfo(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }
    const data = userDoc.data();
    return {
      ...data,
      id: userDoc.id,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt)
    } as User;
  } catch (error) {
    console.error('Erreur getUserInfo:', error);
    return null;
  }
}

/**
 * Récupère tous les admins
 */
async function getAllAdmins(): Promise<User[]> {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'admin')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt)
      } as User;
    });
  } catch (error) {
    console.error('Erreur getAllAdmins:', error);
    return [];
  }
}

/**
 * Envoie une notification complète (email + in-app)
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: any,
  channel: 'email' | 'in_app' | 'both' = 'both'
): Promise<void> {
  try {
    // Créer la notification in-app
    const notificationData: any = {
      userId,
      type,
      title,
      message,
      isRead: false,
      channel,
      emailSent: false,
      createdAt: serverTimestamp()
    };
    
    if (data) {
      notificationData.data = data;
    }
    
    await addDoc(collection(db, 'notifications'), notificationData);
    
    // Envoyer l'email si nécessaire
    if (channel === 'email' || channel === 'both') {
      const user = await getUserInfo(userId);
      if (user && user.email) {
        try {
          await sendEmail(
            user.email,
            title,
            'notification',
            { message, ...data }
          );
          
          // Marquer l'email comme envoyé
          notificationData.emailSent = true;
          notificationData.emailSentAt = serverTimestamp();
        } catch (emailError) {
          console.error('Erreur envoi email:', emailError);
          // Ne pas bloquer si l'email échoue
        }
      }
    }
  } catch (error) {
    console.error('Erreur sendNotification:', error);
    throw error;
  }
}

/**
 * Envoie une notification de dépôt demandé (au client)
 */
export async function notifyDepositRequested(
  userId: string,
  amount: number,
  paymentMethodName: string,
  transactionId: string
): Promise<void> {
  await sendNotification(
    userId,
    'deposit_requested',
    'Demande de dépôt envoyée',
    `Votre demande de dépôt de ${amount} FCFA via ${paymentMethodName} a été envoyée. Elle sera traitée par un administrateur.`,
    { transactionId, amount, paymentMethodName },
    'both'
  );
}

/**
 * Envoie une notification de dépôt demandé (aux admins)
 */
export async function notifyAdminsDepositRequested(
  clientId: string,
  clientName: string,
  amount: number,
  paymentMethodName: string,
  transactionId: string
): Promise<void> {
  const admins = await getAllAdmins();
  
  const notifications = admins.map(admin =>
    sendNotification(
      admin.id,
      'deposit_requested',
      'Nouvelle demande de dépôt',
      `${clientName} a demandé un dépôt de ${amount} FCFA via ${paymentMethodName}.`,
      { transactionId, clientId, amount, paymentMethodName },
      'both'
    )
  );
  
  await Promise.all(notifications);
}

/**
 * Envoie une notification de dépôt approuvé
 */
export async function notifyDepositApproved(
  userId: string,
  amount: number,
  paymentMethodName: string,
  transactionId: string
): Promise<void> {
  await sendNotification(
    userId,
    'deposit_approved',
    'Dépôt approuvé',
    `Votre dépôt de ${amount} FCFA via ${paymentMethodName} a été approuvé. Votre portefeuille a été crédité.`,
    { transactionId, amount, paymentMethodName },
    'both'
  );
}

/**
 * Envoie une notification de dépôt rejeté
 */
export async function notifyDepositRejected(
  userId: string,
  amount: number,
  paymentMethodName: string,
  reason: string,
  transactionId: string
): Promise<void> {
  await sendNotification(
    userId,
    'deposit_rejected',
    'Dépôt rejeté',
    `Votre dépôt de ${amount} FCFA via ${paymentMethodName} a été rejeté. Raison: ${reason}`,
    { transactionId, amount, paymentMethodName, reason },
    'both'
  );
}

/**
 * Envoie une notification de retrait demandé (au client)
 */
export async function notifyWithdrawalRequested(
  userId: string,
  amount: number,
  paymentMethodName: string,
  transactionId: string
): Promise<void> {
  await sendNotification(
    userId,
    'withdrawal_requested',
    'Demande de retrait envoyée',
    `Votre demande de retrait de ${amount} FCFA vers ${paymentMethodName} a été envoyée. Elle sera traitée par un administrateur.`,
    { transactionId, amount, paymentMethodName },
    'both'
  );
}

/**
 * Envoie une notification de retrait demandé (aux admins)
 */
export async function notifyAdminsWithdrawalRequested(
  clientId: string,
  clientName: string,
  amount: number,
  paymentMethodName: string,
  transactionId: string
): Promise<void> {
  const admins = await getAllAdmins();
  
  const notifications = admins.map(admin =>
    sendNotification(
      admin.id,
      'withdrawal_requested',
      'Nouvelle demande de retrait',
      `Un client a demandé un retrait de ${amount} FCFA vers ${paymentMethodName}.`,
      { transactionId, clientId, amount, paymentMethodName },
      'both'
    )
  );
  
  await Promise.all(notifications);
}

/**
 * Envoie une notification de retrait approuvé
 */
export async function notifyWithdrawalApproved(
  userId: string,
  amount: number,
  paymentMethodName: string,
  transactionId: string
): Promise<void> {
  await sendNotification(
    userId,
    'withdrawal_approved',
    'Retrait approuvé',
    `Votre retrait de ${amount} FCFA vers ${paymentMethodName} a été approuvé et traité.`,
    { transactionId, amount, paymentMethodName },
    'both'
  );
}

/**
 * Envoie une notification de retrait rejeté
 */
export async function notifyWithdrawalRejected(
  userId: string,
  amount: number,
  paymentMethodName: string,
  reason: string,
  transactionId: string
): Promise<void> {
  await sendNotification(
    userId,
    'withdrawal_rejected',
    'Retrait rejeté',
    `Votre retrait de ${amount} FCFA vers ${paymentMethodName} a été rejeté. Raison: ${reason}`,
    { transactionId, amount, paymentMethodName, reason },
    'both'
  );
}

/**
 * Envoie un rappel pour les transactions en attente (24h+)
 */
export async function sendPendingTransactionReminders(): Promise<void> {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const q = query(
      collection(db, 'transactions'),
      where('status', '==', 'pending'),
      where('paymentMethodId', '!=', null)
    );
    
    const snapshot = await getDocs(q);
    const admins = await getAllAdmins();
    
    const oldTransactions = snapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt);
      return createdAt <= twentyFourHoursAgo;
    });
    
    if (oldTransactions.length === 0) {
      return;
    }
    
    // Envoyer un rappel groupé aux admins
    const notifications = admins.map(admin =>
      sendNotification(
        admin.id,
        'transaction_reminder',
        'Transactions en attente',
        `Il y a ${oldTransactions.length} transaction(s) en attente depuis plus de 24 heures.`,
        { count: oldTransactions.length },
        'email'
      )
    );
    
    await Promise.all(notifications);
  } catch (error) {
    console.error('Erreur sendPendingTransactionReminders:', error);
  }
}

/**
 * Récupère le nombre de notifications non lues
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Erreur getUnreadCount:', error);
    return 0;
  }
}

/**
 * Récupère les notifications d'un utilisateur avec pagination
 */
export async function getUserNotifications(
  userId: string,
  limitCount: number = 50
): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.slice(0, limitCount).map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        emailSentAt: data.emailSentAt?.toDate?.() || undefined
      } as Notification;
    });
  } catch (error) {
    console.error('Erreur getUserNotifications:', error);
    return [];
  }
}
