# Implémentation des Stores Zustand pour le Système Flexible

## Date: 2026-02-16

## Problème Résolu

L'erreur `cookieStore.get is not a function` était causée par l'utilisation d'API routes qui nécessitaient l'authentification côté serveur. Au lieu de créer des API routes complexes, nous avons utilisé le système de stores Zustand déjà en place dans l'application.

## Architecture Zustand

### Principe
Zustand est un gestionnaire d'état global léger pour React. L'application utilise déjà ce pattern pour:
- `authStore` - Authentification
- `walletStore` - Portefeuille
- `productsStore` - Produits
- `cartStore` - Panier
- etc.

### Avantages
✅ Pas besoin d'API routes pour les opérations CRUD simples
✅ Appels directs aux fonctions Firebase depuis le client
✅ Gestion d'état centralisée et réactive
✅ Cache automatique avec invalidation
✅ Code plus simple et maintenable

## Nouveaux Stores Créés

### 1. `paymentMethodsStore.ts`

Store pour gérer les méthodes de paiement (Mobile Money, Crypto, etc.)

**État:**
```typescript
{
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}
```

**Actions:**
- `fetchPaymentMethods()` - Récupère toutes les méthodes
- `fetchActivePaymentMethods()` - Récupère uniquement les méthodes actives
- `getPaymentMethodById(id)` - Récupère une méthode spécifique
- `createMethod(data)` - Crée une nouvelle méthode
- `updateMethod(id, data)` - Met à jour une méthode
- `toggleMethodStatus(id)` - Active/désactive une méthode
- `reset()` - Réinitialise le store

**Cache:**
- Durée: 5 minutes
- Rafraîchissement automatique si expiré
- Force refresh avec `forceRefresh: true`

### 2. Extension de `walletStore.ts`

Ajout des fonctionnalités pour les transactions flexibles

**Nouvel État:**
```typescript
{
  // État existant
  wallet: Wallet | null;
  transactions: Transaction[];
  
  // Nouvel état
  flexibleTransactions: FlexibleTransaction[];
  pendingTransactions: FlexibleTransaction[];
  loading: boolean;
  error: string | null;
}
```

**Nouvelles Actions:**
- `initiateFlexibleDeposit(userId, data)` - Initie un dépôt flexible
- `initiateFlexibleWithdrawal(userId, data)` - Initie un retrait flexible
- `fetchPendingTransactions(type?)` - Récupère les transactions en attente
- `fetchFlexibleTransactions(filters)` - Récupère avec filtres
- `validateDeposit(transactionId, adminId, notes?)` - Valide un dépôt
- `validateWithdrawal(transactionId, adminId, notes?)` - Valide un retrait
- `rejectDeposit(transactionId, adminId, reason)` - Rejette un dépôt
- `rejectWithdrawal(transactionId, adminId, reason)` - Rejette un retrait

## Pages Mises à Jour

### 1. `/dashboard/admin/payment-methods/page.tsx`

**Avant:**
```typescript
const [methods, setMethods] = useState([]);

const fetchMethods = async () => {
  const response = await fetch('/api/payment-methods');
  const data = await response.json();
  setMethods(data);
};
```

**Après:**
```typescript
const { 
  paymentMethods, 
  loading, 
  fetchPaymentMethods,
  createMethod,
  toggleMethodStatus
} = usePaymentMethodsStore();

useEffect(() => {
  fetchPaymentMethods();
}, []);
```

### 2. `/dashboard/admin/wallet-transactions/page.tsx`

**Avant:**
```typescript
const [transactions, setTransactions] = useState([]);

const fetchTransactions = async () => {
  const response = await fetch('/api/transactions/pending');
  const data = await response.json();
  setTransactions(data);
};
```

**Après:**
```typescript
const { 
  pendingTransactions, 
  loading,
  fetchPendingTransactions,
  validateDeposit,
  rejectDeposit
} = useWalletStore();

useEffect(() => {
  fetchPendingTransactions(filter === 'all' ? undefined : filter);
}, [filter]);
```

### 3. `/wallet/deposit/page.tsx`

**Avant:**
```typescript
const handleSubmit = async (data) => {
  const response = await fetch('/api/transactions/deposit', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};
```

**Après:**
```typescript
const { initiateFlexibleDeposit } = useWalletStore();

const handleSubmit = async (data) => {
  await initiateFlexibleDeposit(user.id, data);
};
```

### 4. `components/wallet/PaymentMethodSelector.tsx`

**Avant:**
```typescript
const [methods, setMethods] = useState([]);

const fetchPaymentMethods = async () => {
  const response = await fetch('/api/payment-methods?status=active');
  const data = await response.json();
  setMethods(data);
};
```

**Après:**
```typescript
const { 
  paymentMethods, 
  loading, 
  fetchActivePaymentMethods 
} = usePaymentMethodsStore();

useEffect(() => {
  fetchActivePaymentMethods();
}, []);
```

## Flux de Données

### Création d'une Méthode de Paiement

```
Admin Page
    ↓
usePaymentMethodsStore.createMethod(data)
    ↓
lib/firebase/paymentMethods.createPaymentMethod(data)
    ↓
Firestore: collection('paymentMethods').add()
    ↓
Store: Ajoute au tableau paymentMethods
    ↓
UI: Mise à jour automatique (réactivité Zustand)
```

### Validation d'un Dépôt

```
Admin Page
    ↓
useWalletStore.validateDeposit(id, adminId, notes)
    ↓
lib/firebase/flexibleWallet.validateFlexibleDeposit()
    ↓
Firestore: Transaction runTransaction()
    - Met à jour la transaction (status: completed)
    - Crédite le portefeuille
    ↓
Store: Rafraîchit pendingTransactions
    ↓
UI: Liste mise à jour automatiquement
```

### Initiation d'un Dépôt Client

```
Client Page
    ↓
useWalletStore.initiateFlexibleDeposit(userId, data)
    ↓
lib/firebase/flexibleWallet.initiateFlexibleDeposit()
    ↓
Firestore: Crée transaction (status: pending)
    ↓
Notifications: Envoie aux admins
    ↓
Store: Rafraîchit le wallet
    ↓
UI: Affiche confirmation
```

## API Routes Supprimées (Non Nécessaires)

Les routes suivantes ne sont plus nécessaires car remplacées par les stores:

- ❌ `/api/payment-methods` (GET/POST)
- ❌ `/api/payment-methods/[id]/toggle` (PATCH)
- ❌ `/api/transactions/pending` (GET)
- ❌ `/api/transactions/deposit` (POST)
- ❌ `/api/transactions/[id]/validate` (POST)
- ❌ `/api/transactions/[id]/reject` (POST)

**Note:** Ces fichiers peuvent être supprimés ou conservés pour référence, mais ne sont plus utilisés.

## Avantages de Cette Approche

### 1. Simplicité
- Moins de code à maintenir
- Pas de gestion de cookies/sessions côté serveur
- Appels directs aux fonctions Firebase

### 2. Performance
- Cache automatique avec Zustand
- Pas de round-trip serveur inutile
- Mises à jour réactives instantanées

### 3. Cohérence
- Même pattern que le reste de l'application
- Code uniforme et prévisible
- Facile à comprendre pour les nouveaux développeurs

### 4. Sécurité
- Les règles Firestore gèrent les permissions
- Authentification Firebase côté client
- Pas besoin de vérifier les cookies manuellement

## Règles Firestore Nécessaires

Pour sécuriser l'accès direct depuis le client, assurez-vous d'avoir ces règles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Méthodes de paiement - lecture publique, écriture admin
    match /paymentMethods/{methodId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Transactions - lecture propriétaire ou admin, écriture propriétaire
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
      
      allow update: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Portefeuilles - lecture/écriture propriétaire ou admin
    match /wallets/{walletId} {
      allow read: if request.auth != null && 
                    (walletId == request.auth.uid || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Tests à Effectuer

### Client
1. ✅ Aller sur `/wallet/deposit`
2. ✅ Sélectionner une méthode de paiement
3. ✅ Remplir le formulaire (nom + montant)
4. ✅ Confirmer le dépôt
5. ✅ Vérifier la redirection vers l'historique

### Admin - Méthodes de Paiement
1. ✅ Aller sur `/dashboard/admin/payment-methods`
2. ✅ Créer une nouvelle méthode
3. ✅ Activer/désactiver une méthode
4. ✅ Vérifier que les changements sont immédiats

### Admin - Transactions
1. ✅ Aller sur `/dashboard/admin/wallet-transactions`
2. ✅ Voir les transactions en attente
3. ✅ Filtrer par type (dépôt/retrait)
4. ✅ Approuver une transaction
5. ✅ Rejeter une transaction
6. ✅ Vérifier que la liste se met à jour

## Résumé

Le système utilise maintenant exclusivement les stores Zustand pour gérer l'état et les opérations CRUD. Les appels Firebase sont faits directement depuis le client, avec la sécurité gérée par les règles Firestore. Cette approche est plus simple, plus performante et cohérente avec le reste de l'application.

Plus besoin d'API routes pour ces fonctionnalités!
