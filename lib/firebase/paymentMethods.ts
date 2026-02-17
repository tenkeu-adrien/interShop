import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import type { PaymentMethod, CreatePaymentMethodData, PaymentMethodType } from '@/types';

const PAYMENT_METHODS_COLLECTION = 'paymentMethods';

/**
 * Valide les champs obligatoires d'une méthode de paiement
 */
function validatePaymentMethodData(data: CreatePaymentMethodData): void {
  if (!data.name || data.name.trim() === '') {
    throw new Error('Le nom de la méthode de paiement est obligatoire');
  }
  
  if (!data.type) {
    throw new Error('Le type de la méthode de paiement est obligatoire');
  }
  
  if (!data.instructions || data.instructions.trim() === '') {
    throw new Error('Les instructions de paiement sont obligatoires');
  }
  
  // Valider le type
  const validTypes: PaymentMethodType[] = ['mobile_money', 'mpesa', 'crypto', 'bank_transfer', 'other'];
  if (!validTypes.includes(data.type)) {
    throw new Error(`Type de méthode invalide. Types valides: ${validTypes.join(', ')}`);
  }
}

/**
 * Crée une nouvelle méthode de paiement
 */
export async function createPaymentMethod(
  data: CreatePaymentMethodData,
  adminId: string
): Promise<PaymentMethod> {
  try {
    // Validation
    validatePaymentMethodData(data);
    
    const now = new Date();
    const paymentMethodData = {
      name: data.name.trim(),
      type: data.type,
      instructions: data.instructions.trim(),
      accountDetails: data.accountDetails || {},
      isActive: true,
      icon: data.icon || '',
      displayOrder: data.displayOrder || 0,
      createdAt: now,
      updatedAt: now,
      createdBy: adminId,
      updatedBy: adminId
    };
    
    const docRef = await addDoc(
      collection(db, PAYMENT_METHODS_COLLECTION),
      paymentMethodData
    );
    
    return {
      id: docRef.id,
      ...paymentMethodData
    };
  } catch (error) {
    console.error('Erreur createPaymentMethod:', error);
    throw error;
  }
}

/**
 * Met à jour une méthode de paiement existante
 */
export async function updatePaymentMethod(
  id: string,
  data: Partial<CreatePaymentMethodData>,
  adminId: string
): Promise<void> {
  try {
    const docRef = doc(db, PAYMENT_METHODS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Méthode de paiement introuvable');
    }
    
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: adminId
    };
    
    if (data.name !== undefined) {
      if (data.name.trim() === '') {
        throw new Error('Le nom ne peut pas être vide');
      }
      updateData.name = data.name.trim();
    }
    
    if (data.type !== undefined) {
      const validTypes: PaymentMethodType[] = ['mobile_money', 'mpesa', 'crypto', 'bank_transfer', 'other'];
      if (!validTypes.includes(data.type)) {
        throw new Error(`Type de méthode invalide. Types valides: ${validTypes.join(', ')}`);
      }
      updateData.type = data.type;
    }
    
    if (data.instructions !== undefined) {
      if (data.instructions.trim() === '') {
        throw new Error('Les instructions ne peuvent pas être vides');
      }
      updateData.instructions = data.instructions.trim();
    }
    
    if (data.accountDetails !== undefined) {
      updateData.accountDetails = data.accountDetails;
    }
    
    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }
    
    if (data.displayOrder !== undefined) {
      updateData.displayOrder = data.displayOrder;
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Erreur updatePaymentMethod:', error);
    throw error;
  }
}

/**
 * Bascule le statut actif/inactif d'une méthode de paiement
 */
export async function togglePaymentMethodStatus(
  id: string,
  adminId: string
): Promise<void> {
  try {
    const docRef = doc(db, PAYMENT_METHODS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Méthode de paiement introuvable');
    }
    
    const currentData = docSnap.data();
    
    await updateDoc(docRef, {
      isActive: !currentData.isActive,
      updatedAt: new Date(),
      updatedBy: adminId
    });
  } catch (error) {
    console.error('Erreur togglePaymentMethodStatus:', error);
    throw error;
  }
}

/**
 * Récupère toutes les méthodes de paiement (pour admin)
 */
export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const q = query(
      collection(db, PAYMENT_METHODS_COLLECTION),
      orderBy('displayOrder', 'asc'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt)
      } as PaymentMethod;
    });
  } catch (error) {
    console.error('Erreur getAllPaymentMethods:', error);
    throw error;
  }
}

/**
 * Récupère uniquement les méthodes de paiement actives (pour clients)
 */
export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const q = query(
      collection(db, PAYMENT_METHODS_COLLECTION),
      where('isActive', '==', true),
      orderBy('displayOrder', 'asc'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt)
      } as PaymentMethod;
    });
  } catch (error) {
    console.error('Erreur getActivePaymentMethods:', error);
    throw error;
  }
}

/**
 * Récupère une méthode de paiement spécifique
 */
export async function getPaymentMethod(id: string): Promise<PaymentMethod> {
  try {
    const docRef = doc(db, PAYMENT_METHODS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Méthode de paiement introuvable');
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt)
    } as PaymentMethod;
  } catch (error) {
    console.error('Erreur getPaymentMethod:', error);
    throw error;
  }
}

/**
 * Supprime une méthode de paiement (soft delete)
 */
export async function deletePaymentMethod(
  id: string,
  adminId: string
): Promise<void> {
  try {
    const docRef = doc(db, PAYMENT_METHODS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Méthode de paiement introuvable');
    }
    
    // Soft delete: désactiver au lieu de supprimer
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: new Date(),
      updatedBy: adminId
    });
  } catch (error) {
    console.error('Erreur deletePaymentMethod:', error);
    throw error;
  }
}
