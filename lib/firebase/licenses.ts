import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, addDoc } from 'firebase/firestore';
import { db } from './config';
import { LicenseConfig, FournisseurSubscription, ProductUsage, LicenseTier } from '@/types';

export async function getAllLicenses(): Promise<LicenseConfig[]> {
  const licensesRef = collection(db, 'licenses');
  const snapshot = await getDocs(licensesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LicenseConfig[];
}

export async function getFournisseurSubscription(
  fournisseurId: string
): Promise<FournisseurSubscription | null> {
  const subscriptionsRef = collection(db, 'subscriptions');
  const q = query(
    subscriptionsRef,
    where('fournisseurId', '==', fournisseurId),
    where('status', '==', 'active')
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FournisseurSubscription;
}

export async function getProductUsage(fournisseurId: string): Promise<ProductUsage> {
  const usageRef = doc(db, 'productUsage', fournisseurId);
  const snapshot = await getDoc(usageRef);
  
  if (!snapshot.exists()) {
    // Initialize with free tier
    const defaultUsage: ProductUsage = {
      fournisseurId,
      currentCount: 0,
      quota: 5,
      lastUpdated: new Date(),
    };
    await setDoc(usageRef, defaultUsage);
    return defaultUsage;
  }
  
  return snapshot.data() as ProductUsage;
}

export async function updateProductUsage(
  fournisseurId: string,
  increment: number
): Promise<void> {
  const usageRef = doc(db, 'productUsage', fournisseurId);
  const usage = await getProductUsage(fournisseurId);
  
  await updateDoc(usageRef, {
    currentCount: usage.currentCount + increment,
    lastUpdated: new Date(),
  });
}

export async function createSubscription(
  fournisseurId: string,
  licenseTier: LicenseTier,
  priceUSD: number
): Promise<string> {
  const subscriptionsRef = collection(db, 'subscriptions');
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  
  const subscription: Omit<FournisseurSubscription, 'id'> = {
    fournisseurId,
    licenseTier,
    startDate,
    endDate,
    status: 'active',
    autoRenew: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const docRef = await addDoc(subscriptionsRef, subscription);
  
  // Update quota
  const licenses = await getAllLicenses();
  const license = licenses.find(l => l.tier === licenseTier);
  if (license) {
    const usageRef = doc(db, 'productUsage', fournisseurId);
    await updateDoc(usageRef, {
      quota: license.productQuota,
      lastUpdated: new Date(),
    });
  }
  
  return docRef.id;
}
