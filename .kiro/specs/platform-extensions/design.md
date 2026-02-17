# Design Document: Extensions de la Plateforme Multi-Services

## Overview

Ce document spécifie l'implémentation technique des extensions de la plateforme InterAppshop pour inclure les services de Restaurants, Hôtels, Rencontres et le système de licences. Ces extensions s'intègrent à l'architecture existante Next.js 16 + TypeScript + Firebase + Zustand.

### Key Design Goals

1. **Extend Existing Architecture**: Réutiliser les composants, stores Zustand et Firebase existants
2. **Multi-Category Support**: Gérer 4 types de services dans une seule plateforme
3. **Geolocation Integration**: Capturer et utiliser la position GPS pour restaurants/hôtels
4. **License System**: Implémenter un système d'abonnement avec quotas
5. **Privacy Protection**: Protéger les informations de contact des profils de rencontres

### Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v3.4.1
- **State Management**: Zustand (nouveaux stores: licenseStore, categoryStore, geolocationStore)
- **Backend**: Firebase (Firestore, Authentication, Storage, Geolocation)
- **Maps**: Google Maps API ou Mapbox
- **Geolocation**: Browser Geolocation API
- **UI Components**: lucide-react, Framer Motion

## Architecture

### Extended System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Application                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Zustand Stores (Extended)                      │ │
│  │  - authStore                                                │ │
│  │  - cartStore                                                │ │
│  │  - currencyStore                                            │ │
│  │  - categoryStore (NEW)                                      │ │
│  │  - licenseStore (NEW)                                       │ │
│  │  - geolocationStore (NEW)                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Pages & Components                       │ │
│  │  /restaurants → Restaurant Listings                         │ │
│  │  /hotels → Hotel Listings                                   │ │
│  │  /dating → Dating Profiles                                  │ │
│  │  /dashboard/fournisseur/licenses → License Management      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Firestore    │  │ Geolocation  │  │  Storage             │  │
│  │ - products   │  │ - lat/lng    │  │  - Images            │  │
│  │ - licenses   │  │ - addresses  │  │  - Menus/PDFs        │  │
│  │ - profiles   │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Models

### Extended Product Type

```typescript
export type ProductCategory = 'ecommerce' | 'restaurant' | 'hotel' | 'dating';

export interface Product {
  // Existing fields
  id: string;
  fournisseurId: string;
  name: string;
  description: string;
  images: string[];
  category: string; // Now also used for service category
  
  // NEW: Service category
  serviceCategory: ProductCategory;
  
  // NEW: Geolocation (for restaurants & hotels)
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  
  // NEW: Restaurant-specific fields
  restaurantData?: {
    cuisineType: string[];
    priceRange: '€' | '€€' | '€€€' | '€€€€';
    openingHours: {
      [day: string]: { open: string; close: string; closed?: boolean };
    };
    features: string[]; // WiFi, Parking, Terrasse, etc.
    menuPDF?: string;
  };
  
  // NEW: Hotel-specific fields
  hotelData?: {
    starRating: 1 | 2 | 3 | 4 | 5;
    roomTypes: {
      type: string;
      price: number;
      description: string;
    }[];
    checkInTime: string;
    checkOutTime: string;
    amenities: string[]; // Piscine, Spa, Restaurant, etc.
  };
  
  // NEW: Dating profile fields
  datingProfile?: {
    firstName: string;
    age: number;
    gender: 'homme' | 'femme' | 'autre';
    height?: number; // in cm
    skinColor?: string;
    eyeColor?: string;
    profession?: string;
    interests?: string[];
    status: 'available' | 'unavailable' | 'archived';
    contactInfo: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    }; // Only visible to intermediary
  };
  
  // Existing fields
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### License System Types

```typescript
export type LicenseTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface LicenseConfig {
  id: string;
  tier: LicenseTier;
  name: string;
  productQuota: number; // -1 for unlimited
  priceUSD: number; // Annual price
  features: string[];
  isActive: boolean;
}

export interface FournisseurSubscription {
  id: string;
  fournisseurId: string;
  licenseTier: LicenseTier;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductUsage {
  fournisseurId: string;
  currentCount: number;
  quota: number;
  lastUpdated: Date;
}
```

### Contact Request Type

```typescript
export interface ContactRequest {
  id: string;
  profileId: string; // Dating profile ID
  clientId: string;
  intermediaryId: string; // Fournisseur/Marketiste/Admin who added profile
  status: 'pending' | 'approved' | 'rejected' | 'shared';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  sharedAt?: Date;
}
```

## Zustand Stores

### 1. Category Store

```typescript
// store/categoryStore.ts
import { create } from 'zustand';
import { ProductCategory } from '@/types';

interface CategoryState {
  selectedCategory: ProductCategory;
  setCategory: (category: ProductCategory) => void;
  filters: {
    city?: string;
    priceRange?: string;
    features?: string[];
    distance?: number;
  };
  setFilters: (filters: Partial<CategoryState['filters']>) => void;
  clearFilters: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  selectedCategory: 'ecommerce',
  setCategory: (category) => set({ selectedCategory: category }),
  filters: {},
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  clearFilters: () => set({ filters: {} }),
}));
```

### 2. License Store

```typescript
// store/licenseStore.ts
import { create } from 'zustand';
import { LicenseConfig, FournisseurSubscription, ProductUsage } from '@/types';

interface LicenseState {
  licenses: LicenseConfig[];
  currentSubscription: FournisseurSubscription | null;
  productUsage: ProductUsage | null;
  loading: boolean;
  
  fetchLicenses: () => Promise<void>;
  fetchSubscription: (fournisseurId: string) => Promise<void>;
  fetchProductUsage: (fournisseurId: string) => Promise<void>;
  upgradeLicense: (tier: LicenseTier) => Promise<void>;
  checkQuota: () => boolean;
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
  licenses: [],
  currentSubscription: null,
  productUsage: null,
  loading: false,
  
  fetchLicenses: async () => {
    // Implementation in next section
  },
  
  fetchSubscription: async (fournisseurId: string) => {
    // Implementation in next section
  },
  
  fetchProductUsage: async (fournisseurId: string) => {
    // Implementation in next section
  },
  
  upgradeLicense: async (tier: LicenseTier) => {
    // Implementation in next section
  },
  
  checkQuota: () => {
    const { productUsage } = get();
    if (!productUsage) return false;
    return productUsage.currentCount < productUsage.quota || productUsage.quota === -1;
  },
}));
```

### 3. Geolocation Store

```typescript
// store/geolocationStore.ts
import { create } from 'zustand';

interface GeolocationState {
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  permissionGranted: boolean;
  loading: boolean;
  error: string | null;
  
  requestLocation: () => Promise<void>;
  calculateDistance: (lat: number, lng: number) => number | null;
}

export const useGeolocationStore = create<GeolocationState>((set, get) => ({
  userLocation: null,
  permissionGranted: false,
  loading: false,
  error: null,
  
  requestLocation: async () => {
    set({ loading: true, error: null });
    
    if (!navigator.geolocation) {
      set({ 
        error: 'Géolocalisation non supportée par votre navigateur',
        loading: false 
      });
      return;
    }
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      set({
        userLocation: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        permissionGranted: true,
        loading: false,
      });
    } catch (error) {
      set({
        error: 'Permission de géolocalisation refusée',
        loading: false,
      });
    }
  },
  
  calculateDistance: (lat: number, lng: number) => {
    const { userLocation } = get();
    if (!userLocation) return null;
    
    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = (lat - userLocation.latitude) * Math.PI / 180;
    const dLon = (lng - userLocation.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * 
      Math.cos(lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
}));
```


## Firebase Functions

### License Management Functions

```typescript
// lib/firebase/licenses.ts
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from './config';
import { LicenseConfig, FournisseurSubscription, ProductUsage } from '@/types';

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
  licenseTier: string,
  priceUSD: number
): Promise<string> {
  const subscriptionsRef = collection(db, 'subscriptions');
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  
  const subscription: Omit<FournisseurSubscription, 'id'> = {
    fournisseurId,
    licenseTier: licenseTier as any,
    startDate,
    endDate,
    status: 'active',
    autoRenew: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const docRef = await setDoc(doc(subscriptionsRef), subscription);
  
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
```

### Multi-Category Product Functions

```typescript
// lib/firebase/products.ts (extended)
import { collection, addDoc, query, where, getDocs, orderBy, GeoPoint } from 'firebase/firestore';
import { db } from './config';
import { Product, ProductCategory } from '@/types';

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
      if (p.location) {
        const distance = calculateDistance(
          filters.userLocation!.latitude,
          filters.userLocation!.longitude,
          p.location.latitude,
          p.location.longitude
        );
        return { ...p, distance };
      }
      return p;
    });
    
    // Filter by max distance
    if (filters.maxDistance) {
      products = products.filter(p => 
        p.distance !== undefined && p.distance <= filters.maxDistance!
      );
    }
    
    // Sort by distance
    products.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
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
```

### Contact Request Functions

```typescript
// lib/firebase/contactRequests.ts
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { ContactRequest } from '@/types';

export async function createContactRequest(
  profileId: string,
  clientId: string,
  intermediaryId: string,
  message?: string
): Promise<string> {
  const requestsRef = collection(db, 'contactRequests');
  const request: Omit<ContactRequest, 'id'> = {
    profileId,
    clientId,
    intermediaryId,
    status: 'pending',
    message,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const docRef = await addDoc(requestsRef, request);
  
  // Create notification for intermediary
  await createNotification({
    userId: intermediaryId,
    type: 'contact_request',
    title: 'Nouvelle demande de contact',
    message: `Un client souhaite obtenir les coordonnées d'un profil`,
    data: { requestId: docRef.id, profileId },
    isRead: false,
    createdAt: new Date(),
  });
  
  return docRef.id;
}

export async function getContactRequestsByIntermediary(
  intermediaryId: string
): Promise<ContactRequest[]> {
  const requestsRef = collection(db, 'contactRequests');
  const q = query(requestsRef, where('intermediaryId', '==', intermediaryId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ContactRequest[];
}

export async function updateContactRequestStatus(
  requestId: string,
  status: ContactRequest['status']
): Promise<void> {
  const requestRef = doc(db, 'contactRequests', requestId);
  await updateDoc(requestRef, {
    status,
    updatedAt: new Date(),
    ...(status === 'shared' && { sharedAt: new Date() }),
  });
}
```

## Component Designs

### 1. Category Selector Component

```typescript
// components/CategorySelector.tsx
'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, UtensilsCrossed, Hotel, Heart } from 'lucide-react';
import { useCategoryStore } from '@/store/categoryStore';
import { ProductCategory } from '@/types';
import { useRouter } from 'next/navigation';

const categories = [
  { 
    id: 'ecommerce' as ProductCategory, 
    name: 'E-commerce', 
    icon: ShoppingBag, 
    color: 'bg-blue-500',
    route: '/products'
  },
  { 
    id: 'restaurant' as ProductCategory, 
    name: 'Restaurants', 
    icon: UtensilsCrossed, 
    color: 'bg-orange-500',
    route: '/restaurants'
  },
  { 
    id: 'hotel' as ProductCategory, 
    name: 'Hôtels', 
    icon: Hotel, 
    color: 'bg-purple-500',
    route: '/hotels'
  },
  { 
    id: 'dating' as ProductCategory, 
    name: 'Rencontres', 
    icon: Heart, 
    color: 'bg-pink-500',
    route: '/dating'
  },
];

export function CategorySelector() {
  const { selectedCategory, setCategory } = useCategoryStore();
  const router = useRouter();
  
  const handleCategoryClick = (category: ProductCategory, route: string) => {
    setCategory(category);
    router.push(route);
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {categories.map((cat, index) => (
        <motion.button
          key={cat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleCategoryClick(cat.id, cat.route)}
          className={`${cat.color} p-6 rounded-lg hover:shadow-xl transition-all transform hover:scale-105 text-white`}
        >
          <cat.icon className="mx-auto mb-3" size={48} />
          <h3 className="font-bold text-lg">{cat.name}</h3>
        </motion.button>
      ))}
    </div>
  );
}
```

### 2. License Upgrade Modal

```typescript
// components/LicenseUpgradeModal.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Zap } from 'lucide-react';
import { useLicenseStore } from '@/store/licenseStore';
import { LicenseTier } from '@/types';
import toast from 'react-hot-toast';

interface LicenseUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LicenseUpgradeModal({ isOpen, onClose }: LicenseUpgradeModalProps) {
  const { licenses, currentSubscription, upgradeLicense } = useLicenseStore();
  const [loading, setLoading] = useState(false);
  
  const handleUpgrade = async (tier: LicenseTier) => {
    setLoading(true);
    try {
      await upgradeLicense(tier);
      toast.success('Licence mise à niveau avec succès !');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la mise à niveau');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Choisissez votre licence</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {licenses.map((license) => {
              const isCurrent = currentSubscription?.licenseTier === license.tier;
              
              return (
                <div
                  key={license.id}
                  className={`border-2 rounded-lg p-6 ${
                    isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  {isCurrent && (
                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full inline-block mb-3">
                      Plan actuel
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2">{license.name}</h3>
                  <div className="text-3xl font-bold text-green-600 mb-4">
                    ${license.priceUSD}
                    <span className="text-sm text-gray-600">/an</span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 font-semibold mb-2">
                      {license.productQuota === -1 ? 'Illimité' : license.productQuota} produits
                    </p>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {license.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {!isCurrent && (
                    <button
                      onClick={() => handleUpgrade(license.tier)}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
                    >
                      <Zap size={16} />
                      Mettre à niveau
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```


### 3. Restaurant Card Component

```typescript
// components/RestaurantCard.tsx
'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Star } from 'lucide-react';
import { Product } from '@/types';
import { useGeolocationStore } from '@/store/geolocationStore';
import Link from 'next/link';

interface RestaurantCardProps {
  restaurant: Product;
  index: number;
}

export function RestaurantCard({ restaurant, index }: RestaurantCardProps) {
  const { calculateDistance } = useGeolocationStore();
  
  const distance = restaurant.location 
    ? calculateDistance(restaurant.location.latitude, restaurant.location.longitude)
    : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/restaurants/${restaurant.id}`}
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all block"
      >
        <div className="relative h-48">
          <img
            src={restaurant.images[0]}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {restaurant.restaurantData?.priceRange}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
          
          <div className="flex items-center gap-1 mb-2">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="text-sm font-semibold">{restaurant.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-600">({restaurant.reviewCount})</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {restaurant.restaurantData?.cuisineType.join(', ')}
          </p>
          
          {distance !== null && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <MapPin size={14} />
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock size={14} />
            <span>Ouvert aujourd'hui</span>
          </div>
          
          {restaurant.restaurantData?.features && (
            <div className="flex flex-wrap gap-1 mt-3">
              {restaurant.restaurantData.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
```

### 4. Dating Profile Card Component

```typescript
// components/DatingProfileCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Heart, MapPin, MessageCircle } from 'lucide-react';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DatingProfileCardProps {
  profile: Product;
  index: number;
}

export function DatingProfileCard({ profile, index }: DatingProfileCardProps) {
  const router = useRouter();
  
  const handleContactRequest = () => {
    router.push(`/chat?intermediary=${profile.fournisseurId}&profile=${profile.id}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
    >
      <div className="relative h-64">
        <img
          src={profile.images[0]}
          alt={profile.datingProfile?.firstName}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Heart size={14} />
          {profile.datingProfile?.status === 'available' ? 'Disponible' : 'Indisponible'}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl">
            {profile.datingProfile?.firstName}, {profile.datingProfile?.age}
          </h3>
          <span className="text-sm text-gray-600 capitalize">
            {profile.datingProfile?.gender}
          </span>
        </div>
        
        {profile.location && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <MapPin size={14} />
            <span>{profile.location.city}</span>
          </div>
        )}
        
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {profile.description}
        </p>
        
        {profile.datingProfile?.interests && (
          <div className="flex flex-wrap gap-1 mb-4">
            {profile.datingProfile.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
        
        <button
          onClick={handleContactRequest}
          className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} />
          Demander le contact
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Vous serez mis en relation avec l'intermédiaire
        </p>
      </div>
    </motion.div>
  );
}
```

### 5. Geolocation Capture Component

```typescript
// components/GeolocationCapture.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader, AlertCircle } from 'lucide-react';
import { useGeolocationStore } from '@/store/geolocationStore';

interface GeolocationCaptureProps {
  onLocationCaptured: (lat: number, lng: number) => void;
  warningMessage?: string;
}

export function GeolocationCapture({ 
  onLocationCaptured, 
  warningMessage = "Votre position actuelle sera utilisée comme localisation"
}: GeolocationCaptureProps) {
  const { userLocation, loading, error, requestLocation } = useGeolocationStore();
  const [captured, setCaptured] = useState(false);
  
  useEffect(() => {
    if (userLocation && !captured) {
      onLocationCaptured(userLocation.latitude, userLocation.longitude);
      setCaptured(true);
    }
  }, [userLocation, captured, onLocationCaptured]);
  
  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-800 mb-2">
            {warningMessage}
          </p>
          
          {!userLocation && !loading && !error && (
            <button
              onClick={requestLocation}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              <MapPin size={16} />
              Capturer ma position
            </button>
          )}
          
          {loading && (
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <Loader className="animate-spin" size={16} />
              <span>Capture de la position en cours...</span>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          
          {userLocation && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <MapPin size={16} />
              <span>Position capturée: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 6. Product Quota Display Component

```typescript
// components/ProductQuotaDisplay.tsx
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, Zap } from 'lucide-react';
import { useLicenseStore } from '@/store/licenseStore';
import { useAuthStore } from '@/store/authStore';

interface ProductQuotaDisplayProps {
  onUpgradeClick: () => void;
}

export function ProductQuotaDisplay({ onUpgradeClick }: ProductQuotaDisplayProps) {
  const { user } = useAuthStore();
  const { productUsage, fetchProductUsage } = useLicenseStore();
  
  useEffect(() => {
    if (user?.id) {
      fetchProductUsage(user.id);
    }
  }, [user, fetchProductUsage]);
  
  if (!productUsage) return null;
  
  const percentage = productUsage.quota === -1 
    ? 0 
    : (productUsage.currentCount / productUsage.quota) * 100;
  
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 90;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-4 mb-6 ${
        isCritical ? 'bg-red-50 border-2 border-red-200' :
        isWarning ? 'bg-yellow-50 border-2 border-yellow-200' :
        'bg-blue-50 border-2 border-blue-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isCritical ? 'bg-red-500' :
            isWarning ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}>
            <Package className="text-white" size={24} />
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">
              Quota de produits
            </p>
            <p className="text-sm text-gray-600">
              {productUsage.currentCount} / {productUsage.quota === -1 ? '∞' : productUsage.quota} utilisés
            </p>
          </div>
        </div>
        
        {percentage >= 80 && productUsage.quota !== -1 && (
          <button
            onClick={onUpgradeClick}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Zap size={16} />
            Mettre à niveau
          </button>
        )}
      </div>
      
      {productUsage.quota !== -1 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isCritical ? 'bg-red-500' :
                isWarning ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          {isWarning && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <AlertTriangle size={14} className={isCritical ? 'text-red-600' : 'text-yellow-600'} />
              <span className={isCritical ? 'text-red-600' : 'text-yellow-600'}>
                {isCritical 
                  ? 'Quota presque atteint ! Mettez à niveau pour continuer.'
                  : 'Attention, vous approchez de votre quota.'}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
```

## Page Implementations

### 1. Restaurants Listing Page

```typescript
// app/restaurants/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, Search } from 'lucide-react';
import { getProductsByCategory } from '@/lib/firebase/products';
import { useGeolocationStore } from '@/store/geolocationStore';
import { useCategoryStore } from '@/store/categoryStore';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Product } from '@/types';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const { userLocation, requestLocation } = useGeolocationStore();
  const { filters, setFilters } = useCategoryStore();
  
  useEffect(() => {
    loadRestaurants();
  }, [filters, userLocation]);
  
  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await getProductsByCategory('restaurant', {
        ...filters,
        userLocation: userLocation || undefined,
      });
      setRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Restaurants</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un restaurant..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* Location Button */}
            <button
              onClick={requestLocation}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <MapPin size={20} />
              Près de moi
            </button>
            
            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter size={20} />
              Filtres
            </button>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h3 className="font-bold text-lg mb-4">Filtres</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gamme de prix
                </label>
                <select
                  value={filters.priceRange || ''}
                  onChange={(e) => setFilters({ priceRange: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous</option>
                  <option value="€">€ - Économique</option>
                  <option value="€€">€€ - Modéré</option>
                  <option value="€€€">€€€ - Cher</option>
                  <option value="€€€€">€€€€ - Très cher</option>
                </select>
              </div>
              
              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance maximale
                </label>
                <select
                  value={filters.distance || ''}
                  onChange={(e) => setFilters({ distance: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Toutes</option>
                  <option value="1">1 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                </select>
              </div>
              
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ city: e.target.value })}
                  placeholder="Entrez une ville"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
            ))}
          </div>
        )}
        
        {!loading && restaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun restaurant trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
```


### 2. Dating Profiles Page

```typescript
// app/dating/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Heart, Search } from 'lucide-react';
import { getProductsByCategory } from '@/lib/firebase/products';
import { useCategoryStore } from '@/store/categoryStore';
import { DatingProfileCard } from '@/components/DatingProfileCard';
import { Product } from '@/types';

export default function DatingPage() {
  const [profiles, setProfiles] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [ageRange, setAgeRange] = useState({ min: 18, max: 65 });
  const [selectedGender, setSelectedGender] = useState<string>('');
  
  const { filters, setFilters } = useCategoryStore();
  
  useEffect(() => {
    loadProfiles();
  }, [filters]);
  
  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await getProductsByCategory('dating', filters);
      
      // Apply age and gender filters
      let filtered = data;
      if (selectedGender) {
        filtered = filtered.filter(p => p.datingProfile?.gender === selectedGender);
      }
      filtered = filtered.filter(p => 
        p.datingProfile && 
        p.datingProfile.age >= ageRange.min && 
        p.datingProfile.age <= ageRange.max
      );
      
      setProfiles(filtered);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="text-pink-500" size={48} />
            <h1 className="text-4xl font-bold text-gray-900">Rencontres</h1>
          </div>
          <p className="text-gray-600 text-lg">Trouvez la personne qui vous correspond</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par ville, intérêts..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter size={20} />
            Filtres
          </button>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h3 className="font-bold text-lg mb-4">Filtres</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              {/* Age Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge: {ageRange.min} - {ageRange.max} ans
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange({ ...ageRange, min: Number(e.target.value) })}
                    min="18"
                    max="100"
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange({ ...ageRange, max: Number(e.target.value) })}
                    min="18"
                    max="100"
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ city: e.target.value })}
                  placeholder="Entrez une ville"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <button
              onClick={loadProfiles}
              className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Appliquer les filtres
            </button>
          </motion.div>
        )}
        
        {/* Privacy Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Protection de la vie privée:</strong> Les coordonnées des profils ne sont pas affichées publiquement. 
            Pour obtenir un contact, vous devez discuter avec l'intermédiaire qui a ajouté le profil.
          </p>
        </div>
        
        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile, index) => (
              <DatingProfileCard key={profile.id} profile={profile} index={index} />
            ))}
          </div>
        )}
        
        {!loading && profiles.length === 0 && (
          <div className="text-center py-12">
            <Heart className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-gray-500 text-lg">Aucun profil trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Add Restaurant/Hotel Form

```typescript
// app/dashboard/fournisseur/add-listing/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, MapPin, Save } from 'lucide-react';
import { GeolocationCapture } from '@/components/GeolocationCapture';
import { ProductQuotaDisplay } from '@/components/ProductQuotaDisplay';
import { LicenseUpgradeModal } from '@/components/LicenseUpgradeModal';
import { createMultiCategoryProduct } from '@/lib/firebase/products';
import { uploadImages } from '@/lib/firebase/storage';
import { useAuthStore } from '@/store/authStore';
import { useLicenseStore } from '@/store/licenseStore';
import { ProductCategory } from '@/types';
import toast from 'react-hot-toast';

export default function AddListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { checkQuota } = useLicenseStore();
  
  const [category, setCategory] = useState<ProductCategory>('restaurant');
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    images: [] as File[],
    
    // Restaurant fields
    cuisineType: [] as string[],
    priceRange: '€€' as any,
    openingHours: {},
    features: [] as string[],
    
    // Hotel fields
    starRating: 3 as any,
    roomTypes: [] as any[],
    checkInTime: '14:00',
    checkOutTime: '11:00',
    amenities: [] as string[],
  });
  
  const handleLocationCaptured = (lat: number, lng: number) => {
    setLocation({ latitude: lat, longitude: lng });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, images: files });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check quota
    if (!checkQuota()) {
      toast.error('Quota de produits atteint');
      setShowUpgradeModal(true);
      return;
    }
    
    if (!location) {
      toast.error('Veuillez capturer votre position');
      return;
    }
    
    if (!user) return;
    
    setLoading(true);
    try {
      // Upload images
      const imageUrls = await uploadImages(formData.images, `listings/${user.id}`);
      
      // Create product
      const productData: any = {
        name: formData.name,
        description: formData.description,
        images: imageUrls,
        serviceCategory: category,
        category: category,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: formData.address,
          city: formData.city,
          country: formData.country,
        },
        isActive: true,
        rating: 0,
        reviewCount: 0,
        views: 0,
        sales: 0,
      };
      
      if (category === 'restaurant') {
        productData.restaurantData = {
          cuisineType: formData.cuisineType,
          priceRange: formData.priceRange,
          openingHours: formData.openingHours,
          features: formData.features,
        };
      } else if (category === 'hotel') {
        productData.hotelData = {
          starRating: formData.starRating,
          roomTypes: formData.roomTypes,
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
          amenities: formData.amenities,
        };
      }
      
      await createMultiCategoryProduct(productData, user.id);
      
      toast.success(`${category === 'restaurant' ? 'Restaurant' : 'Hôtel'} ajouté avec succès !`);
      router.push('/dashboard/fournisseur/products');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ajouter un établissement</h1>
        
        <ProductQuotaDisplay onUpgradeClick={() => setShowUpgradeModal(true)} />
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'établissement
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCategory('restaurant')}
                className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                  category === 'restaurant'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Restaurant
              </button>
              <button
                type="button"
                onClick={() => setCategory('hotel')}
                className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                  category === 'hotel'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Hôtel
              </button>
            </div>
          </div>
          
          {/* Geolocation Capture */}
          <GeolocationCapture
            onLocationCaptured={handleLocationCaptured}
            warningMessage={`Votre position actuelle sera utilisée comme localisation du ${category === 'restaurant' ? 'restaurant' : 'hôtel'}`}
          />
          
          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Images Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
              <Upload className="mx-auto mb-2 text-gray-400" size={48} />
              <p className="text-sm text-gray-600 mb-2">
                Cliquez pour ajouter des photos (min: {category === 'restaurant' ? 3 : 5}, max: {category === 'restaurant' ? 10 : 20})
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
              >
                Choisir des photos
              </label>
              {formData.images.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  {formData.images.length} photo(s) sélectionnée(s)
                </p>
              )}
            </div>
          </div>
          
          {/* Category-specific fields would go here */}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !location}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Création en cours...
              </>
            ) : (
              <>
                <Save size={20} />
                Créer l'établissement
              </>
            )}
          </button>
        </form>
        
        <LicenseUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </div>
    </div>
  );
}
```

## Route Structure

```
/restaurants
  - Restaurant listings with geolocation

/hotels
  - Hotel listings with geolocation

/dating
  - Dating profiles with privacy protection

/dashboard/fournisseur/add-listing
  - Add restaurant/hotel/dating profile

/dashboard/fournisseur/licenses
  - View and upgrade license

/dashboard/admin/licenses
  - Manage all licenses and subscriptions

/dashboard/admin/contact-requests
  - View and manage dating contact requests
```

## Implementation Notes

1. **Zustand Integration**: All state management uses Zustand stores (categoryStore, licenseStore, geolocationStore)
2. **Geolocation**: Browser Geolocation API captures position when adding restaurants/hotels
3. **Privacy**: Dating profiles hide contact info, force intermediary communication
4. **Quota Enforcement**: Check quota before allowing product creation
5. **Multi-Category**: Single Product type with discriminated unions for category-specific data
6. **Distance Calculation**: Haversine formula for accurate distance measurements
7. **Firebase Integration**: Extend existing Firebase functions for new features

