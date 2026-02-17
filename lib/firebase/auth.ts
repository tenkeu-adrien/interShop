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
import { User, UserRole, AccountStatus } from '@/types';
import { generateEmailVerificationCode } from './verification';
import { sendVerificationEmail } from '../services/emailService';

export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole
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
      phoneNumber: firebaseUser.phoneNumber || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isActive: true,
      approvalStatus: (role === 'fournisseur' || role === 'marketiste') ? 'pending' : 'approved',
      
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
