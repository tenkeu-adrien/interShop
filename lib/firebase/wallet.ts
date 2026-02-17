import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  runTransaction,
  addDoc
} from 'firebase/firestore';
import { db } from './config';
import bcrypt from 'bcryptjs';
import {
  Wallet,
  Transaction,
  WalletSettings,
  TransactionFilters,
  WalletStatistics,
  DepositData,
  WithdrawalData,
  PaymentData,
  MobileMoneyProvider
} from '@/types';

// ============================================
// GESTION DU PORTEFEUILLE
// ============================================

/**
 * Crée un portefeuille pour un utilisateur
 */
export async function createWallet(userId: string): Promise<Wallet> {
  const walletData: Wallet = {
    id: userId,
    userId,
    balance: 0,
    pendingBalance: 0,
    currency: 'XAF',
    status: 'active',
    pinAttempts: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await setDoc(doc(db, 'wallets', userId), {
    ...walletData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return walletData;
}

/**
 * Récupère le portefeuille d'un utilisateur
 */
export async function getWallet(userId: string): Promise<Wallet> {
  const walletDoc = await getDoc(doc(db, 'wallets', userId));

  if (!walletDoc.exists()) {
    // Créer automatiquement si n'existe pas
    return await createWallet(userId);
  }

  const data = walletDoc.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    lastPinAttempt: data.lastPinAttempt?.toDate()
  } as Wallet;
}

/**
 * Récupère le solde d'un portefeuille
 */
export async function getWalletBalance(userId: string): Promise<number> {
  const wallet = await getWallet(userId);
  return wallet.balance;
}

/**
 * Met à jour le solde d'un portefeuille
 */
export async function updateWalletBalance(
  walletId: string,
  amount: number
): Promise<void> {
  const wallet = await getWallet(walletId);
  const newBalance = wallet.balance + amount;

  if (newBalance < 0) {
    throw new Error('Solde insuffisant');
  }

  await updateDoc(doc(db, 'wallets', walletId), {
    balance: newBalance,
    updatedAt: serverTimestamp()
  });
}


// ============================================
// CODE PIN
// ============================================

/**
 * Définit le code PIN du portefeuille
 */
export async function setPIN(userId: string, pin: string): Promise<void> {
  // Valider le PIN (4-6 chiffres)
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN invalide (4-6 chiffres requis)');
  }

  // Hasher le PIN
  const hashedPIN = await bcrypt.hash(pin, 10);

  // Sauvegarder
  await updateDoc(doc(db, 'wallets', userId), {
    pin: hashedPIN,
    pinAttempts: 0,
    updatedAt: serverTimestamp()
  });
}

/**
 * Vérifie le code PIN
 */
export async function verifyPIN(userId: string, pin: string): Promise<boolean> {
  const wallet = await getWallet(userId);

  if (!wallet.pin) {
    throw new Error('Aucun PIN configuré');
  }

  // Vérifier le nombre de tentatives
  if (wallet.pinAttempts >= 3) {
    const lastAttempt = wallet.lastPinAttempt?.getTime() || 0;
    const now = Date.now();

    // Bloquer pendant 30 minutes après 3 tentatives
    if (now - lastAttempt < 30 * 60 * 1000) {
      const remainingMinutes = Math.ceil((30 * 60 * 1000 - (now - lastAttempt)) / 60000);
      throw new Error(`Trop de tentatives. Réessayez dans ${remainingMinutes} minutes.`);
    }

    // Réinitialiser après 30 minutes
    await updateDoc(doc(db, 'wallets', userId), {
      pinAttempts: 0
    });
  }

  // Vérifier le PIN
  const isValid = await bcrypt.compare(pin, wallet.pin);

  if (!isValid) {
    // Incrémenter les tentatives
    await updateDoc(doc(db, 'wallets', userId), {
      pinAttempts: wallet.pinAttempts + 1,
      lastPinAttempt: serverTimestamp()
    });

    throw new Error('PIN incorrect');
  }

  // Réinitialiser les tentatives en cas de succès
  await updateDoc(doc(db, 'wallets', userId), {
    pinAttempts: 0
  });

  return true;
}

/**
 * Réinitialise le code PIN
 */
export async function resetPIN(userId: string): Promise<void> {
  await updateDoc(doc(db, 'wallets', userId), {
    pin: null,
    pinAttempts: 0,
    lastPinAttempt: null,
    updatedAt: serverTimestamp()
  });
}


// ============================================
// UTILITAIRES
// ============================================

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
 * Récupère les paramètres du portefeuille
 */
export async function getWalletSettings(): Promise<WalletSettings> {
  const settingsDoc = await getDoc(doc(db, 'walletSettings', 'global'));

  if (!settingsDoc.exists()) {
    // Créer les paramètres par défaut
    const defaultSettings: WalletSettings = {
      id: 'global',
      depositFeePercent: 1,
      depositFeeMin: 50,
      depositFeeThreshold: 5000,
      withdrawalFeePercent: 2,
      withdrawalFeeMin: 100,
      withdrawalFeeMax: 1000,
      minDeposit: 500,
      minWithdrawal: 1000,
      maxWithdrawalPerDay: 500000,
      maxWithdrawalPerMonth: 2000000,
      pinRequired: true,
      pinLength: 4,
      maxPinAttempts: 3,
      twoFactorThreshold: 100000,
      lowBalanceThreshold: 1000,
      updatedAt: new Date(),
      updatedBy: 'system'
    };

    await setDoc(doc(db, 'walletSettings', 'global'), {
      ...defaultSettings,
      updatedAt: serverTimestamp()
    });

    return defaultSettings;
  }

  const data = settingsDoc.data();
  return {
    ...data,
    updatedAt: data.updatedAt?.toDate()
  } as WalletSettings;
}

/**
 * Calcule les frais de dépôt
 */
export async function calculateDepositFees(amount: number): Promise<number> {
  const settings = await getWalletSettings();

  // Gratuit si montant > seuil
  if (amount >= settings.depositFeeThreshold) {
    return 0;
  }

  // Sinon % avec minimum
  const fees = amount * (settings.depositFeePercent / 100);
  return Math.max(fees, settings.depositFeeMin);
}

/**
 * Calcule les frais de retrait
 */
export async function calculateWithdrawalFees(amount: number): Promise<number> {
  const settings = await getWalletSettings();

  // % avec min et max
  const fees = amount * (settings.withdrawalFeePercent / 100);
  return Math.min(
    Math.max(fees, settings.withdrawalFeeMin),
    settings.withdrawalFeeMax
  );
}


// ============================================
// DÉPÔT
// ============================================

/**
 * Initie un dépôt
 */
export async function initiateDeposit(
  userId: string,
  data: DepositData
): Promise<Transaction> {
  const { amount, provider, phoneNumber } = data;

  // Valider le montant
  const settings = await getWalletSettings();
  if (amount < settings.minDeposit) {
    throw new Error(`Montant minimum: ${settings.minDeposit} FCFA`);
  }

  // Calculer les frais
  const fees = await calculateDepositFees(amount);
  const totalAmount = amount + fees;

  // Créer la transaction
  const transactionData: Partial<Transaction> = {
    walletId: userId,
    userId,
    type: 'deposit',
    amount,
    fees,
    totalAmount,
    currency: 'XAF',
    status: 'pending',
    mobileMoneyProvider: provider,
    mobileMoneyNumber: phoneNumber,
    reference: generateReference('DEP'),
    description: `Dépôt via ${provider.toUpperCase()} Mobile Money`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const docRef = await addDoc(collection(db, 'transactions'), {
    ...transactionData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return {
    ...transactionData,
    id: docRef.id
  } as Transaction;
}

/**
 * Valide un dépôt (Admin)
 */
export async function validateDeposit(
  transactionId: string,
  adminId: string,
  mobileMoneyTransactionId: string
): Promise<void> {
  return await runTransaction(db, async (transaction) => {
    // Lire la transaction
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await transaction.get(transactionRef);

    if (!transactionDoc.exists()) {
      throw new Error('Transaction non trouvée');
    }

    const transactionData = transactionDoc.data();

    if (transactionData.status !== 'pending') {
      throw new Error('Transaction déjà traitée');
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
      mobileMoneyTransactionId,
      validatedBy: adminId,
      validatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Créditer le portefeuille
    transaction.update(walletRef, {
      balance: wallet.balance + transactionData.amount,
      updatedAt: serverTimestamp()
    });
  });
}

/**
 * Rejette un dépôt (Admin)
 */
export async function rejectDeposit(
  transactionId: string,
  adminId: string,
  reason: string
): Promise<void> {
  await updateDoc(doc(db, 'transactions', transactionId), {
    status: 'failed',
    rejectionReason: reason,
    validatedBy: adminId,
    validatedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}


// ============================================
// RETRAIT
// ============================================

/**
 * Initie un retrait
 */
export async function initiateWithdrawal(
  userId: string,
  data: WithdrawalData
): Promise<Transaction> {
  const { amount, provider, phoneNumber, pin } = data;

  // Vérifier le PIN
  await verifyPIN(userId, pin);

  // Valider le montant
  const settings = await getWalletSettings();
  if (amount < settings.minWithdrawal) {
    throw new Error(`Montant minimum: ${settings.minWithdrawal} FCFA`);
  }

  // Vérifier les limites quotidiennes
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayWithdrawals = await getDocs(
    query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('type', '==', 'withdrawal'),
      where('status', 'in', ['pending', 'processing', 'completed']),
      where('createdAt', '>=', Timestamp.fromDate(today))
    )
  );

  const todayTotal = todayWithdrawals.docs.reduce(
    (sum, doc) => sum + doc.data().amount,
    0
  );

  if (todayTotal + amount > settings.maxWithdrawalPerDay) {
    throw new Error(`Limite quotidienne dépassée: ${settings.maxWithdrawalPerDay} FCFA`);
  }

  // Calculer les frais
  const fees = await calculateWithdrawalFees(amount);
  const totalAmount = amount + fees;

  // Vérifier le solde
  const wallet = await getWallet(userId);
  if (wallet.balance < totalAmount) {
    throw new Error('Solde insuffisant');
  }

  // Créer la transaction et débiter immédiatement
  return await runTransaction(db, async (transaction) => {
    const walletRef = doc(db, 'wallets', userId);
    const walletDoc = await transaction.get(walletRef);

    if (!walletDoc.exists()) {
      throw new Error('Portefeuille non trouvé');
    }

    const wallet = walletDoc.data();

    if (wallet.balance < totalAmount) {
      throw new Error('Solde insuffisant');
    }

    // Créer la transaction
    const transactionData: Partial<Transaction> = {
      walletId: userId,
      userId,
      type: 'withdrawal',
      amount,
      fees,
      totalAmount,
      currency: 'XAF',
      status: 'pending',
      mobileMoneyProvider: provider,
      mobileMoneyNumber: phoneNumber,
      reference: generateReference('WTH'),
      description: `Retrait vers ${provider.toUpperCase()} Mobile Money`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const transactionRef = doc(collection(db, 'transactions'));

    transaction.set(transactionRef, {
      ...transactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Débiter le portefeuille immédiatement
    transaction.update(walletRef, {
      balance: wallet.balance - totalAmount,
      pendingBalance: wallet.pendingBalance + totalAmount,
      updatedAt: serverTimestamp()
    });

    return {
      ...transactionData,
      id: transactionRef.id
    } as Transaction;
  });
}

/**
 * Valide un retrait (Admin)
 */
export async function validateWithdrawal(
  transactionId: string,
  adminId: string,
  mobileMoneyTransactionId: string
): Promise<void> {
  return await runTransaction(db, async (transaction) => {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await transaction.get(transactionRef);

    if (!transactionDoc.exists()) {
      throw new Error('Transaction non trouvée');
    }

    const transactionData = transactionDoc.data();

    if (transactionData.status !== 'pending') {
      throw new Error('Transaction déjà traitée');
    }

    const walletRef = doc(db, 'wallets', transactionData.userId);
    const walletDoc = await transaction.get(walletRef);

    if (!walletDoc.exists()) {
      throw new Error('Portefeuille non trouvé');
    }

    const wallet = walletDoc.data();

    // Mettre à jour la transaction
    transaction.update(transactionRef, {
      status: 'completed',
      mobileMoneyTransactionId,
      validatedBy: adminId,
      validatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Libérer le solde en attente
    transaction.update(walletRef, {
      pendingBalance: wallet.pendingBalance - transactionData.totalAmount,
      updatedAt: serverTimestamp()
    });
  });
}

/**
 * Rejette un retrait (Admin)
 */
export async function rejectWithdrawal(
  transactionId: string,
  adminId: string,
  reason: string
): Promise<void> {
  return await runTransaction(db, async (transaction) => {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await transaction.get(transactionRef);

    if (!transactionDoc.exists()) {
      throw new Error('Transaction non trouvée');
    }

    const transactionData = transactionDoc.data();

    if (transactionData.status !== 'pending') {
      throw new Error('Transaction déjà traitée');
    }

    const walletRef = doc(db, 'wallets', transactionData.userId);
    const walletDoc = await transaction.get(walletRef);

    if (!walletDoc.exists()) {
      throw new Error('Portefeuille non trouvé');
    }

    const wallet = walletDoc.data();

    // Mettre à jour la transaction
    transaction.update(transactionRef, {
      status: 'failed',
      rejectionReason: reason,
      validatedBy: adminId,
      validatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Recréditer le portefeuille
    transaction.update(walletRef, {
      balance: wallet.balance + transactionData.totalAmount,
      pendingBalance: wallet.pendingBalance - transactionData.totalAmount,
      updatedAt: serverTimestamp()
    });
  });
}


// ============================================
// PAIEMENT
// ============================================

/**
 * Traite un paiement entre portefeuilles
 */
export async function processPayment(
  fromUserId: string,
  data: PaymentData
): Promise<Transaction> {
  const { toUserId, amount, orderId, description, pin } = data;

  // Vérifier le PIN si montant > 10,000 FCFA
  if (amount > 10000) {
    await verifyPIN(fromUserId, pin);
  }

  // Transaction atomique
  return await runTransaction(db, async (transaction) => {
    // Lire les portefeuilles
    const fromWalletRef = doc(db, 'wallets', fromUserId);
    const toWalletRef = doc(db, 'wallets', toUserId);

    const fromWallet = await transaction.get(fromWalletRef);
    const toWallet = await transaction.get(toWalletRef);

    if (!fromWallet.exists() || !toWallet.exists()) {
      throw new Error('Portefeuille non trouvé');
    }

    const fromBalance = fromWallet.data().balance;
    const toBalance = toWallet.data().balance;

    // Vérifier le solde
    if (fromBalance < amount) {
      throw new Error('Solde insuffisant');
    }

    // Créer la transaction de débit
    const debitTransactionData: Partial<Transaction> = {
      walletId: fromUserId,
      userId: fromUserId,
      type: 'payment',
      amount,
      fees: 0,
      totalAmount: amount,
      currency: 'XAF',
      status: 'completed',
      recipientWalletId: toUserId,
      recipientUserId: toUserId,
      orderId,
      reference: generateReference('PAY'),
      description: description || `Paiement vers ${toUserId}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const debitRef = doc(collection(db, 'transactions'));
    transaction.set(debitRef, {
      ...debitTransactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Créer la transaction de crédit
    const creditTransactionData: Partial<Transaction> = {
      ...debitTransactionData,
      walletId: toUserId,
      userId: toUserId,
      relatedTransactionId: debitRef.id,
      description: description || `Réception paiement de ${fromUserId}`
    };

    const creditRef = doc(collection(db, 'transactions'));
    transaction.set(creditRef, {
      ...creditTransactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Mettre à jour les soldes
    transaction.update(fromWalletRef, {
      balance: fromBalance - amount,
      updatedAt: serverTimestamp()
    });

    transaction.update(toWalletRef, {
      balance: toBalance + amount,
      updatedAt: serverTimestamp()
    });

    return {
      ...debitTransactionData,
      id: debitRef.id
    } as Transaction;
  });
}

// ============================================
// HISTORIQUE
// ============================================

/**
 * Récupère l'historique des transactions
 */
export async function getTransactionHistory(
  userId: string,
  filters?: TransactionFilters
): Promise<Transaction[]> {
  let q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  // Appliquer les filtres
  if (filters?.type) {
    q = query(q, where('type', '==', filters.type));
  }

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      validatedAt: data.validatedAt?.toDate()
    } as Transaction;
  });
}

/**
 * Récupère une transaction
 */
export async function getTransaction(transactionId: string): Promise<Transaction> {
  const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));

  if (!transactionDoc.exists()) {
    throw new Error('Transaction non trouvée');
  }

  const data = transactionDoc.data();
  return {
    ...data,
    id: transactionDoc.id,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    validatedAt: data.validatedAt?.toDate()
  } as Transaction;
}

// ============================================
// ADMIN
// ============================================

/**
 * Récupère les transactions en attente
 */
export async function getPendingTransactions(
  type?: 'deposit' | 'withdrawal'
): Promise<Transaction[]> {
  let q = query(
    collection(db, 'transactions'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  if (type) {
    q = query(q, where('type', '==', type));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as Transaction;
  });
}

/**
 * Récupère tous les portefeuilles
 */
export async function getAllWallets(): Promise<Wallet[]> {
  const snapshot = await getDocs(collection(db, 'wallets'));

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      lastPinAttempt: data.lastPinAttempt?.toDate()
    } as Wallet;
  });
}

/**
 * Récupère les statistiques du portefeuille
 */
export async function getWalletStatistics(): Promise<WalletStatistics> {
  const wallets = await getAllWallets();
  const transactions = await getDocs(collection(db, 'transactions'));

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const activeWallets = wallets.filter(w => w.status === 'active').length;

  const deposits = transactions.docs.filter(d => d.data().type === 'deposit');
  const withdrawals = transactions.docs.filter(d => d.data().type === 'withdrawal');
  const pending = transactions.docs.filter(d => d.data().status === 'pending');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTransactions = transactions.docs.filter(
    d => d.data().createdAt?.toDate() >= today
  );

  return {
    totalWallets: wallets.length,
    activeWallets,
    totalBalance,
    totalDeposits: deposits.reduce((sum, d) => sum + d.data().amount, 0),
    totalWithdrawals: withdrawals.reduce((sum, d) => sum + d.data().amount, 0),
    totalTransactions: transactions.size,
    pendingTransactions: pending.length,
    todayTransactions: todayTransactions.length,
    todayVolume: todayTransactions.reduce((sum, d) => sum + d.data().amount, 0)
  };
}
