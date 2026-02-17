# Système de Portefeuille et Mobile Money - Architecture Technique

## 1. Vue d'ensemble

Ce document décrit l'architecture technique du système de portefeuille électronique avec intégration Mobile Money pour la plateforme InterShop.

### 1.1 Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX DE TRANSACTIONS                      │
└─────────────────────────────────────────────────────────────┘

DÉPÔT:
Mobile Money Utilisateur → Compte InterShop → Portefeuille Utilisateur

RETRAIT:
Portefeuille Utilisateur → Compte InterShop → Mobile Money Utilisateur

PAIEMENT:
Portefeuille Client → Portefeuille Fournisseur
```

### 1.2 Composants principaux

1. **Wallet Service**: Gestion des portefeuilles et soldes
2. **Transaction Service**: Traitement des transactions
3. **Mobile Money Service**: Intégration avec les opérateurs
4. **Notification Service**: Alertes et confirmations
5. **Admin Dashboard**: Gestion et validation
6. **User Dashboard**: Interface utilisateur

## 2. Modèle de données

### 2.1 Collection: `wallets`

```typescript
interface Wallet {
  id: string;                    // ID unique du portefeuille
  userId: string;                // ID utilisateur propriétaire
  balance: number;               // Solde disponible (FCFA)
  pendingBalance: number;        // Solde en attente (FCFA)
  currency: 'XAF' | 'XOF';      // Devise (FCFA)
  status: 'active' | 'suspended' | 'closed';
  pin?: string;                  // Code PIN hashé (bcrypt)
  pinAttempts: number;           // Nombre de tentatives PIN
  lastPinAttempt?: Timestamp;    // Dernière tentative PIN
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```


### 2.2 Collection: `transactions`

```typescript
interface Transaction {
  id: string;                    // ID unique transaction
  walletId: string;              // ID portefeuille
  userId: string;                // ID utilisateur
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission';
  amount: number;                // Montant (FCFA)
  fees: number;                  // Frais (FCFA)
  totalAmount: number;           // Montant total (amount + fees)
  currency: 'XAF' | 'XOF';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Mobile Money
  mobileMoneyProvider?: 'mtn' | 'orange' | 'moov' | 'wave' | 'vodafone' | 'airtel';
  mobileMoneyNumber?: string;    // Numéro Mobile Money
  mobileMoneyTransactionId?: string; // ID transaction opérateur
  
  // Paiement
  relatedTransactionId?: string; // ID transaction liée (pour paiements)
  recipientWalletId?: string;    // ID portefeuille destinataire
  recipientUserId?: string;      // ID utilisateur destinataire
  orderId?: string;              // ID commande (si paiement)
  
  // Validation
  validatedBy?: string;          // ID admin validateur
  validatedAt?: Timestamp;
  rejectionReason?: string;
  
  // Métadonnées
  reference: string;             // Référence unique
  description: string;
  metadata?: Record<string, any>;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.3 Collection: `mobileMoneyAccounts`

```typescript
interface MobileMoneyAccount {
  id: string;
  provider: 'mtn' | 'orange' | 'moov' | 'wave' | 'vodafone' | 'airtel';
  accountName: string;           // Ex: "InterShop MTN"
  accountNumber: string;         // Numéro Mobile Money
  country: string;               // Code pays (CM, CI, BF, etc.)
  isActive: boolean;
  
  // API Configuration (Phase 2)
  apiKey?: string;
  apiSecret?: string;
  apiEndpoint?: string;
  
  // Statistiques
  totalDeposits: number;
  totalWithdrawals: number;
  balance: number;               // Solde estimé
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```


### 2.4 Collection: `walletSettings`

```typescript
interface WalletSettings {
  id: 'global';                  // Document unique
  
  // Frais
  depositFeePercent: number;     // % frais dépôt
  depositFeeMin: number;         // Frais minimum dépôt
  depositFeeThreshold: number;   // Seuil gratuit dépôt
  
  withdrawalFeePercent: number;  // % frais retrait
  withdrawalFeeMin: number;      // Frais minimum retrait
  withdrawalFeeMax: number;      // Frais maximum retrait
  
  // Limites
  minDeposit: number;            // Dépôt minimum
  minWithdrawal: number;         // Retrait minimum
  maxWithdrawalPerDay: number;   // Retrait max/jour
  maxWithdrawalPerMonth: number; // Retrait max/mois
  
  // Sécurité
  pinRequired: boolean;
  pinLength: number;             // 4 ou 6
  maxPinAttempts: number;        // 3
  twoFactorThreshold: number;    // Montant nécessitant 2FA
  
  // Notifications
  lowBalanceThreshold: number;   // Seuil alerte solde faible
  
  updatedAt: Timestamp;
  updatedBy: string;             // ID admin
}
```

## 3. Services Firebase

### 3.1 Service: `lib/firebase/wallet.ts`

Fonctions principales:

```typescript
// Gestion du portefeuille
createWallet(userId: string): Promise<Wallet>
getWallet(userId: string): Promise<Wallet>
getWalletBalance(userId: string): Promise<number>
updateWalletBalance(walletId: string, amount: number): Promise<void>

// Code PIN
setPIN(userId: string, pin: string): Promise<void>
verifyPIN(userId: string, pin: string): Promise<boolean>
resetPIN(userId: string): Promise<void>

// Dépôt
initiateDeposit(userId: string, amount: number, provider: string, phoneNumber: string): Promise<Transaction>
validateDeposit(transactionId: string, adminId: string, mobileMoneyTransactionId: string): Promise<void>
rejectDeposit(transactionId: string, adminId: string, reason: string): Promise<void>

// Retrait
initiateWithdrawal(userId: string, amount: number, provider: string, phoneNumber: string, pin: string): Promise<Transaction>
validateWithdrawal(transactionId: string, adminId: string, mobileMoneyTransactionId: string): Promise<void>
rejectWithdrawal(transactionId: string, adminId: string, reason: string): Promise<void>

// Paiement
processPayment(fromUserId: string, toUserId: string, amount: number, orderId: string, pin: string): Promise<Transaction>

// Historique
getTransactionHistory(userId: string, filters?: TransactionFilters): Promise<Transaction[]>
getTransaction(transactionId: string): Promise<Transaction>

// Admin
getPendingTransactions(type?: 'deposit' | 'withdrawal'): Promise<Transaction[]>
getAllWallets(): Promise<Wallet[]>
getWalletStatistics(): Promise<WalletStatistics>
```


### 3.2 Service: `lib/firebase/mobileMoneyService.ts`

```typescript
// Configuration
getMobileMoneyAccounts(): Promise<MobileMoneyAccount[]>
getMobileMoneyAccount(provider: string, country: string): Promise<MobileMoneyAccount>
updateMobileMoneyAccount(accountId: string, data: Partial<MobileMoneyAccount>): Promise<void>

// Phase 2: Intégration API
processAutomaticDeposit(transaction: Transaction): Promise<void>
processAutomaticWithdrawal(transaction: Transaction): Promise<void>
checkTransactionStatus(provider: string, transactionId: string): Promise<string>
```

## 4. Composants React

### 4.1 Composant: `components/wallet/WalletCard.tsx`

Carte affichant le solde du portefeuille:
- Solde disponible
- Solde en attente
- Boutons: Déposer, Retirer, Historique

### 4.2 Composant: `components/wallet/DepositModal.tsx`

Modal pour initier un dépôt:
- Sélection du service Mobile Money
- Input montant
- Input numéro Mobile Money
- Affichage des frais
- Instructions de transfert
- Génération du code de référence

### 4.3 Composant: `components/wallet/WithdrawalModal.tsx`

Modal pour initier un retrait:
- Sélection du service Mobile Money
- Input montant
- Input numéro Mobile Money
- Affichage des frais
- Vérification du solde
- Input code PIN
- Confirmation

### 4.4 Composant: `components/wallet/TransactionHistory.tsx`

Liste des transactions:
- Filtres (type, date, statut)
- Tableau des transactions
- Détails au clic
- Export PDF/Excel
- Pagination

### 4.5 Composant: `components/wallet/PINSetup.tsx`

Configuration du code PIN:
- Input PIN (4-6 chiffres)
- Confirmation PIN
- Validation
- Règles de sécurité

### 4.6 Composant: `components/admin/WalletManagement.tsx`

Dashboard admin:
- Statistiques globales
- Transactions en attente
- Validation/Rejet
- Configuration des comptes Mobile Money
- Rapports financiers

## 5. Pages Next.js

### 5.1 Page: `app/wallet/page.tsx`

Page principale du portefeuille:
- Carte du portefeuille
- Boutons d'action
- Transactions récentes
- Graphiques (optionnel)

### 5.2 Page: `app/wallet/deposit/page.tsx`

Page de dépôt:
- Formulaire de dépôt
- Instructions détaillées
- Suivi de la transaction

### 5.3 Page: `app/wallet/withdrawal/page.tsx`

Page de retrait:
- Formulaire de retrait
- Vérification du solde
- Confirmation PIN
- Suivi de la transaction

### 5.4 Page: `app/wallet/history/page.tsx`

Page d'historique:
- Liste complète des transactions
- Filtres avancés
- Export
- Détails des transactions

### 5.5 Page: `app/wallet/settings/page.tsx`

Page de paramètres:
- Configuration du PIN
- Notifications
- Limites personnelles
- Sécurité

### 5.6 Page: `app/dashboard/admin/wallet/page.tsx`

Dashboard admin du portefeuille:
- Vue d'ensemble
- Transactions en attente
- Validation/Rejet
- Statistiques
- Configuration

### 5.7 Page: `app/dashboard/admin/wallet/accounts/page.tsx`

Gestion des comptes Mobile Money:
- Liste des comptes
- Ajout/Modification
- Activation/Désactivation
- Configuration API (Phase 2)


## 6. Store Zustand

### 6.1 Store: `store/walletStore.ts`

```typescript
interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchWallet: (userId: string) => Promise<void>;
  fetchTransactions: (userId: string, filters?: TransactionFilters) => Promise<void>;
  initiateDeposit: (data: DepositData) => Promise<Transaction>;
  initiateWithdrawal: (data: WithdrawalData) => Promise<Transaction>;
  processPayment: (data: PaymentData) => Promise<Transaction>;
  setPIN: (pin: string) => Promise<void>;
  verifyPIN: (pin: string) => Promise<boolean>;
  reset: () => void;
}
```

## 7. Flux de données détaillés

### 7.1 Flux de dépôt (Mode Manuel - Phase 1)

```
1. Utilisateur clique sur "Déposer"
2. Modal s'ouvre avec formulaire
3. Utilisateur sélectionne service Mobile Money (ex: MTN)
4. Utilisateur entre montant (ex: 10,000 FCFA)
5. Système calcule frais (0% si > 5000)
6. Utilisateur entre son numéro Mobile Money
7. Système génère référence unique (ex: DEP-20240214-XXXX)
8. Système affiche:
   - Numéro InterShop MTN: +237 6XX XX XX XX
   - Montant à transférer: 10,000 FCFA
   - Référence: DEP-20240214-XXXX
   - Instructions: "Transférez via MTN Mobile Money"
9. Transaction créée en statut "pending"
10. Utilisateur transfère manuellement l'argent
11. Utilisateur entre l'ID de transaction MTN
12. Admin reçoit notification
13. Admin vérifie dans son compte MTN
14. Admin valide la transaction
15. Système crédite le portefeuille
16. Utilisateur reçoit notification
17. Solde mis à jour
18. Transaction passe en statut "completed"
```

### 7.2 Flux de retrait (Mode Manuel - Phase 1)

```
1. Utilisateur clique sur "Retirer"
2. Modal s'ouvre avec formulaire
3. Utilisateur sélectionne service Mobile Money
4. Utilisateur entre montant (ex: 20,000 FCFA)
5. Système vérifie solde disponible
6. Système calcule frais (2% = 400 FCFA)
7. Montant total: 20,400 FCFA
8. Utilisateur entre son numéro Mobile Money
9. Utilisateur entre son code PIN
10. Système vérifie PIN
11. Transaction créée en statut "pending"
12. Montant bloqué dans le portefeuille
13. Admin reçoit notification
14. Admin vérifie la demande
15. Admin transfère manuellement vers le Mobile Money utilisateur
16. Admin entre l'ID de transaction Mobile Money
17. Admin valide le retrait
18. Système débite le portefeuille
19. Utilisateur reçoit notification
20. Transaction passe en statut "completed"
```

### 7.3 Flux de paiement (Portefeuille → Portefeuille)

```
1. Client passe une commande
2. Page de paiement affiche options
3. Client sélectionne "Portefeuille InterShop"
4. Système affiche solde disponible
5. Client confirme le paiement
6. Si montant > 10,000 FCFA: demande PIN
7. Client entre PIN
8. Système vérifie PIN
9. Système vérifie solde suffisant
10. Transaction créée (type: payment)
11. Débit du portefeuille client
12. Crédit du portefeuille fournisseur
13. Commande marquée comme payée
14. Notifications envoyées (client + fournisseur)
15. Transactions enregistrées dans l'historique
16. Statut: "completed"
```

## 8. Calcul des frais

### 8.1 Frais de dépôt

```typescript
function calculateDepositFees(amount: number): number {
  const settings = await getWalletSettings();
  
  // Gratuit si montant > seuil
  if (amount >= settings.depositFeeThreshold) {
    return 0;
  }
  
  // Sinon 1% avec minimum
  const fees = amount * (settings.depositFeePercent / 100);
  return Math.max(fees, settings.depositFeeMin);
}

// Exemple:
// Dépôt de 10,000 FCFA → 0 FCFA (> 5000)
// Dépôt de 3,000 FCFA → 50 FCFA (1% = 30, mais min = 50)
```

### 8.2 Frais de retrait

```typescript
function calculateWithdrawalFees(amount: number): number {
  const settings = await getWalletSettings();
  
  // 2% avec min et max
  const fees = amount * (settings.withdrawalFeePercent / 100);
  return Math.min(
    Math.max(fees, settings.withdrawalFeeMin),
    settings.withdrawalFeeMax
  );
}

// Exemple:
// Retrait de 20,000 FCFA → 400 FCFA (2%)
// Retrait de 3,000 FCFA → 100 FCFA (2% = 60, mais min = 100)
// Retrait de 100,000 FCFA → 1,000 FCFA (2% = 2000, mais max = 1000)
```


## 9. Sécurité

### 9.1 Code PIN

```typescript
// Hashage du PIN avec bcrypt
import bcrypt from 'bcryptjs';

async function setPIN(userId: string, pin: string): Promise<void> {
  // Valider le PIN (4-6 chiffres)
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN invalide (4-6 chiffres requis)');
  }
  
  // Hasher le PIN
  const hashedPIN = await bcrypt.hash(pin, 10);
  
  // Sauvegarder
  await updateDoc(doc(db, 'wallets', userId), {
    pin: hashedPIN,
    pinAttempts: 0
  });
}

async function verifyPIN(userId: string, pin: string): Promise<boolean> {
  const wallet = await getWallet(userId);
  
  // Vérifier le nombre de tentatives
  if (wallet.pinAttempts >= 3) {
    const lastAttempt = wallet.lastPinAttempt?.toMillis() || 0;
    const now = Date.now();
    
    // Bloquer pendant 30 minutes après 3 tentatives
    if (now - lastAttempt < 30 * 60 * 1000) {
      throw new Error('Trop de tentatives. Réessayez dans 30 minutes.');
    }
    
    // Réinitialiser après 30 minutes
    await updateDoc(doc(db, 'wallets', userId), {
      pinAttempts: 0
    });
  }
  
  // Vérifier le PIN
  const isValid = await bcrypt.compare(pin, wallet.pin || '');
  
  if (!isValid) {
    // Incrémenter les tentatives
    await updateDoc(doc(db, 'wallets', userId), {
      pinAttempts: wallet.pinAttempts + 1,
      lastPinAttempt: serverTimestamp()
    });
    
    throw new Error('PIN incorrect');
  }
  
  // Réinitialiser les tentatives en cas de succès
  await updateDoc(doc(db, 'wallets', userId), {
    pinAttempts: 0
  });
  
  return true;
}
```

### 9.2 Transactions atomiques

```typescript
async function processPayment(
  fromUserId: string,
  toUserId: string,
  amount: number,
  orderId: string,
  pin: string
): Promise<Transaction> {
  // Vérifier le PIN
  await verifyPIN(fromUserId, pin);
  
  // Transaction atomique Firestore
  return await runTransaction(db, async (transaction) => {
    // Lire les portefeuilles
    const fromWalletRef = doc(db, 'wallets', fromUserId);
    const toWalletRef = doc(db, 'wallets', toUserId);
    
    const fromWallet = await transaction.get(fromWalletRef);
    const toWallet = await transaction.get(toWalletRef);
    
    if (!fromWallet.exists() || !toWallet.exists()) {
      throw new Error('Portefeuille non trouvé');
    }
    
    const fromBalance = fromWallet.data().balance;
    const toBalance = toWallet.data().balance;
    
    // Vérifier le solde
    if (fromBalance < amount) {
      throw new Error('Solde insuffisant');
    }
    
    // Créer la transaction
    const transactionData: Transaction = {
      id: generateId(),
      walletId: fromUserId,
      userId: fromUserId,
      type: 'payment',
      amount,
      fees: 0,
      totalAmount: amount,
      currency: 'XAF',
      status: 'completed',
      recipientWalletId: toUserId,
      recipientUserId: toUserId,
      orderId,
      reference: generateReference('PAY'),
      description: `Paiement commande ${orderId}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Créer la transaction réciproque
    const recipientTransactionData: Transaction = {
      ...transactionData,
      id: generateId(),
      walletId: toUserId,
      userId: toUserId,
      type: 'payment',
      relatedTransactionId: transactionData.id,
      description: `Réception paiement commande ${orderId}`
    };
    
    // Mettre à jour les soldes
    transaction.update(fromWalletRef, {
      balance: fromBalance - amount,
      updatedAt: serverTimestamp()
    });
    
    transaction.update(toWalletRef, {
      balance: toBalance + amount,
      updatedAt: serverTimestamp()
    });
    
    // Enregistrer les transactions
    transaction.set(doc(db, 'transactions', transactionData.id), transactionData);
    transaction.set(doc(db, 'transactions', recipientTransactionData.id), recipientTransactionData);
    
    return transactionData;
  });
}
```

### 9.3 Détection de fraude

```typescript
async function detectFraud(userId: string, transaction: Transaction): Promise<boolean> {
  // Vérifier les transactions récentes
  const recentTransactions = await getDocs(
    query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('createdAt', '>', Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000)),
      orderBy('createdAt', 'desc')
    )
  );
  
  // Règles de détection
  const rules = [
    // Trop de transactions en 24h
    recentTransactions.size > 20,
    
    // Montant inhabituel (> 500,000 FCFA)
    transaction.amount > 500000,
    
    // Plusieurs retraits rapides
    recentTransactions.docs.filter(doc => 
      doc.data().type === 'withdrawal' && 
      Date.now() - doc.data().createdAt.toMillis() < 60 * 60 * 1000
    ).length > 3
  ];
  
  return rules.some(rule => rule);
}
```

## 10. Règles Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Wallets
    match /wallets/{walletId} {
      allow read: if request.auth.uid == walletId || isAdmin();
      allow create: if request.auth.uid == walletId;
      allow update: if request.auth.uid == walletId && 
        !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['balance', 'pendingBalance']);
      allow update: if isAdmin();
    }
    
    // Transactions
    match /transactions/{transactionId} {
      allow read: if request.auth.uid == resource.data.userId || 
                     request.auth.uid == resource.data.recipientUserId ||
                     isAdmin();
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if isAdmin();
    }
    
    // Mobile Money Accounts (Admin only)
    match /mobileMoneyAccounts/{accountId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Wallet Settings (Admin only)
    match /walletSettings/{settingsId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

## 11. Index Firestore

```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## 12. Phase d'implémentation

### Phase 1: Mode Manuel (MVP)
- ✅ Création des portefeuilles
- ✅ Dépôt manuel avec validation admin
- ✅ Retrait manuel avec validation admin
- ✅ Paiement portefeuille à portefeuille
- ✅ Historique des transactions
- ✅ Code PIN
- ✅ Dashboard admin

### Phase 2: Intégration API
- 🔄 Intégration API MTN Mobile Money
- 🔄 Intégration API Orange Money
- 🔄 Intégration API Moov Money
- 🔄 Dépôt automatique
- 🔄 Retrait automatique
- 🔄 Webhooks pour notifications

### Phase 3: Fonctionnalités avancées
- 🔄 Support multi-devises
- 🔄 Virements entre utilisateurs
- 🔄 Paiement récurrent
- 🔄 Cashback et promotions
- 🔄 Programme de fidélité

## 13. Tests

### Tests unitaires
- Calcul des frais
- Vérification du PIN
- Validation des montants
- Détection de fraude

### Tests d'intégration
- Flux de dépôt complet
- Flux de retrait complet
- Flux de paiement complet
- Transactions atomiques

### Tests de sécurité
- Tentatives de PIN multiples
- Transactions concurrentes
- Injection SQL
- XSS

## 14. Monitoring

### Métriques à surveiller
- Nombre de transactions par jour
- Montant total des transactions
- Taux de succès/échec
- Temps de traitement
- Solde total des portefeuilles
- Fraudes détectées

### Alertes
- Transaction > 1,000,000 FCFA
- Solde négatif
- Échec de transaction
- Tentatives de fraude
- Erreurs API Mobile Money

## 15. Documentation utilisateur

### Guides à créer
- Comment déposer de l'argent
- Comment retirer de l'argent
- Comment payer avec le portefeuille
- Comment configurer le code PIN
- FAQ sur les frais
- Que faire en cas de problème

## 16. Support

### Procédures
- Litige sur un dépôt
- Litige sur un retrait
- Remboursement
- Blocage de compte
- Réinitialisation du PIN
