/**
 * Service de gestion des taux de change manuels par l'admin
 * Remplace le système automatique par API externe
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { SupportedCurrency } from '@/types';

export interface AdminExchangeRate {
  id: string;
  currency: SupportedCurrency;
  currencyName: string;
  symbol: string;
  flag: string;
  rateToUSD: number;        // 1 USD = X unités de cette devise
  isActive: boolean;
  updatedAt: Date;
  updatedBy: string;        // ID de l'admin
  updatedByName?: string;   // Nom de l'admin (optionnel)
  createdAt: Date;
}

const COLLECTION_NAME = 'adminExchangeRates';

/**
 * Récupère tous les taux de change définis par l'admin
 */
export async function getAllAdminExchangeRates(): Promise<AdminExchangeRate[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('currency', 'asc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as AdminExchangeRate[];
  } catch (error) {
    console.error('Erreur récupération taux admin:', error);
    throw error;
  }
}

/**
 * Récupère uniquement les taux actifs
 */
export async function getActiveAdminExchangeRates(): Promise<AdminExchangeRate[]> {
  try {
    const allRates = await getAllAdminExchangeRates();
    return allRates.filter(rate => rate.isActive);
  } catch (error) {
    console.error('Erreur récupération taux actifs:', error);
    throw error;
  }
}

/**
 * Récupère un taux spécifique par code devise
 */
export async function getAdminExchangeRate(currency: SupportedCurrency): Promise<AdminExchangeRate | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, currency);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
    } as AdminExchangeRate;
  } catch (error) {
    console.error(`Erreur récupération taux ${currency}:`, error);
    throw error;
  }
}

/**
 * Met à jour le taux d'une devise
 */
export async function updateAdminExchangeRate(
  currency: SupportedCurrency,
  rateToUSD: number,
  adminId: string,
  adminName?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, currency);
    
    await updateDoc(docRef, {
      rateToUSD,
      updatedAt: Timestamp.now(),
      updatedBy: adminId,
      ...(adminName && { updatedByName: adminName })
    });
  } catch (error) {
    console.error(`Erreur mise à jour taux ${currency}:`, error);
    throw error;
  }
}

/**
 * Active/désactive un taux de change
 */
export async function toggleAdminExchangeRateStatus(
  currency: SupportedCurrency,
  adminId: string,
  adminName?: string
): Promise<void> {
  try {
    const rate = await getAdminExchangeRate(currency);
    
    if (!rate) {
      throw new Error(`Taux ${currency} introuvable`);
    }
    
    const docRef = doc(db, COLLECTION_NAME, currency);
    
    await updateDoc(docRef, {
      isActive: !rate.isActive,
      updatedAt: Timestamp.now(),
      updatedBy: adminId,
      ...(adminName && { updatedByName: adminName })
    });
  } catch (error) {
    console.error(`Erreur toggle statut ${currency}:`, error);
    throw error;
  }
}

/**
 * Crée ou met à jour un taux de change (upsert)
 */
export async function setAdminExchangeRate(
  rate: Omit<AdminExchangeRate, 'id' | 'createdAt' | 'updatedAt'>,
  adminId: string,
  adminName?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, rate.currency);
    const existing = await getDoc(docRef);
    
    const data = {
      currency: rate.currency,
      currencyName: rate.currencyName,
      symbol: rate.symbol,
      flag: rate.flag,
      rateToUSD: rate.rateToUSD,
      isActive: rate.isActive,
      updatedAt: Timestamp.now(),
      updatedBy: adminId,
      ...(adminName && { updatedByName: adminName }),
      ...(existing.exists() ? {} : { createdAt: Timestamp.now() })
    };
    
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Erreur création/update taux ${rate.currency}:`, error);
    throw error;
  }
}

/**
 * Applique une marge globale sur tous les taux actifs
 * @param marginPercent Pourcentage de marge (ex: 5 pour +5%, -5 pour -5%)
 */
export async function applyGlobalMargin(
  marginPercent: number,
  adminId: string,
  adminName?: string
): Promise<number> {
  try {
    const rates = await getActiveAdminExchangeRates();
    let updated = 0;
    
    for (const rate of rates) {
      if (rate.currency === 'USD') continue; // USD est toujours 1
      
      const multiplier = 1 + (marginPercent / 100);
      const newRate = rate.rateToUSD * multiplier;
      
      await updateAdminExchangeRate(rate.currency, newRate, adminId, adminName);
      updated++;
    }
    
    return updated;
  } catch (error) {
    console.error('Erreur application marge globale:', error);
    throw error;
  }
}
