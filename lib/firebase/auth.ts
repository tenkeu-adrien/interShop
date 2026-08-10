import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserRole, AccountStatus, SupportedCurrency } from '@/types';
import { generateEmailVerificationCode } from './verification';
import { sendVerificationEmail } from '../services/emailService';

export interface ShopCreationData {
  shopName?: string;
  shopCategory?: string;
  shopCurrency?: 'USD' | 'CDF';
  shopLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country: string;
  };
}

export interface RegisterOptions {
  phoneNumber?: string;
  phoneCountryCode?: string;
  shop?: ShopCreationData;
}

export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  options?: RegisterOptions
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName });

    // Déterminer le statut initial du compte
    const initialStatus: AccountStatus = 'email_unverified';

    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      role,
      photoURL: firebaseUser.photoURL || null,
      phoneNumber: options?.phoneNumber || firebaseUser.phoneNumber || null,
      phoneCountryCode: options?.phoneCountryCode || '+243',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isActive: true,
      approvalStatus: (role === 'fournisseur' || role === 'marketiste') ? 'pending' : 'approved',
      
      // Boutique fournisseur
      ...(options?.shop?.shopName && { shopName: options.shop.shopName }),
      ...(options?.shop?.shopCategory && { shopCategory: options.shop.shopCategory }),
      ...(options?.shop?.shopCurrency && { shopCurrency: options.shop.shopCurrency }),
      ...(options?.shop?.shopLocation && { shopLocation: options.shop.shopLocation }),
      
      // Nouveau système de vérification
      accountStatus: initialStatus,
      emailVerified: false,
      emailVerificationAttempts: 0,
      phoneVerified: false,
      phoneVerificationAttempts: 0,
      verificationHistory: []
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: Timestamp.fromDate(userData.createdAt),
      updatedAt: Timestamp.fromDate(userData.updatedAt)
    });

    // Générer et envoyer le code de vérification email
    try {
      await generateEmailVerificationCode(firebaseUser.uid, email, displayName);
      console.log('📧 Code de vérification envoyé par email');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du code de vérification:', error);
      // Ne pas bloquer l'inscription si l'email échoue
      // L'utilisateur pourra redemander un code plus tard
    }

    return userData;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

  if (!userDoc.exists()) {
    throw new Error('User data not found');
  }

  return userDoc.data() as User;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const getUserData = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return userDoc.data() as User;
};
