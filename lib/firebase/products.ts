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
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import { Product, SearchFilters } from '@/types';

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...productData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
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
  await deleteDoc(doc(db, 'products', productId));
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

  return {
    products,
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
  
  const productsRef = collection(db, 'products');
  const docRef = await addDoc(productsRef, {
    ...productData,
    fournisseurId,
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
