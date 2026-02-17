import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { getWallet } from './wallet';
import { getPaymentMethod } from './paymentMethods';
import {
  notifyDepositRequested,
  notifyAdminsDepositRequested,
  notifyDepositApproved,
  notifyDepositRejected,
  notifyWithdrawalRequested,
  notifyAdminsWithdrawalRequested,
  notifyWithdrawalApproved,
  notifyWithdrawalRejected
} from './notifications';
import type {
  FlexibleTransaction,
  FlexibleDepositData,
  FlexibleWithdrawalData,
  TransactionFiltersExtended
} from '@/types';

const TRANSACTIONS_COLLECTION = 'transactions';

/**
 * Génère une référence unique pour une transaction
 */
function generateReference(type: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${type}-${year}${month}${day}-${random}`;
}

/**
 * Initie un dépôt flexible
 */
export async function initiateFlexibleDeposit(
  userId: string,
  data: FlexibleDepositData
): Promise<FlexibleTransaction> {
  try {
    const { paymentMethodId, clientName, amount } = data;
    
    // Validation
    if (!clientName || clientName.trim() === '') {
      throw new Error('Le nom du client est obligatoire');
    }
    
    if (amount <= 0) {
      throw new Error('Le montant doit être positif');
    }
    
    // Récupérer la méthode de paiement
    const paymentMethod = await getPaymentMethod(paymentMethodId);
    
    if (!paymentMethod.isActive) {
      throw new Error('Cette méthode de paiement n\'est plus disponible');
    }
    
    // Créer la transaction
    const transactionData: Partial<FlexibleTransaction> = {
      walletId: userId,
      userId,
      type: 'deposit',
      amount,
      fees: 0,
      totalAmount: amount,
      currency: 'XAF',
      status: 'pending',
      paymentMethodId,
      paymentMethodName: paymentMethod.name,
      paymentMethodType: paymentMethod.type,
      clientName: clientName.trim(),
      reference: generateReference('FLEX-DEP'),
      description: `Dépôt flexible via ${paymentMethod.name}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      ...transactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const transaction: FlexibleTransaction = {
      ...transactionData,
      id: docRef.id
    } as FlexibleTransaction;
    
    // Envoyer les notifications
    try {
      await notifyDepositRequested(
        userId,
        amount,
        paymentMethod.name,
        docRef.id
      );
      
      await notifyAdminsDepositRequested(
        userId,
        clientName.trim(),
        amount,
        paymentMethod.name,
        docRef.id
      );
    } catch (notifError) {
      console.error('Erreur envoi notifications:', notifError);
      // Ne pas bloquer si les notifications échouent
    }
    
    return transaction;
  } catch (error) {
    console.error('Erreur initiateFlexibleDeposit:', error);
    throw error;
  }
}

/**
 * Initie un retrait flexible
 */
export async function initiateFlexibleWithdrawal(
  userId: string,
  data: FlexibleWithdrawalData
): Promise<FlexibleTransaction> {
  try {
    const { paymentMethodId, amount, accountDetails } = data;
    
    // Validation
    if (amount <= 0) {
      throw new Error('Le montant doit être positif');
    }
    
    if (!accountDetails || accountDetails.trim() === '') {
      throw new Error('Les détails du compte sont obligatoires');
    }
    
    // Récupérer la méthode de paiement
    const paymentMethod = await getPaymentMethod(paymentMethodId);
    
    if (!paymentMethod.isActive) {
      throw new Error('Cette méthode de paiement n\'est plus disponible');
    }
    
    // Vérifier le solde
    const wallet = await getWallet(userId);
    if (wallet.balance < amount) {
      throw new Error('Solde insuffisant pour effectuer ce retrait');
    }
    
    // Créer la transaction
    const transactionData: Partial<FlexibleTransaction> = {
      walletId: userId,
      userId,
      type: 'withdrawal',
      amount,
      fees: 0,
      totalAmount: amount,
      currency: 'XAF',
      status: 'pending',
      paymentMethodId,
      paymentMethodName: paymentMethod.name,
      paymentMethodType: paymentMethod.type,
      clientAccountDetails: accountDetails.trim(),
      reference: generateReference('FLEX-WTH'),
      description: `Retrait flexible vers ${paymentMethod.name}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      ...transactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const transaction: FlexibleTransaction = {
      ...transactionData,
      id: docRef.id
    } as FlexibleTransaction;
    
    // Envoyer les notifications
    try {
      await notifyWithdrawalRequested(
        userId,
        amount,
        paymentMethod.name,
        docRef.id
      );
      
      // Récupérer le nom du client pour la notification admin
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userName = userDoc.exists() ? userDoc.data().displayName || 'Client' : 'Client';
      
      await notifyAdminsWithdrawalRequested(
        userId,
        userName,
        amount,
        paymentMethod.name,
        docRef.id
      );
    } catch (notifError) {
      console.error('Erreur envoi notifications:', notifError);
      // Ne pas bloquer si les notifications échouent
    }
    
    return transaction;
  } catch (error) {
    console.error('Erreur initiateFlexibleWithdrawal:', error);
    throw error;
  }
}

/**
 * Valide un dépôt flexible (Admin)
 */
export async function validateFlexibleDeposit(
  transactionId: string,
  adminId: string,
  notes?: string
): Promise<void> {
  try {
    return await runTransaction(db, async (transaction) => {
      // Lire la transaction
      const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
      const transactionDoc = await transaction.get(transactionRef);
      
      if (!transactionDoc.exists()) {
        throw new Error('Transaction non trouvée');
      }
      
      const transactionData = transactionDoc.data();
      
      if (transactionData.status !== 'pending') {
        throw new Error('Transaction déjà traitée');
      }
      
      if (transactionData.type !== 'deposit') {
        throw new Error('Cette transaction n\'est pas un dépôt');
      }
      
      // Lire le portefeuille
      const walletRef = doc(db, 'wallets', transactionData.userId);
      const walletDoc = await transaction.get(walletRef);
      
      if (!walletDoc.exists()) {
        throw new Error('Portefeuille non trouvé');
      }
      
      const wallet = walletDoc.data();
      
      // Mettre à jour la transaction
      transaction.update(transactionRef, {
        status: 'completed',
        validatedBy: adminId,
        validatedAt: serverTimestamp(),
        adminNotes: notes || '',
        updatedAt: serverTimestamp()
      });
      
      // Créditer le portefeuille
      transaction.update(walletRef, {
        balance: wallet.balance + transactionData.amount,
        updatedAt: serverTimestamp()
      });
    });
    
    // Envoyer la notification d'approbation
    try {
      const transactionDoc = await getDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId));
      if (transactionDoc.exists()) {
        const data = transactionDoc.data();
        await notifyDepositApproved(
          data.userId,
          data.amount,
          data.paymentMethodName || 'Méthode de paiement',
          transactionId
        );
      }
    } catch (notifError) {
      console.error('Erreur envoi notification:', notifError);
    }
  } catch (error) {
    console.error('Erreur validateFlexibleDeposit:', error);
    throw error;
  }
}

/**
 * Rejette un dépôt flexible (Admin)
 */
export async function rejectFlexibleDeposit(
  transactionId: string,
  adminId: string,
  reason: string
): Promise<void> {
  try {
    if (!reason || reason.trim() === '') {
      throw new Error('La raison du rejet est obligatoire');
    }
    
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction non trouvée');
    }
    
    const transactionData = transactionDoc.data();
    
    if (transactionData.status !== 'pending') {
      throw new Error('Transaction déjà traitée');
    }
    
    await updateDoc(transactionRef, {
      status: 'failed',
      rejectionReason: reason.trim(),
      validatedBy: adminId,
      validatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Envoyer la notification de rejet
    try {
      await notifyDepositRejected(
        transactionData.userId,
        transactionData.amount,
        transactionData.paymentMethodName || 'Méthode de paiement',
        reason.trim(),
        transactionId
      );
    } catch (notifError) {
      console.error('Erreur envoi notification:', notifError);
    }
  } catch (error) {
    console.error('Erreur rejectFlexibleDeposit:', error);
    throw error;
  }
}

/**
 * Valide un retrait flexible (Admin)
 */
export async function validateFlexibleWithdrawal(
  transactionId: string,
  adminId: string,
  notes?: string
): Promise<void> {
  try {
    return await runTransaction(db, async (transaction) => {
      // Lire la transaction
      const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
      const transactionDoc = await transaction.get(transactionRef);
      
      if (!transactionDoc.exists()) {
        throw new Error('Transaction non trouvée');
      }
      
      const transactionData = transactionDoc.data();
      
      if (transactionData.status !== 'pending') {
        throw new Error('Transaction déjà traitée');
      }
      
      if (transactionData.type !== 'withdrawal') {
        throw new Error('Cette transaction n\'est pas un retrait');
      }
      
      // Lire le portefeuille
      const walletRef = doc(db, 'wallets', transactionData.userId);
      const walletDoc = await transaction.get(walletRef);
      
      if (!walletDoc.exists()) {
        throw new Error('Portefeuille non trouvé');
      }
      
      const wallet = walletDoc.data();
      
      // Vérifier le solde
      if (wallet.balance < transactionData.amount) {
        throw new Error('Solde insuffisant');
      }
      
      // Mettre à jour la transaction
      transaction.update(transactionRef, {
        status: 'completed',
        validatedBy: adminId,
        validatedAt: serverTimestamp(),
        adminNotes: notes || '',
        updatedAt: serverTimestamp()
      });
      
      // Débiter le portefeuille
      transaction.update(walletRef, {
        balance: wallet.balance - transactionData.amount,
        updatedAt: serverTimestamp()
      });
    });
    
    // Envoyer la notification d'approbation
    try {
      const transactionDoc = await getDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId));
      if (transactionDoc.exists()) {
        const data = transactionDoc.data();
        await notifyWithdrawalApproved(
          data.userId,
          data.amount,
          data.paymentMethodName || 'Méthode de paiement',
          transactionId
        );
      }
    } catch (notifError) {
      console.error('Erreur envoi notification:', notifError);
    }
  } catch (error) {
    console.error('Erreur validateFlexibleWithdrawal:', error);
    throw error;
  }
}

/**
 * Rejette un retrait flexible (Admin)
 */
export async function rejectFlexibleWithdrawal(
  transactionId: string,
  adminId: string,
  reason: string
): Promise<void> {
  try {
    if (!reason || reason.trim() === '') {
      throw new Error('La raison du rejet est obligatoire');
    }
    
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction non trouvée');
    }
    
    const transactionData = transactionDoc.data();
    
    if (transactionData.status !== 'pending') {
      throw new Error('Transaction déjà traitée');
    }
    
    await updateDoc(transactionRef, {
      status: 'failed',
      rejectionReason: reason.trim(),
      validatedBy: adminId,
      validatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Envoyer la notification de rejet
    try {
      await notifyWithdrawalRejected(
        transactionData.userId,
        transactionData.amount,
        transactionData.paymentMethodName || 'Méthode de paiement',
        reason.trim(),
        transactionId
      );
    } catch (notifError) {
      console.error('Erreur envoi notification:', notifError);
    }
  } catch (error) {
    console.error('Erreur rejectFlexibleWithdrawal:', error);
    throw error;
  }
}

/**
 * Récupère les transactions en attente
 */
export async function getPendingFlexibleTransactions(
  type?: 'deposit' | 'withdrawal'
): Promise<FlexibleTransaction[]> {
  try {
    // Requête la plus simple possible - juste le statut
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    
    let transactions = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          validatedAt: data.validatedAt?.toDate?.() || undefined
        } as FlexibleTransaction;
      })
      // Filtrer uniquement les transactions flexibles (qui ont paymentMethodId)
      .filter(t => t.paymentMethodId != null);
    
    // Filtrer par type si spécifié
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    // Trier par date côté client
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return transactions;
  } catch (error) {
    console.error('Erreur getPendingFlexibleTransactions:', error);
    throw error;
  }
}

/**
 * Récupère les transactions avec filtres
 */
export async function getFlexibleTransactionsWithFilters(
  filters: TransactionFiltersExtended
): Promise<FlexibleTransaction[]> {
  try {
    // Requête de base la plus simple
    let q = query(collection(db, TRANSACTIONS_COLLECTION));
    
    // Ajouter UN SEUL filtre where pour éviter les problèmes d'index
    if (filters.userId) {
      q = query(collection(db, TRANSACTIONS_COLLECTION), where('userId', '==', filters.userId));
    } else if (filters.status) {
      q = query(collection(db, TRANSACTIONS_COLLECTION), where('status', '==', filters.status));
    }
    
    const snapshot = await getDocs(q);
    
    let transactions = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          validatedAt: data.validatedAt?.toDate?.() || undefined
        } as FlexibleTransaction;
      })
      // Filtrer uniquement les transactions flexibles
      .filter(t => t.paymentMethodId != null);
    
    // Appliquer tous les autres filtres côté client
    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    
    if (filters.paymentMethodId) {
      transactions = transactions.filter(t => t.paymentMethodId === filters.paymentMethodId);
    }
    
    if (filters.startDate) {
      transactions = transactions.filter(t => t.createdAt >= filters.startDate!);
    }
    
    if (filters.endDate) {
      transactions = transactions.filter(t => t.createdAt <= filters.endDate!);
    }
    
    if (filters.minAmount !== undefined) {
      transactions = transactions.filter(t => t.amount >= filters.minAmount!);
    }
    
    if (filters.maxAmount !== undefined) {
      transactions = transactions.filter(t => t.amount <= filters.maxAmount!);
    }
    
    // Trier par date côté client
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return transactions;
  } catch (error) {
    console.error('Erreur getFlexibleTransactionsWithFilters:', error);
    throw error;
  }
}

/**
 * Récupère une transaction flexible
 */
export async function getFlexibleTransaction(transactionId: string): Promise<FlexibleTransaction> {
  try {
    const transactionDoc = await getDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId));
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction non trouvée');
    }
    
    const data = transactionDoc.data();
    return {
      ...data,
      id: transactionDoc.id,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      validatedAt: data.validatedAt?.toDate?.() || undefined
    } as FlexibleTransaction;
  } catch (error) {
    console.error('Erreur getFlexibleTransaction:', error);
    throw error;
  }
}
