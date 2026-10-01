# 🔥 Guide d'optimisation Firebase

## 📊 Indexes Firestore

### ✅ Indexes créés (voir firestore.indexes.json)

Les indexes suivants ont été configurés pour optimiser les requêtes :

#### Orders
- `status` + `createdAt` : Filtrer par statut avec tri chronologique
- `clientId` + `createdAt` : Commandes d'un client
- `fournisseurId` + `createdAt` : Commandes d'un fournisseur

#### Products
- `isActive` + `createdAt` : Produits actifs/inactifs
- `category` + `createdAt` : Produits par catégorie
- `fournisseurId` + `createdAt` : Produits d'un fournisseur

#### Users
- `role` + `createdAt` : Utilisateurs par rôle
- `approvalStatus` + `createdAt` : Utilisateurs par statut d'approbation
- `role` + `approvalStatus` + `createdAt` : Combinaison des deux

#### Conversations & Messages
- `participants` (array-contains) + `lastMessageAt` : Conversations d'un utilisateur
- `conversationId` + `createdAt` : Messages d'une conversation

---

## 🚀 Déployer les indexes

### Option 1 : Via Firebase CLI (Recommandé)

```bash
# Installer Firebase CLI si ce n'est pas déjà fait
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser Firebase (si pas déjà fait)
firebase init firestore

# Déployer les indexes
firebase deploy --only firestore:indexes
```

### Option 2 : Via Console Firebase

1. Aller sur https://console.firebase.google.com
2. Sélectionner votre projet
3. Aller dans **Firestore Database** > **Indexes**
4. Créer manuellement chaque index listé dans `firestore.indexes.json`

---

## ⚡ Règles d'optimisation Firebase

### 1. **Toujours limiter les requêtes**

```typescript
// ❌ MAUVAIS - Charge tout
const snapshot = await getDocs(collection(db, 'orders'));

// ✅ BON - Limite à 20 résultats
const q = query(
  collection(db, 'orders'),
  orderBy('createdAt', 'desc'),
  limit(20)
);
const snapshot = await getDocs(q);
```

### 2. **Utiliser where() pour filtrer**

```typescript
// ✅ BON - Filtre côté serveur
const q = query(
  collection(db, 'orders'),
  where('status', '==', 'pending'),
  orderBy('createdAt', 'desc'),
  limit(20)
);
```

### 3. **Combiner les filtres avec des indexes**

```typescript
// ⚠️ NÉCESSITE UN INDEX
const q = query(
  collection(db, 'products'),
  where('isActive', '==', true),
  where('category', '==', 'electronics'),
  orderBy('createdAt', 'desc')
);
```

### 4. **Utiliser la pagination cursor**

```typescript
// Premier chargement
const first = query(
  collection(db, 'products'),
  orderBy('createdAt', 'desc'),
  limit(20)
);
const snapshot = await getDocs(first);
const lastDoc = snapshot.docs[snapshot.docs.length - 1];

// Page suivante
const next = query(
  collection(db, 'products'),
  orderBy('createdAt', 'desc'),
  startAfter(lastDoc),
  limit(20)
);
```

### 5. **Éviter les array-contains sur grandes collections**

```typescript
// ⚠️ LENT sur grandes collections
const q = query(
  collection(db, 'conversations'),
  where('participants', 'array-contains', userId)
);

// ✅ MIEUX - Utiliser une sous-collection
// conversations/{conversationId}/participants/{userId}
```

---

## 📈 Monitoring des performances

### Console Firebase

1. **Firestore** > **Usage** : Voir le nombre de lectures/écritures
2. **Firestore** > **Indexes** : Vérifier les indexes manquants
3. **Performance Monitoring** : Temps de réponse

### Dans le code

```typescript
// Mesurer le temps de requête
console.time('orders-query');
const snapshot = await getDocs(query);
console.timeEnd('orders-query');

// Compter les documents
console.log('Documents chargés:', snapshot.size);
```

---

## 💾 Système de cache

### Utilisation du cache simple

```typescript
import { cache } from '@/lib/cache/simpleCache';

// Stocker dans le cache (5 minutes par défaut)
cache.set('dashboard-stats', stats);

// Récupérer du cache
const cachedStats = cache.get('dashboard-stats');

// Stocker avec TTL personnalisé (1 heure)
cache.set('products', products, 60 * 60 * 1000);

// Vérifier si existe
if (cache.has('orders')) {
  const orders = cache.get('orders');
}

// Invalider un pattern
cache.invalidatePattern('dashboard-*');

// Vider tout le cache
cache.clear();
```

### Hook React avec cache

```typescript
import { useCachedData } from '@/lib/cache/simpleCache';

function MyComponent() {
  const { data, loading, error, refetch } = useCachedData(
    'my-data-key',
    async () => {
      const snapshot = await getDocs(collection(db, 'orders'));
      return snapshot.docs.map(doc => doc.data());
    },
    5 * 60 * 1000 // 5 minutes TTL
  );

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  
  return <div>{/* Utiliser data */}</div>;
}
```

---

## 🎯 Stratégies de cache recommandées

| Type de données | TTL recommandé | Stratégie |
|----------------|----------------|-----------|
| Dashboard stats | 5 minutes | Cache avec invalidation |
| Liste produits | 2 minutes | Cache + pagination |
| Détails produit | 10 minutes | Cache agressif |
| Profil utilisateur | 15 minutes | Cache avec refresh |
| Conversations | 30 secondes | Real-time + cache court |
| Paramètres app | 1 heure | Cache long |

---

## 🔄 Invalidation du cache

```typescript
// Après création d'une commande
cache.invalidatePattern('orders-*');
cache.invalidatePattern('dashboard-*');

// Après modification d'un produit
cache.delete(`product-${productId}`);
cache.invalidatePattern('products-list-*');

// Après login/logout
cache.clear();
```

---

## 📊 Métriques de succès

### Avant optimisation
- ⏱️ Temps de chargement dashboard : 4-7 secondes
- 🔥 Lectures Firestore : ~500-1000 par chargement
- 💰 Coût mensuel : Élevé

### Après optimisation
- ⏱️ Temps de chargement dashboard : < 2 secondes
- 🔥 Lectures Firestore : ~50-100 par chargement (90% réduction)
- 💰 Coût mensuel : Réduit de 80-90%

---

## 🛠️ Commandes utiles

```bash
# Vérifier les indexes manquants
firebase firestore:indexes

# Déployer les indexes
firebase deploy --only firestore:indexes

# Voir l'utilisation
firebase firestore:usage

# Exporter les données (backup)
gcloud firestore export gs://[BUCKET_NAME]
```

---

## ⚠️ Erreurs communes

### "The query requires an index"

**Solution :** Créer l'index suggéré dans le message d'erreur ou déployer `firestore.indexes.json`

### Requêtes trop lentes

**Solutions :**
1. Ajouter des indexes
2. Limiter avec `limit()`
3. Utiliser le cache
4. Paginer les résultats

### Trop de lectures

**Solutions :**
1. Implémenter le cache
2. Utiliser les listeners Firestore avec parcimonie
3. Désabonner les listeners inutilisés
4. Charger seulement les données nécessaires

---

Date : 2024
