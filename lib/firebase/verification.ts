import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { EmailVerification, AccountStatus, VerificationHistoryEntry } from '@/types';

/**
 * Génère un code de vérification email à 6 chiffres
 */
function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Génère et enregistre un code de vérification email via l'API
 */
export async function generateEmailVerificationCode(
  userId: string, 
  email: string,
  displayName: string
): Promise<string> {
  try {
    const response = await fetch('/api/verification/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        displayName,
        action: 'send'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'envoi du code');
    }

    return 'sent'; // Le code est envoyé par email, pas retourné
  } catch (error: any) {
    console.error('Erreur generateEmailVerificationCode:', error);
    throw error;
  }
}

/**
 * Vérifie un code de vérification email
 */
export async function verifyEmailCode(
  userId: string, 
  code: string
): Promise<boolean> {
  // Récupérer l'utilisateur
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('Utilisateur non trouvé');
  }
  
  const userData = userDoc.data();
  
  // Vérifier si déjà vérifié
  if (userData.emailVerified) {
    return true;
  }
  
  // Récupérer le code depuis la collection emailVerifications
  const verificationDoc = await getDoc(doc(db, 'emailVerifications', userId));
  
  if (!verificationDoc.exists()) {
    throw new Error('Aucun code de vérification trouvé. Veuillez en demander un nouveau.');
  }
  
  const verificationData = verificationDoc.data();
  
  // Vérifier le code
  if (verificationData.code !== code) {
    // Ajouter à l'historique
    await addVerificationHistory(userId, {
      type: 'email',
      status: 'failed',
      timestamp: new Date(),
      details: 'Code incorrect'
    });
    
    throw new Error('Code de vérification incorrect');
  }
  
  // Vérifier l'expiration
  const now = Date.now();
  if (now > verificationData.expiresAt) {
    // Ajouter à l'historique
    await addVerificationHistory(userId, {
      type: 'email',
      status: 'failed',
      timestamp: new Date(),
      details: 'Code expiré'
    });
    
    throw new Error('Le code de vérification a expiré. Veuillez en demander un nouveau.');
  }
  
  // Vérifier si déjà utilisé
  if (verificationData.verified) {
    throw new Error('Ce code a déjà été utilisé.');
  }
  
  // Déterminer le nouveau statut selon le rôle
  let newStatus: AccountStatus = 'active';
  if (userData.role === 'fournisseur' || userData.role === 'marketiste') {
    newStatus = 'phone_unverified';
  }
  
  // Mettre à jour l'utilisateur
  await updateDoc(doc(db, 'users', userId), {
    emailVerified: true,
    accountStatus: newStatus
  });
  
  // Marquer la vérification comme utilisée
  await updateDoc(doc(db, 'emailVerifications', userId), {
    verified: true,
    verifiedAt: serverTimestamp()
  });
  
  // Ajouter à l'historique
  await addVerificationHistory(userId, {
    type: 'email',
    status: 'success',
    timestamp: new Date(),
    details: 'Email vérifié avec succès'
  });
  
  return true;
}

/**
 * Renvoie un code de vérification email via l'API
 */
export async function resendEmailVerificationCode(
  userId: string,
  email: string,
  displayName: string
): Promise<string> {
  try {
    const response = await fetch('/api/verification/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        displayName,
        action: 'resend'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors du renvoi du code');
    }

    return 'sent';
  } catch (error: any) {
    console.error('Erreur resendEmailVerificationCode:', error);
    throw error;
  }
}

/**
 * Met à jour le statut du compte
 */
export async function updateAccountStatus(
  userId: string, 
  status: AccountStatus
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    accountStatus: status,
    updatedAt: serverTimestamp()
  });
}

/**
 * Ajoute une entrée à l'historique de vérification
 */
export async function addVerificationHistory(
  userId: string, 
  entry: VerificationHistoryEntry
): Promise<void> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('Utilisateur non trouvé');
  }
  
  const userData = userDoc.data();
  const history = userData.verificationHistory || [];
  
  history.push({
    ...entry,
    timestamp: Timestamp.fromDate(entry.timestamp)
  });
  
  await updateDoc(doc(db, 'users', userId), {
    verificationHistory: history
  });
}

/**
 * Récupère l'historique de vérification d'un utilisateur
 */
export async function getVerificationHistory(
  userId: string
): Promise<VerificationHistoryEntry[]> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    return [];
  }
  
  const userData = userDoc.data();
  const history = userData.verificationHistory || [];
  
  // Convertir les Timestamps en Dates
  return history.map((entry: any) => ({
    ...entry,
    timestamp: entry.timestamp.toDate()
  }));
}

/**
 * Envoie un code de vérification par SMS via Firebase Auth
 */
export async function sendPhoneVerificationCode(
  userId: string,
  phoneNumber: string,
  recaptchaVerifier: any
): Promise<string> {
  try {
    // Vérifier les paramètres
    if (!userId) {
      throw new Error('userId est requis');
    }
    
    if (!phoneNumber) {
      throw new Error('phoneNumber est requis');
    }
    
    // Vérifier que recaptchaVerifier est fourni
    if (!recaptchaVerifier) {
      throw new Error('reCAPTCHA verifier non fourni');
    }

    const { auth } = await import('./config');
    const { signInWithPhoneNumber } = await import('firebase/auth');

    // Vérifier que l'utilisateur existe
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }

    console.log('📱 Envoi SMS Firebase Auth vers:', phoneNumber);

    // Envoyer le code via Firebase Auth
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );

    console.log('✅ SMS envoyé, verificationId:', confirmationResult.verificationId);

    // Sauvegarder dans Firestore
    await setDoc(doc(db, 'phoneVerifications', userId), {
      phoneNumber,
      verificationId: confirmationResult.verificationId,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 2 * 60 * 1000), // +2 minutes
      attempts: 1,
      verified: false
    });

    // Mettre à jour le numéro dans le profil utilisateur
    await updateDoc(doc(db, 'users', userId), {
      phoneNumber
    });

    return confirmationResult.verificationId;
  } catch (error: any) {
    console.error('❌ Erreur sendPhoneVerificationCode:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    
    // Messages d'erreur plus clairs
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Numéro de téléphone invalide');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Trop de tentatives. Veuillez réessayer plus tard.');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('Quota SMS dépassé. Contactez le support.');
    } else if (error.code === 'auth/missing-phone-number') {
      throw new Error('Numéro de téléphone manquant');
    } else if (error.code === 'auth/argument-error') {
      throw new Error('Erreur de configuration. Veuillez rafraîchir la page.');
    }
    
    throw error;
  }
}

/**
 * Vérifie un code de vérification téléphone
 */
export async function verifyPhoneCode(
  userId: string,
  verificationId: string,
  code: string
): Promise<boolean> {
  try {
    const { PhoneAuthProvider, signInWithCredential } = await import('firebase/auth');
    const { auth } = await import('./config');

    // Récupérer l'utilisateur
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Utilisateur non trouvé');
    }

    const userData = userDoc.data();

    // Vérifier si déjà vérifié
    if (userData.phoneVerified) {
      return true;
    }

    // Récupérer la vérification
    const verificationDoc = await getDoc(doc(db, 'phoneVerifications', userId));
    if (!verificationDoc.exists()) {
      throw new Error('Aucune vérification en cours');
    }

    const verificationData = verificationDoc.data();

    // Vérifier l'expiration
    const now = Date.now();
    if (verificationData.expiresAt && now > verificationData.expiresAt.toMillis()) {
      await addVerificationHistory(userId, {
        type: 'phone',
        status: 'failed',
        timestamp: new Date(),
        details: 'Code expiré'
      });
      throw new Error('Le code a expiré. Veuillez en demander un nouveau.');
    }

    // Créer les credentials et vérifier
    const credential = PhoneAuthProvider.credential(verificationId, code);
    await signInWithCredential(auth, credential);

    // Déterminer le nouveau statut selon le rôle
    let newStatus: AccountStatus = 'active';
    if (userData.role === 'fournisseur' || userData.role === 'marketiste') {
      newStatus = 'pending_admin_approval';
      
      // Créer une demande d'approbation admin
      await addDoc(collection(db, 'adminApprovalQueue'), {
        userId,
        userRole: userData.role,
        userName: userData.displayName || 'Utilisateur',
        userEmail: userData.email,
        userPhone: verificationData.phoneNumber,
        requestedAt: serverTimestamp(),
        status: 'pending'
      });
    }

    // Mettre à jour l'utilisateur
    await updateDoc(doc(db, 'users', userId), {
      phoneVerified: true,
      accountStatus: newStatus
    });

    // Marquer la vérification comme utilisée
    await updateDoc(doc(db, 'phoneVerifications', userId), {
      verified: true,
      verifiedAt: serverTimestamp()
    });

    // Ajouter à l'historique
    await addVerificationHistory(userId, {
      type: 'phone',
      status: 'success',
      timestamp: new Date(),
      details: 'Téléphone vérifié avec succès'
    });

    return true;
  } catch (error: any) {
    console.error('Erreur verifyPhoneCode:', error);

    // Ajouter à l'historique
    await addVerificationHistory(userId, {
      type: 'phone',
      status: 'failed',
      timestamp: new Date(),
      details: 'Code incorrect'
    });

    // Messages d'erreur plus clairs
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Code de vérification incorrect');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('Le code a expiré');
    }

    throw error;
  }
}

/**
 * Renvoie un code de vérification téléphone
 */
export async function resendPhoneVerificationCode(
  userId: string,
  phoneNumber: string,
  recaptchaVerifier: any
): Promise<string> {
  // Vérifier le délai depuis la dernière demande
  const verificationDoc = await getDoc(doc(db, 'phoneVerifications', userId));
  
  if (verificationDoc.exists()) {
    const verificationData = verificationDoc.data();
    const lastRequest = verificationData.createdAt?.toMillis() || 0;
    const now = Date.now();
    
    if (now - lastRequest < 60000) { // 1 minute
      throw new Error('Veuillez attendre 1 minute avant de redemander un code');
    }
  }

  // Envoyer un nouveau code
  return sendPhoneVerificationCode(userId, phoneNumber, recaptchaVerifier);
}
