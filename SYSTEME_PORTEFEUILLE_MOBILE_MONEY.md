# 💰 Système de Portefeuille et Mobile Money - Documentation Complète

## 📋 Vue d'ensemble

J'ai créé une spécification complète pour le système de portefeuille électronique avec intégration Mobile Money pour la plateforme InterShop.

## 🎯 Fonctionnalités principales

### 1. Portefeuille électronique
- Chaque utilisateur a un portefeuille unique
- Solde en FCFA (Franc CFA)
- Consultation du solde en temps réel
- Historique complet des transactions

### 2. Dépôt d'argent (Mobile Money → Portefeuille)
- Transfert depuis MTN, Orange, Moov, Wave, etc.
- Montant minimum: 500 FCFA
- Frais: 0% si > 5000 FCFA, sinon 1%
- Validation manuelle par admin (Phase 1)
- Automatique via API (Phase 2)

### 3. Retrait d'argent (Portefeuille → Mobile Money)
- Transfert vers MTN, Orange, Moov, Wave, etc.
- Montant minimum: 1000 FCFA
- Frais: 2% (min 100 FCFA, max 1000 FCFA)
- Limite: 500,000 FCFA/jour, 2,000,000 FCFA/mois
- Code PIN requis
- Validation manuelle par admin (Phase 1)

### 4. Paiement avec le portefeuille
- Payer les commandes avec le solde
- Transfert instantané entre portefeuilles
- Frais: 0% (gratuit)
- Code PIN requis si > 10,000 FCFA

### 5. Sécurité
- Code PIN à 4-6 chiffres
- Maximum 3 tentatives (blocage 30 min)
- Authentification à 2 facteurs pour gros montants
- Détection automatique de fraude
- Toutes les transactions tracées

## 📊 Collections Firestore

### Collection: `wallets`
```typescript
{
  id: string;              // ID utilisateur
  balance: number;         // Solde disponible
  pendingBalance: number;  // Solde en attente
  currency: 'XAF';         // FCFA
  status: 'active';
  pin: string;             // Code PIN hashé
  pinAttempts: number;
  createdAt: Timestamp;
}
```

### Collection: `transactions`
```typescript
{
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment';
  amount: number;
  fees: number;
  status: 'pending' | 'completed' | 'failed';
  mobileMoneyProvider: 'mtn' | 'orange' | 'moov';
  mobileMoneyNumber: string;
  reference: string;
  createdAt: Timestamp;
}
```

### Collection: `mobileMoneyAccounts`
```typescript
{
  id: string;
  provider: 'mtn' | 'orange' | 'moov';
  accountName: string;     // "InterShop MTN"
  accountNumber: string;   // +237 6XX XX XX XX
  country: string;         // CM, CI, BF, etc.
  isActive: boolean;
}
```

### Collection: `walletSettings`
```typescript
{
  id: 'global';
  depositFeePercent: 1;
  depositFeeThreshold: 5000;
  withdrawalFeePercent: 2;
  withdrawalFeeMin: 100;
  withdrawalFeeMax: 1000;
  minDeposit: 500;
  minWithdrawal: 1000;
  maxWithdrawalPerDay: 500000;
}
```

## 🔄 Flux de transactions

### Dépôt (Mode Manuel - Phase 1)
```
1. Utilisateur clique "Déposer"
2. Sélectionne MTN Mobile Money
3. Entre montant: 10,000 FCFA
4. Entre son numéro: +237 6XX XX XX XX
5. Système génère référence: DEP-20240214-XXXX
6. Système affiche:
   - Numéro InterShop MTN: +237 6YY YY YY YY
   - Montant: 10,000 FCFA
   - Référence: DEP-20240214-XXXX
7. Utilisateur transfère manuellement via MTN
8. Utilisateur entre l'ID de transaction MTN
9. Admin reçoit notification
10. Admin vérifie dans son compte MTN
11. Admin valide le dépôt
12. Solde crédité: +10,000 FCFA
13. Notification envoyée à l'utilisateur
```

### Retrait (Mode Manuel - Phase 1)
```
1. Utilisateur clique "Retirer"
2. Sélectionne Orange Money
3. Entre montant: 20,000 FCFA
4. Système calcule frais: 400 FCFA (2%)
5. Total: 20,400 FCFA
6. Entre son numéro Orange: +225 XX XX XX XX
7. Entre code PIN: ****
8. Système vérifie PIN et solde
9. Transaction créée (pending)
10. Montant bloqué: -20,400 FCFA
11. Admin reçoit notification
12. Admin transfère vers Orange Money utilisateur
13. Admin entre l'ID de transaction Orange
14. Admin valide le retrait
15. Solde débité définitivement
16. Notification envoyée à l'utilisateur
```

### Paiement (Portefeuille → Portefeuille)
```
1. Client passe commande: 15,000 FCFA
2. Sélectionne "Portefeuille InterShop"
3. Système affiche solde: 50,000 FCFA
4. Demande code PIN (montant > 10,000)
5. Client entre PIN: ****
6. Système vérifie PIN et solde
7. Débit client: -15,000 FCFA
8. Crédit fournisseur: +15,000 FCFA
9. Commande marquée "Payée"
10. Notifications envoyées (client + fournisseur)
11. Frais: 0 FCFA (gratuit)
```

## 💻 Pages à créer

### Pages utilisateur
- `/wallet` - Page principale du portefeuille
- `/wallet/deposit` - Page de dépôt
- `/wallet/withdrawal` - Page de retrait
- `/wallet/history` - Historique des transactions
- `/wallet/settings` - Paramètres (PIN, notifications)

### Pages admin
- `/dashboard/admin/wallet` - Dashboard portefeuille
- `/dashboard/admin/wallet/accounts` - Gestion comptes Mobile Money
- `/dashboard/admin/wallet/transactions` - Toutes les transactions
- `/dashboard/admin/wallet/pending` - Transactions en attente

## 🔐 Sécurité

### Code PIN
- 4 à 6 chiffres
- Hashé avec bcrypt
- Maximum 3 tentatives
- Blocage 30 minutes après 3 échecs
- Requis pour retraits et paiements > 10,000 FCFA

### Détection de fraude
- Plus de 20 transactions en 24h
- Montant inhabituel (> 500,000 FCFA)
- Plusieurs retraits rapides (> 3 en 1h)
- Blocage automatique du compte

### Transactions atomiques
- Utilisation de Firestore transactions
- Rollback automatique en cas d'erreur
- Pas de solde négatif possible

## 💰 Frais de transaction

### Dépôt
- **Gratuit** si montant ≥ 5,000 FCFA
- **1%** si montant < 5,000 FCFA (minimum 50 FCFA)

Exemples:
- Dépôt 10,000 FCFA → 0 FCFA de frais
- Dépôt 3,000 FCFA → 50 FCFA de frais (1% = 30, mais min = 50)

### Retrait
- **2%** du montant
- Minimum: 100 FCFA
- Maximum: 1,000 FCFA

Exemples:
- Retrait 20,000 FCFA → 400 FCFA de frais (2%)
- Retrait 3,000 FCFA → 100 FCFA de frais (2% = 60, mais min = 100)
- Retrait 100,000 FCFA → 1,000 FCFA de frais (2% = 2000, mais max = 1000)

### Paiement
- **0%** (gratuit)

## 📱 Services Mobile Money supportés

### Phase 1 (Mode Manuel)
- 🇨🇲 MTN Mobile Money (Cameroun)
- 🇨🇮 Orange Money (Côte d'Ivoire)
- 🇧🇫 Moov Money (Burkina Faso)
- 🇸🇳 Wave (Sénégal)
- 🇬🇭 Vodafone Cash (Ghana)
- 🇳🇬 Airtel Money (Nigeria)

### Phase 2 (Intégration API)
- API MTN Mobile Money
- API Orange Money
- API Moov Money
- Dépôts et retraits automatiques

## 🚀 Plan d'implémentation

### Phase 1: Mode Manuel (MVP) - 4 semaines
**Semaine 1-2**: Backend
- Créer collections Firestore
- Créer services Firebase (wallet.ts)
- Implémenter logique de transaction
- Implémenter code PIN
- Tests unitaires

**Semaine 3**: Frontend utilisateur
- Page portefeuille
- Modal dépôt
- Modal retrait
- Historique transactions
- Configuration PIN

**Semaine 4**: Frontend admin
- Dashboard portefeuille
- Gestion comptes Mobile Money
- Validation dépôts/retraits
- Rapports financiers

### Phase 2: Intégration API - 6 semaines
- Négociation avec opérateurs Mobile Money
- Intégration API MTN
- Intégration API Orange
- Intégration API Moov
- Webhooks et notifications
- Tests en production

### Phase 3: Fonctionnalités avancées - 4 semaines
- Support multi-devises
- Virements entre utilisateurs
- Paiement récurrent
- Cashback et promotions

## 📝 Configuration admin requise

### Comptes Mobile Money InterShop
L'admin doit configurer les comptes Mobile Money de la plateforme:

```
MTN Mobile Money:
- Nom: InterShop MTN
- Numéro: +237 6XX XX XX XX
- Pays: Cameroun

Orange Money:
- Nom: InterShop Orange
- Numéro: +225 XX XX XX XX
- Pays: Côte d'Ivoire

Moov Money:
- Nom: InterShop Moov
- Numéro: +226 XX XX XX XX
- Pays: Burkina Faso
```

### Paramètres globaux
```
Frais de dépôt: 1%
Seuil gratuit dépôt: 5,000 FCFA
Frais de retrait: 2%
Retrait minimum: 1,000 FCFA
Retrait maximum/jour: 500,000 FCFA
```

## ⚠️ Points d'attention

### Légal
- Vérifier si une licence de paiement est nécessaire
- Respecter les réglementations bancaires locales
- KYC pour montants > 500,000 FCFA
- Déclaration des transactions suspectes

### Opérationnel
- Équipe support pour gérer les litiges
- Procédure de remboursement claire
- Réconciliation quotidienne des comptes
- Rapprochement avec les comptes Mobile Money

### Technique
- Sauvegardes régulières de la base de données
- Monitoring des transactions
- Alertes en cas d'anomalie
- Tests de charge

## 📚 Documentation créée

1. **requirements.md** - Exigences fonctionnelles et non fonctionnelles complètes
2. **design.md** - Architecture technique détaillée avec:
   - Modèle de données
   - Services Firebase
   - Composants React
   - Flux de données
   - Sécurité
   - Règles Firestore
   - Index
   - Tests

## 🎯 Prochaines étapes

1. **Réviser les spécifications** avec l'équipe
2. **Valider les frais** et limites de transaction
3. **Obtenir les comptes Mobile Money** de la plateforme
4. **Vérifier les aspects légaux** selon le pays
5. **Commencer l'implémentation** Phase 1 (Mode Manuel)

## 💡 Avantages du système

### Pour les utilisateurs
- ✅ Transactions plus rapides
- ✅ Pas besoin de saisir les infos à chaque achat
- ✅ Historique centralisé
- ✅ Sécurisé avec code PIN

### Pour la plateforme
- ✅ Réduction des frais de transaction
- ✅ Meilleure rétention des utilisateurs
- ✅ Contrôle des flux financiers
- ✅ Données sur les habitudes d'achat

### Pour les fournisseurs
- ✅ Paiements instantanés
- ✅ Moins de risque de fraude
- ✅ Retraits faciles vers Mobile Money

## 📞 Support

En cas de questions sur les spécifications:
- Consulter `requirements.md` pour les exigences
- Consulter `design.md` pour l'architecture technique
- Consulter ce document pour la vue d'ensemble

Prêt à commencer l'implémentation ! 🚀
