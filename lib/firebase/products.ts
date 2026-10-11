import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  documentId,
  QueryConstraint,
} from 'firebase/firestore';
import { db, auth } from './config';
import { Product, SearchFilters } from '@/types';

// Un fournisseur est considéré comme vérifié s'il a été approuvé par un admin
// ou explicitement marqué comme vérifié.
const isFournisseurVerifiedData = (data: any): boolean =>
  data?.isVerified === true ||
  data?.approvalStatus === 'approved' ||
  data?.adminApproval?.status === 'approved';

/**
 * Enrichit une liste de produits avec le statut de vérification de leur
 * fournisseur (`fournisseurVerified`).
 *
 * Les produits créés ou approuvés récemment portent déjà ce champ (lecture
 * publique). Cette fonction sert de repli pour les anciens produits qui n'en
 * ont pas : elle consulte la collection `users`, réservée aux utilisateurs
 * authentifiés, et échoue silencieusement pour les visiteurs anonymes.
 */
export const enrichProductsWithFournisseurVerification = async (
  products: Product[]
): Promise<Product[]> => {
  try {
    if (!auth || !auth.currentUser || products.length === 0) return products;

    const missing = products.filter(
      (p) => p.fournisseurVerified === undefined && p.fournisseurId
    );
    if (missing.length === 0) return products;

    const ids = Array.from(
      new Set(missing.map((p) => p.fournisseurId).filter(Boolean))
    );
    if (ids.length === 0) return products;

    const verified = new Set<string>();
    for (let i = 0; i < ids.length; i += 30) {
      const chunk = ids.slice(i, i + 30);
      const snap = await getDocs(
        query(collection(db, 'users'), where(documentId(), 'in', chunk))
      );
      snap.forEach((d) => {
        if (isFournisseurVerifiedData(d.data())) verified.add(d.id);
      });
    }

    return products.map((p) =>
      p.fournisseurVerified === undefined
        ? { ...p, fournisseurVerified: verified.has(p.fournisseurId) }
        : p
    );
  } catch (error) {
    console.warn('Vérification fournisseur indisponible:', error);
    return products;
  }
};

/**
 * Renvoie si un fournisseur est vérifié, en lisant son document utilisateur.
 * Renvoie `false` si la lecture échoue (visiteur anonyme, document absent).
 */
export const getFournisseurVerification = async (
  fournisseurId: string
): Promise<boolean> => {
  try {
    if (!fournisseurId) return false;
    const snap = await getDoc(doc(db, 'users', fournisseurId));
    if (!snap.exists()) return false;
    return isFournisseurVerifiedData(snap.data());
  } catch (error) {
    return false;
  }
};

/**
 * Met à jour le champ public `fournisseurVerified` de tous les produits d'un
 * fournisseur (utilisé par l'administration quand un fournisseur est approuvé
 * ou rejeté).
 */
export const updateFournisseurProductsVerification = async (
  fournisseurId: string,
  verified: boolean
): Promise<void> => {
  const snap = await getDocs(
    query(
      collection(db, 'products'),
      where('fournisseurId', '==', fournisseurId)
    )
  );
  const refs = snap.docs.map((d) => doc(db, 'products', d.id));
  for (let i = 0; i < refs.length; i += 100) {
    await Promise.all(
      refs.slice(i, i + 100).map((ref) => updateDoc(ref, { fournisseurVerified: verified }))
    );
  }
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
  const fournisseurId = productData.fournisseurId;

  // Vérifier le quota (3 produits gratuits, plus selon la licence)
  const usage = await getProductUsage(fournisseurId);
  if (usage.currentCount >= usage.quota && usage.quota !== -1) {
    throw new Error('Limite de produits atteinte (3 produits pour la version gratuite). Veuillez passer à une licence supérieure.');
  }

  const fournisseurVerified = await getFournisseurVerification(fournisseurId);

  const docRef = await addDoc(collection(db, 'products'), {
    ...productData,
    fournisseurVerified,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Incrémenter l'usage
  await updateProductUsage(fournisseurId, 1);

  return docRef.id;
};

export const getProduct = async (productId: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', productId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Product;
};

export const updateProduct = async (
  productId: string,
  updates: Partial<Product>
): Promise<void> => {
  const docRef = doc(db, 'products', productId);
  await updateDoc(docRef, { ...updates, updatedAt: new Date() });
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const docRef = doc(db, 'products', productId);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const fournisseurId = snapshot.data().fournisseurId;
    await deleteDoc(docRef);

    // Décrémenter l'usage du quota
    if (fournisseurId) {
      await updateProductUsage(fournisseurId, -1);
    }
    return;
  }

  await deleteDoc(docRef);
};

export const searchProducts = async (
  filters: SearchFilters,
  pageSize: number = 20,
  lastDoc?: any
): Promise<{ products: Product[]; lastDoc: any }> => {
  const constraints: QueryConstraint[] = [where('isActive', '==', true)];

  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }

  if (filters.country) {
    constraints.push(where('country', '==', filters.country));
  }

  if (filters.verifiedOnly) {
    constraints.push(where('fournisseurId', 'in', [])); // Would need verified supplier IDs
  }

  if (filters.minRating) {
    constraints.push(where('rating', '>=', filters.minRating));
  }

  // Sorting
  switch (filters.sortBy) {
    case 'price_asc':
      constraints.push(orderBy('prices.0.price', 'asc'));
      break;
    case 'price_desc':
      constraints.push(orderBy('prices.0.price', 'desc'));
      break;
    case 'newest':
      constraints.push(orderBy('createdAt', 'desc'));
      break;
    case 'popular':
      constraints.push(orderBy('sales', 'desc'));
      break;
    case 'relevance':
      constraints.push(orderBy('views', 'desc'));
      break;
    default:
      // Par défaut, afficher les plus récents
      constraints.push(orderBy('createdAt', 'desc'));
  }

  constraints.push(limit(pageSize));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, 'products'), ...constraints);
  const snapshot = await getDocs(q);

  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  const enrichedProducts = await enrichProductsWithFournisseurVerification(products);

  return {
    products: enrichedProducts,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
  };
};

export const getFournisseurProducts = async (fournisseurId: string): Promise<Product[]> => {
  const q = query(
    collection(db, 'products'),
    where('fournisseurId', '==', fournisseurId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
};

// Multi-Category Product Functions
import { ProductCategory } from '@/types';
import { getProductUsage, updateProductUsage } from './licenses';

export async function createMultiCategoryProduct(
  productData: Omit<Product, 'id'>,
  fournisseurId: string
): Promise<string> {
  // Check quota first
  const usage = await getProductUsage(fournisseurId);
  if (usage.currentCount >= usage.quota && usage.quota !== -1) {
    throw new Error('Quota de produits atteint. Veuillez mettre à niveau votre licence.');
  }
  
  const fournisseurVerified = await getFournisseurVerification(fournisseurId);

  const productsRef = collection(db, 'products');
  const docRef = await addDoc(productsRef, {
    ...productData,
    fournisseurId,
    fournisseurVerified,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Increment usage
  await updateProductUsage(fournisseurId, 1);
  
  return docRef.id;
}

export async function getProductsByCategory(
  category: ProductCategory,
  filters?: {
    city?: string;
    priceRange?: string;
    features?: string[];
    userLocation?: { latitude: number; longitude: number };
    maxDistance?: number;
  }
): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  let q = query(
    productsRef,
    where('serviceCategory', '==', category),
    where('isActive', '==', true)
  );
  
  const snapshot = await getDocs(q);
  let products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Product[];
  
  // Apply filters
  if (filters?.city) {
    products = products.filter(p => 
      p.location?.city.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  
  if (filters?.priceRange && category === 'restaurant') {
    products = products.filter(p => 
      p.restaurantData?.priceRange === filters.priceRange
    );
  }
  
  if (filters?.features && filters.features.length > 0) {
    products = products.filter(p => {
      const productFeatures = category === 'restaurant' 
        ? p.restaurantData?.features 
        : p.hotelData?.amenities;
      return filters.features!.some(f => productFeatures?.includes(f));
    });
  }
  
  // Calculate distances if user location provided
  if (filters?.userLocation && (category === 'restaurant' || category === 'hotel')) {
    products = products.map(p => {
      if (p?.location) {
        const distance = calculateDistance(
          filters.userLocation!.latitude,
          filters.userLocation!.longitude,
          p.location.latitude,
          p.location.longitude
        );
        return { ...p, distance } as any;
      }
      return p;
    });
    
    // Filter by max distance
    if (filters.maxDistance) {
      products = products.filter(p => 
        (p as any).distance !== undefined && (p as any).distance <= filters.maxDistance!
      );
    }
    
    // Sort by distance
    products.sort((a, b) => ((a as any).distance || Infinity) - ((b as any).distance || Infinity));
  }
  
  return products;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
