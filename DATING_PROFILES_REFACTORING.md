# Refactorisation des Profils de Rencontre

## Changements Effectués

### 1. Collection Firestore Séparée
Les profils de rencontre sont maintenant stockés dans une collection dédiée `datingProfiles` au lieu de la collection `products`.

**Avantages:**
- Séparation claire des données
- Pas de mélange avec les produits e-commerce
- Requêtes plus rapides et ciblées
- Structure de données optimisée pour les profils

### 2. Suppression du Système de Vérification
- Les profils sont maintenant actifs immédiatement après création (`isActive: true`)
- Pas besoin d'approbation admin
- Suppression de la page `/dashboard/admin/verify-profiles`
- Les profils apparaissent instantanément dans la liste publique

### 3. Nouveaux Fichiers Créés

#### `types/dating.ts`
Types TypeScript dédiés pour les profils de rencontre:
- `DatingProfile`: Structure complète du profil
- `DatingContactRequest`: Demandes de contact

#### `lib/firebase/datingProfiles.ts`
Fonctions Firebase pour gérer les profils:
- `createDatingProfile()`: Créer un profil
- `getDatingProfile()`: Récupérer un profil par ID
- `getDatingProfiles()`: Liste avec filtres (ville, genre, âge, distance)
- `getFournisseurDatingProfiles()`: Profils d'un fournisseur
- `updateDatingProfile()`: Mettre à jour un profil
- `deleteDatingProfile()`: Supprimer un profil
- `incrementProfileViews()`: Incrémenter les vues
- `createContactRequest()`: Créer une demande de contact
- `getContactRequestsByIntermediary()`: Demandes pour un intermédiaire
- `updateContactRequestStatus()`: Mettre à jour le statut

### 4. Pages Mises à Jour

#### `/app/dashboard/fournisseur/add-dating-profile/page.tsx`
- Utilise maintenant `createDatingProfile()` au lieu de `createMultiCategoryProduct()`
- Crée directement un profil actif
- Redirige vers `/dashboard/fournisseur/dating-profiles`

#### `/app/dashboard/fournisseur/dating-profiles/page.tsx`
- Utilise `getFournisseurDatingProfiles()` pour charger les profils
- Affiche uniquement les profils de rencontre du fournisseur
- Suppression via `deleteDatingProfile()`

#### `/app/dating/page.tsx`
- Utilise `getDatingProfiles()` pour charger tous les profils actifs
- Filtres: genre, âge, ville
- Pas de filtre `isActive` nécessaire (tous sont actifs)

#### `/app/dating/[id]/page.tsx`
- Utilise `getDatingProfile()` pour charger un profil spécifique
- Incrémente automatiquement les vues avec `incrementProfileViews()`

#### `/components/DatingProfileCard.tsx`
- Utilise le type `DatingProfile` au lieu de `Product`
- Accès direct aux propriétés (pas de `datingProfile.firstName`)

### 5. Règles Firestore

Ajout de règles pour les nouvelles collections:

```javascript
// Dating Profiles collection
match /datingProfiles/{profileId} {
  allow read: if true; // Public
  allow create: if isFournisseur();
  allow update: if isOwner || isAdmin();
  allow delete: if isOwner || isAdmin();
}

// Dating Contact Requests collection
match /datingContactRequests/{requestId} {
  allow read: if isClient || isIntermediary || isAdmin();
  allow create: if isAuthenticated();
  allow update: if isIntermediary || isAdmin();
  allow delete: if isAdmin();
}
```

## Structure de Données

### DatingProfile
```typescript
{
  id: string;
  fournisseurId: string;
  firstName: string;
  age: number;
  gender: 'homme' | 'femme' | 'autre';
  description: string;
  images: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  height?: number;
  skinColor?: string;
  eyeColor?: string;
  profession?: string;
  interests?: string[];
  status: 'available' | 'unavailable' | 'archived';
  contactInfo: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  rating: number;
  reviewCount: number;
  views: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Migration des Données Existantes

Si vous avez des profils existants dans la collection `products`, vous devrez les migrer:

```typescript
// Script de migration (à exécuter une fois)
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from './lib/firebase/config';
import { createDatingProfile } from './lib/firebase/datingProfiles';

async function migrateDatingProfiles() {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('serviceCategory', '==', 'dating'));
  const snapshot = await getDocs(q);
  
  for (const doc of snapshot.docs) {
    const product = doc.data();
    
    if (product.datingProfile) {
      const profileData = {
        fournisseurId: product.fournisseurId,
        firstName: product.datingProfile.firstName,
        age: product.datingProfile.age,
        gender: product.datingProfile.gender,
        description: product.description,
        images: product.images,
        location: product.location,
        height: product.datingProfile.height,
        skinColor: product.datingProfile.skinColor,
        eyeColor: product.datingProfile.eyeColor,
        profession: product.datingProfile.profession,
        interests: product.datingProfile.interests,
        status: product.datingProfile.status,
        contactInfo: product.datingProfile.contactInfo,
        rating: product.rating,
        reviewCount: product.reviewCount,
        views: product.views,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
      
      await createDatingProfile(profileData);
      console.log(`Migrated profile: ${product.datingProfile.firstName}`);
    }
  }
}
```

## Déploiement

1. Déployer les nouvelles règles Firestore:
```bash
firebase deploy --only firestore:rules
```

2. Créer les index Firestore nécessaires (si demandé par Firebase)

3. Tester la création d'un nouveau profil

4. Si nécessaire, exécuter le script de migration

## Notes Importantes

- Les profils sont maintenant publics dès leur création
- Les coordonnées restent privées (accessibles uniquement via demande de contact)
- La géolocalisation est toujours capturée automatiquement
- Le système de quota de licences s'applique toujours
- Les profils comptent dans le quota global de produits du fournisseur
