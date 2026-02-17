# Documentation des Extensions de la Plateforme Multi-Services

## Vue d'ensemble

Ce document décrit les extensions apportées à la plateforme InterAppshop pour supporter les services de restaurants, hôtels et rencontres, ainsi que le système de licences annuelles.

## Table des matières

1. [Nouveaux Stores Zustand](#nouveaux-stores-zustand)
2. [Fonctions Firebase](#fonctions-firebase)
3. [Composants UI](#composants-ui)
4. [Pages](#pages)
5. [Configuration Firebase](#configuration-firebase)
6. [Guide d'utilisation](#guide-dutilisation)

---

## Nouveaux Stores Zustand

### 1. categoryStore.ts

Gère la catégorie active et les filtres de recherche.

```typescript
interface CategoryState {
  selectedCategory: ProductCategory;
  filters: CategoryFilters;
  setCategory: (category: ProductCategory) => void;
  setFilters: (filters: Partial<CategoryFilters>) => void;
  clearFilters: () => void;
}
```

**Utilisation:**
```typescript
import { useCategoryStore } from '@/store/categoryStore';

const { selectedCategory, filters, setCategory, setFilters } = useCategoryStore();

// Changer de catégorie
setCategory('restaurant');

// Appliquer des filtres
setFilters({ city: 'Paris', priceRange: '€€' });
```

### 2. licenseStore.ts

Gère les licences, abonnements et quotas de produits.

```typescript
interface LicenseState {
  licenses: LicenseConfig[];
  currentSubscription: FournisseurSubscription | null;
  productUsage: ProductUsage | null;
  loading: boolean;
  
  fetchLicenses: () => Promise<void>;
  fetchSubscription: (fournisseurId: string) => Promise<void>;
  fetchProductUsage: (fournisseurId: string) => Promise<void>;
  upgradeLicense: (tier: LicenseTier, fournisseurId: string) => Promise<void>;
  checkQuota: () => boolean;
}
```

**Utilisation:**
```typescript
import { useLicenseStore } from '@/store/licenseStore';

const { 
  licenses, 
  currentSubscription, 
  productUsage, 
  checkQuota,
  upgradeLicense 
} = useLicenseStore();

// Vérifier si le quota est disponible
if (checkQuota()) {
  // Créer un produit
}

// Mettre à niveau la licence
await upgradeLicense('premium', userId);
```

### 3. geolocationStore.ts

Gère la géolocalisation et le calcul de distances.

```typescript
interface GeolocationState {
  userLocation: { latitude: number; longitude: number } | null;
  permissionGranted: boolean;
  loading: boolean;
  error: string | null;
  
  requestLocation: () => Promise<void>;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}
```

**Utilisation:**
```typescript
import { useGeolocationStore } from '@/store/geolocationStore';

const { userLocation, requestLocation, calculateDistance } = useGeolocationStore();

// Demander la position
await requestLocation();

// Calculer la distance
const distance = calculateDistance(
  userLocation.latitude,
  userLocation.longitude,
  restaurantLat,
  restaurantLon
);
```

---

## Fonctions Firebase

### lib/firebase/licenses.ts

#### getAllLicenses()
Récupère toutes les configurations de licences disponibles.

```typescript
const licenses = await getAllLicenses();
```

#### getFournisseurSubscription(fournisseurId: string)
Récupère l'abonnement actif d'un fournisseur.

```typescript
const subscription = await getFournisseurSubscription(userId);
```

#### getProductUsage(fournisseurId: string)
Récupère ou initialise le compteur de produits d'un fournisseur.

```typescript
const usage = await getProductUsage(userId);
```

#### updateProductUsage(fournisseurId: string, increment: number)
Met à jour le compteur de produits (incrémente ou décrémente).

```typescript
await updateProductUsage(userId, 1); // Ajouter 1 produit
await updateProductUsage(userId, -1); // Retirer 1 produit
```

#### createSubscription(fournisseurId: string, tier: LicenseTier, priceUSD: number)
Crée un nouvel abonnement annuel pour un fournisseur.

```typescript
await createSubscription(userId, 'premium', 299);
```

### lib/firebase/products.ts (Extensions)

#### createMultiCategoryProduct(productData: Partial<Product>)
Crée un produit multi-catégorie avec vérification de quota.

```typescript
const productId = await createMultiCategoryProduct({
  name: 'Restaurant Le Gourmet',
  serviceCategory: 'restaurant',
  location: { latitude: 48.8566, longitude: 2.3522, city: 'Paris' },
  restaurantData: {
    cuisineType: 'Française',
    priceRange: '€€€',
    // ...
  }
});
```

#### getProductsByCategory(category: ProductCategory, filters?: CategoryFilters)
Récupère les produits d'une catégorie avec filtres et calcul de distance.

```typescript
const restaurants = await getProductsByCategory('restaurant', {
  city: 'Paris',
  priceRange: '€€',
  userLocation: { latitude: 48.8566, longitude: 2.3522 },
  maxDistance: 5000 // 5km
});
```

### lib/firebase/contactRequests.ts

#### createContactRequest(data: Omit<ContactRequest, 'id' | 'createdAt' | 'updatedAt'>)
Crée une demande de contact pour un profil de rencontre.

```typescript
await createContactRequest({
  profileId: 'profile123',
  clientId: 'client456',
  intermediaryId: 'intermediary789',
  status: 'pending',
  message: 'Je souhaite entrer en contact'
});
```

#### getContactRequestsByIntermediary(intermediaryId: string)
Récupère toutes les demandes de contact d'un intermédiaire.

```typescript
const requests = await getContactRequestsByIntermediary(userId);
```

#### updateContactRequestStatus(requestId: string, status: ContactRequestStatus)
Met à jour le statut d'une demande de contact.

```typescript
await updateContactRequestStatus(requestId, 'approved');
```

---

## Composants UI

### CategorySelector
Affiche 4 cartes pour naviguer entre les catégories.

```tsx
import { CategorySelector } from '@/components/CategorySelector';

<CategorySelector />
```

### ProductQuotaDisplay
Affiche le quota de produits avec barre de progression.

```tsx
import { ProductQuotaDisplay } from '@/components/ProductQuotaDisplay';

<ProductQuotaDisplay fournisseurId={userId} />
```

### LicenseUpgradeModal
Modal pour comparer et mettre à niveau les licences.

```tsx
import { LicenseUpgradeModal } from '@/components/LicenseUpgradeModal';

<LicenseUpgradeModal 
  isOpen={showModal} 
  onClose={() => setShowModal(false)} 
/>
```

### GeolocationCapture
Composant pour capturer la position GPS de l'utilisateur.

```tsx
import { GeolocationCapture } from '@/components/GeolocationCapture';

<GeolocationCapture
  warningMessage="Votre position sera utilisée comme localisation"
  onLocationCaptured={(lat, lng) => {
    setLocation({ latitude: lat, longitude: lng });
  }}
/>
```

### RestaurantCard, HotelCard, DatingProfileCard
Cartes d'affichage pour chaque type de service.

```tsx
import { RestaurantCard } from '@/components/RestaurantCard';
import { HotelCard } from '@/components/HotelCard';
import { DatingProfileCard } from '@/components/DatingProfileCard';

<RestaurantCard product={restaurant} />
<HotelCard product={hotel} />
<DatingProfileCard product={profile} />
```

---

## Pages

### Pages Publiques

- `/restaurants` - Liste des restaurants avec filtres
- `/hotels` - Liste des hôtels avec filtres
- `/dating` - Liste des profils de rencontres avec filtres

### Pages Fournisseur

- `/dashboard/fournisseur/add-listing` - Ajouter un restaurant ou hôtel
- `/dashboard/fournisseur/add-dating-profile` - Ajouter un profil de rencontre
- `/dashboard/fournisseur/licenses` - Gérer sa licence

### Pages Admin

- `/dashboard/admin/licenses` - Gérer toutes les licences
- `/dashboard/admin/contact-requests` - Gérer les demandes de contact
- `/dashboard/admin/verify-profiles` - Vérifier les profils de rencontres

---

## Configuration Firebase

### Collections Firestore

#### licenses
```typescript
{
  id: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  name: string;
  productQuota: number; // -1 pour illimité
  priceUSD: number;
  features: string[];
  isActive: boolean;
}
```

#### subscriptions
```typescript
{
  id: string;
  fournisseurId: string;
  licenseTier: LicenseTier;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}
```

#### productUsage
```typescript
{
  fournisseurId: string; // Document ID
  currentCount: number;
  quota: number;
  lastUpdated: Timestamp;
}
```

#### contactRequests
```typescript
{
  id: string;
  profileId: string;
  clientId: string;
  intermediaryId: string;
  status: 'pending' | 'approved' | 'rejected' | 'shared';
  message: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sharedAt?: Timestamp;
}
```

### Initialisation des licences

Exécuter le script d'initialisation:

```bash
npm run init-licenses
```

Ou manuellement:

```bash
npx ts-node scripts/initializeLicenses.ts
```

### Déploiement des indexes

```bash
firebase deploy --only firestore:indexes
```

### Déploiement des security rules

```bash
firebase deploy --only firestore:rules
```

---

## Guide d'utilisation

### Pour les Fournisseurs

#### 1. Ajouter un restaurant ou hôtel

1. Aller sur `/dashboard/fournisseur/add-listing`
2. Vérifier le quota disponible en haut de page
3. Sélectionner le type (Restaurant ou Hôtel)
4. Capturer la position GPS
5. Remplir les informations
6. Uploader les images (min 3 pour restaurant, min 5 pour hôtel)
7. Soumettre le formulaire

#### 2. Ajouter un profil de rencontre

1. Aller sur `/dashboard/fournisseur/add-dating-profile`
2. Vérifier le quota disponible
3. Remplir les informations du profil
4. Uploader 2-8 photos
5. Ajouter les informations de contact (privées)
6. Soumettre pour vérification admin

#### 3. Gérer sa licence

1. Aller sur `/dashboard/fournisseur/licenses`
2. Voir la licence actuelle et le quota
3. Comparer les licences disponibles
4. Mettre à niveau si nécessaire

### Pour les Clients

#### 1. Rechercher un restaurant

1. Aller sur `/restaurants`
2. Utiliser la barre de recherche
3. Cliquer sur "Près de moi" pour activer la géolocalisation
4. Appliquer des filtres (prix, distance, ville)
5. Cliquer sur une carte pour voir les détails

#### 2. Demander un contact (profil dating)

1. Aller sur `/dating`
2. Parcourir les profils
3. Cliquer sur "Demander le contact"
4. Envoyer un message à l'intermédiaire
5. Attendre que l'intermédiaire partage le contact

### Pour les Admins

#### 1. Vérifier les profils de rencontres

1. Aller sur `/dashboard/admin/verify-profiles`
2. Voir tous les profils en attente
3. Examiner les photos et informations
4. Approuver ou rejeter avec raison
5. L'intermédiaire reçoit une notification

#### 2. Gérer les licences

1. Aller sur `/dashboard/admin/licenses`
2. Voir tous les abonnements
3. Filtrer par tier
4. Exporter en CSV si nécessaire

---

## Formule de calcul de distance (Haversine)

La distance entre deux points GPS est calculée avec la formule Haversine:

```typescript
const R = 6371e3; // Rayon de la Terre en mètres
const φ1 = lat1 * Math.PI / 180;
const φ2 = lat2 * Math.PI / 180;
const Δφ = (lat2 - lat1) * Math.PI / 180;
const Δλ = (lon2 - lon1) * Math.PI / 180;

const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

const distance = R * c; // Distance en mètres
```

---

## Sécurité et Confidentialité

### Profils de rencontres

- Les informations de contact (téléphone, email, WhatsApp) ne sont JAMAIS visibles publiquement
- Seul l'intermédiaire peut voir ces informations
- Le contact n'est partagé qu'après approbation de l'intermédiaire
- Tous les profils nécessitent une vérification admin avant d'être visibles

### Système de licences

- Les quotas sont vérifiés AVANT chaque création de produit
- Les abonnements expirent automatiquement après 1 an
- L'auto-renouvellement peut être activé/désactivé
- Seuls les admins peuvent créer/modifier des abonnements

---

## Support et Maintenance

Pour toute question ou problème:

1. Consulter cette documentation
2. Vérifier les logs Firebase
3. Contacter l'équipe de développement

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2024
