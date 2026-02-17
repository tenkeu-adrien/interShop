# 💰 Guide Complet - Système de Portefeuille et Mobile Money

## 🎉 Ce qui a été implémenté

### ✅ Backend complet (100%)
- Service Firebase avec toutes les fonctions
- Store Zustand pour la gestion d'état
- Types TypeScript complets
- Transactions atomiques Firestore
- Sécurité avec code PIN (bcrypt)
- Calcul automatique des frais

### ✅ Frontend utilisateur (70%)
- Page principale du portefeuille
- Modal de dépôt (3 étapes)
- Modal de retrait (3 étapes)
- Affichage des transactions récentes

### ✅ Configuration (100%)
- Règles Firestore
- Index Firestore
- Types TypeScript

## 🚀 Comment utiliser

### 1. Déployer les règles et index Firestore

```bash
cd alibaba-clone
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 2. Accéder au portefeuille

L'utilisateur peut accéder à son portefeuille via:
- URL directe: `/wallet`
- Depuis le dashboard (ajouter un lien dans le menu)

### 3. Effectuer un dépôt

**Étape 1**: Montant
- Entrer le montant (min 500 FCFA)
- Voir les frais calculés automatiquement
- Cliquer "Continuer"

**Étape 2**: Service Mobile Money
- Sélectionner MTN, Orange, Moov ou Wave
- Cliquer sur le service

**Étape 3**: Instructions
- Voir le numéro InterShop à utiliser
- Transférer manuellement l'argent
- Entrer le code de transaction Mobile Money
- Soumettre la demande

**Validation**: Admin valide dans le dashboard

### 4. Effectuer un retrait

**Étape 1**: Montant
- Voir le solde disponible
- Entrer le montant (min 1000 FCFA)
- Voir les frais (2%)
- Cliquer "Continuer"

**Étape 2**: Service Mobile Money
- Sélectionner le service
- Cliquer sur le service

**Étape 3**: Confirmation
- Entrer le numéro Mobile Money
- Entrer le code PIN
- Confirmer le retrait

**Traitement**: 
- Solde débité immédiatement
- Admin traite le retrait dans les 24h

## 📋 Pages à créer (30% restant)

### Page d'historique (`/wallet/history`)

```typescript
// app/wallet/history/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { TransactionFilters } from '@/types';

export default function WalletHistoryPage() {
  const { user } = useAuthStore();
  const { transactions, fetchTransactions } = useWalletStore();
  const [filters, setFilters] = useState<TransactionFilters>({});

  useEffect(() => {
    if (user) {
      fetchTransactions(user.uid, filters);
    }
  }, [user, filters]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Historique des transactions</h1>
        
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              onChange={(e) => setFilters({...filters, type: e.target.value as any})}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Tous les types</option>
              <option value="deposit">Dépôts</option>
              <option value="withdrawal">Retraits</option>
              <option value="payment">Paiements</option>
            </select>
            
            <select
              onChange={(e) => setFilters({...filters, status: e.target.value as any})}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Complété</option>
              <option value="failed">Échoué</option>
            </select>
          </div>
        </div>

        {/* Liste des transactions */}
        <div className="bg-white rounded-lg shadow">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-6 border-b">
              {/* Afficher les détails de la transaction */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Page de paramètres (`/wallet/settings`)

```typescript
// app/wallet/settings/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';

export default function WalletSettingsPage() {
  const { user } = useAuthStore();
  const { wallet, setPIN } = useWalletStore();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSetPIN = async () => {
    if (pin !== confirmPin) {
      alert('Les codes PIN ne correspondent pas');
      return;
    }
    
    if (user) {
      await setPIN(user.uid, pin);
      alert('Code PIN configuré avec succès');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Paramètres du portefeuille</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Code PIN</h2>
          
          {wallet?.pin ? (
            <p className="text-green-600 mb-4">✓ Code PIN configuré</p>
          ) : (
            <p className="text-orange-600 mb-4">⚠ Aucun code PIN configuré</p>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nouveau code PIN (4-6 chiffres)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 border rounded-lg"
                maxLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirmer le code PIN
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 border rounded-lg"
                maxLength={6}
              />
            </div>
            
            <button
              onClick={handleSetPIN}
              disabled={!pin || pin.length < 4 || pin !== confirmPin}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {wallet?.pin ? 'Modifier le code PIN' : 'Définir le code PIN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Dashboard Admin (`/dashboard/admin/wallet/page.tsx`)

```typescript
// app/dashboard/admin/wallet/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPendingTransactions, validateDeposit, validateWithdrawal, rejectDeposit, rejectWithdrawal } from '@/lib/firebase/wallet';
import { Transaction } from '@/types';

export default function AdminWalletPage() {
  const [pendingDeposits, setPendingDeposits] = useState<Transaction[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[]>([]);

  useEffect(() => {
    loadPendingTransactions();
  }, []);

  const loadPendingTransactions = async () => {
    const deposits = await getPendingTransactions('deposit');
    const withdrawals = await getPendingTransactions('withdrawal');
    setPendingDeposits(deposits);
    setPendingWithdrawals(withdrawals);
  };

  const handleValidateDeposit = async (transactionId: string) => {
    const mobileMoneyId = prompt('Entrez le code de transaction Mobile Money:');
    if (mobileMoneyId) {
      await validateDeposit(transactionId, 'admin-id', mobileMoneyId);
      loadPendingTransactions();
    }
  };

  const handleValidateWithdrawal = async (transactionId: string) => {
    const mobileMoneyId = prompt('Entrez le code de transaction Mobile Money:');
    if (mobileMoneyId) {
      await validateWithdrawal(transactionId, 'admin-id', mobileMoneyId);
      loadPendingTransactions();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Gestion du portefeuille</h1>
        
        {/* Dépôts en attente */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Dépôts en attente ({pendingDeposits.length})
            </h2>
          </div>
          <div className="divide-y">
            {pendingDeposits.map((transaction) => (
              <div key={transaction.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{transaction.amount.toLocaleString()} FCFA</p>
                    <p className="text-sm text-gray-600">{transaction.mobileMoneyProvider}</p>
                    <p className="text-sm text-gray-600">{transaction.mobileMoneyNumber}</p>
                    <p className="text-sm text-gray-600">Ref: {transaction.reference}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleValidateDeposit(transaction.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Raison du rejet:');
                        if (reason) {
                          rejectDeposit(transaction.id, 'admin-id', reason);
                          loadPendingTransactions();
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retraits en attente */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Retraits en attente ({pendingWithdrawals.length})
            </h2>
          </div>
          <div className="divide-y">
            {pendingWithdrawals.map((transaction) => (
              <div key={transaction.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{transaction.amount.toLocaleString()} FCFA</p>
                    <p className="text-sm text-gray-600">{transaction.mobileMoneyProvider}</p>
                    <p className="text-sm text-gray-600">{transaction.mobileMoneyNumber}</p>
                    <p className="text-sm text-gray-600">Ref: {transaction.reference}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleValidateWithdrawal(transaction.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Raison du rejet:');
                        if (reason) {
                          rejectWithdrawal(transaction.id, 'admin-id', reason);
                          loadPendingTransactions();
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Configuration des comptes Mobile Money

L'admin doit créer les comptes dans Firestore:

```javascript
// Dans la console Firebase ou via un script
db.collection('mobileMoneyAccounts').add({
  provider: 'mtn',
  accountName: 'InterShop MTN',
  accountNumber: '+237 670 00 00 00',
  country: 'CM',
  isActive: true,
  totalDeposits: 0,
  totalWithdrawals: 0,
  balance: 0,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Répéter pour Orange, Moov, Wave, etc.
```

## 📱 Ajouter le lien dans le menu

Dans `components/layout/Header.tsx`, ajouter:

```typescript
<Link href="/wallet" className="flex items-center gap-2">
  <Wallet className="w-5 h-5" />
  Portefeuille
</Link>
```

## ✅ Checklist de déploiement

- [ ] Déployer les règles Firestore
- [ ] Déployer les index Firestore
- [ ] Créer les comptes Mobile Money dans Firestore
- [ ] Initialiser les paramètres globaux (walletSettings)
- [ ] Créer les pages manquantes (historique, paramètres)
- [ ] Créer le dashboard admin
- [ ] Ajouter le lien dans le menu
- [ ] Tester le flow complet
- [ ] Former l'équipe admin

## 🎯 Résultat final

Une fois complété, les utilisateurs pourront:
- ✅ Voir leur solde en temps réel
- ✅ Déposer de l'argent via Mobile Money
- ✅ Retirer de l'argent vers Mobile Money
- ✅ Payer leurs commandes avec le portefeuille
- ✅ Voir l'historique complet
- ✅ Configurer un code PIN sécurisé

Les admins pourront:
- ✅ Valider les dépôts
- ✅ Valider les retraits
- ✅ Voir toutes les transactions
- ✅ Gérer les comptes Mobile Money
- ✅ Voir les statistiques

Système complet et fonctionnel ! 🚀
