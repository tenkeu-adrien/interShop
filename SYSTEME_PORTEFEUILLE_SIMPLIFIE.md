# Système de Portefeuille Flexible - Version Simplifiée

## 🎯 Principe

Le système permet aux clients de déposer et retirer de l'argent en utilisant différentes méthodes configurées par l'admin. Tout est manuel et vérifié par l'admin.

## 👨‍💼 Côté Admin

### 1. Configuration des Méthodes de Paiement

**Page:** `/dashboard/admin/payment-methods`

L'admin configure les canaux de réception d'argent :

**Exemple Mobile Money:**
- Nom: "MTN Mobile Money"
- Type: Mobile Money
- Numéro: +237XXXXXXXXX
- Nom du compte: InterShop
- Instructions: "Envoyez le montant au numéro ci-dessus avec le code *126#"

**Exemple Crypto:**
- Nom: "USDT BEP20"
- Type: Cryptomonnaie
- Adresse: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
- Réseau: BEP20 (Binance Smart Chain)
- Instructions: "Envoyez uniquement des USDT sur le réseau BEP20"

L'admin peut :
- ✅ Activer/Désactiver une méthode
- ✏️ Modifier les détails
- ➕ Ajouter de nouvelles méthodes

### 2. Validation des Transactions

**Page:** `/dashboard/admin/wallet-transactions`

L'admin voit toutes les demandes en attente :

**Pour chaque demande, l'admin voit:**
- Nom du client
- Montant demandé
- Méthode utilisée
- Date de la demande
- Référence unique

**L'admin vérifie MANUELLEMENT:**
1. Ouvre son compte Mobile Money / Wallet Crypto
2. Vérifie si le paiement est bien reçu
3. Compare le montant

**Puis l'admin:**
- ✅ **Approuve** → Le portefeuille du client est crédité automatiquement
- ❌ **Rejette** → Le client reçoit une notification avec la raison

## 👤 Côté Client

### 1. Faire un Dépôt

**Page:** `/wallet/deposit`

**Étape 1: Choisir la méthode**
- Le client voit toutes les méthodes actives
- Groupées par type (Mobile Money, Crypto, etc.)
- Avec les instructions claires

**Étape 2: Effectuer le paiement**
- Le client voit les détails du compte admin (numéro, adresse, etc.)
- Le client effectue le paiement MANUELLEMENT en dehors de l'app
- Exemple: Envoie 10,000 FCFA au +237XXXXXXXXX via MTN

**Étape 3: Confirmer sur la plateforme**
Le client remplit un formulaire simple :
- ✅ Son nom (pré-rempli, modifiable)
- ✅ Le montant qu'il a envoyé
- ❌ PAS de preuve de paiement à uploader
- ❌ PAS de transaction ID à saisir

**Étape 4: Attendre la validation**
- Le client reçoit une confirmation : "Demande envoyée"
- L'admin reçoit une notification
- Le client peut suivre l'état dans l'historique

### 2. Notifications

Le client reçoit des notifications (email + in-app) :
- 📩 "Demande de dépôt envoyée"
- ✅ "Dépôt approuvé - Portefeuille crédité de 10,000 FCFA"
- ❌ "Dépôt rejeté - Raison: Paiement non reçu"

## 🔄 Flux Complet (Exemple)

### Scénario: Jean veut déposer 10,000 FCFA

1. **Jean ouvre `/wallet/deposit`**
   - Voit "MTN Mobile Money" et "Orange Money"
   - Choisit "MTN Mobile Money"

2. **Jean voit les instructions:**
   ```
   Envoyez le montant au numéro suivant:
   +237651234567 (InterShop)
   
   Utilisez le code *126# pour envoyer de l'argent
   ```

3. **Jean effectue le paiement:**
   - Prend son téléphone
   - Compose *126#
   - Envoie 10,000 FCFA au +237651234567
   - Reçoit un SMS de confirmation de MTN

4. **Jean revient sur la plateforme:**
   - Remplit le formulaire:
     - Nom: "Jean Dupont" (pré-rempli)
     - Montant: 10000
   - Clique sur "Confirmer le dépôt"

5. **Système crée la transaction:**
   ```json
   {
     "id": "auto-généré",
     "userId": "jean123",
     "type": "deposit",
     "amount": 10000,
     "status": "pending",
     "paymentMethodId": "mtn-momo",
     "paymentMethodName": "MTN Mobile Money",
     "clientName": "Jean Dupont",
     "reference": "FLEX-DEP-20260216-ABC123",
     "createdAt": "2026-02-16T10:30:00Z"
   }
   ```

6. **Admin reçoit notification:**
   - Email: "Nouvelle demande de dépôt"
   - Voit dans le dashboard: Jean Dupont - 10,000 FCFA - MTN

7. **Admin vérifie:**
   - Ouvre son compte MTN Mobile Money
   - Voit un paiement de 10,000 FCFA reçu
   - Vérifie que c'est bien de Jean

8. **Admin approuve:**
   - Clique sur "Approuver"
   - Peut ajouter une note: "Paiement vérifié et confirmé"

9. **Système crédite automatiquement:**
   - Portefeuille de Jean: 0 → 10,000 FCFA
   - Transaction status: pending → completed

10. **Jean reçoit notification:**
    - "Dépôt approuvé - Votre portefeuille a été crédité de 10,000 FCFA"

## 📊 Données Envoyées

### Ce que le CLIENT envoie:
```json
{
  "paymentMethodId": "mtn-momo",
  "clientName": "Jean Dupont",
  "amount": 10000
}
```

### Ce que le SYSTÈME génère automatiquement:
```json
{
  "id": "trans456",
  "userId": "jean123",
  "type": "deposit",
  "status": "pending",
  "reference": "FLEX-DEP-20260216-ABC123",
  "createdAt": "2026-02-16T10:30:00Z",
  "updatedAt": "2026-02-16T10:30:00Z"
}
```

## 🔐 Sécurité

- ✅ Authentification requise
- ✅ Validation côté serveur
- ✅ Transactions atomiques (portefeuille crédité en une seule opération)
- ✅ Logs de toutes les actions admin
- ✅ Notifications à chaque étape

## 📁 Structure des Fichiers Créés

### Backend (Services)
- `lib/firebase/paymentMethods.ts` - Gestion des méthodes
- `lib/firebase/flexibleWallet.ts` - Gestion des transactions
- `lib/firebase/notifications.ts` - Notifications étendues

### API Routes
- `app/api/payment-methods/route.ts` - CRUD méthodes
- `app/api/payment-methods/[id]/toggle/route.ts` - Activer/Désactiver
- `app/api/transactions/deposit/route.ts` - Créer dépôt
- `app/api/transactions/pending/route.ts` - Liste en attente
- `app/api/transactions/[id]/validate/route.ts` - Approuver
- `app/api/transactions/[id]/reject/route.ts` - Rejeter

### Pages Admin
- `app/dashboard/admin/payment-methods/page.tsx` - Gérer méthodes
- `app/dashboard/admin/wallet-transactions/page.tsx` - Valider transactions

### Pages Client
- `app/wallet/deposit/page.tsx` - Faire un dépôt
- `components/wallet/PaymentMethodSelector.tsx` - Choisir méthode
- `components/wallet/FlexibleDepositForm.tsx` - Formulaire dépôt

## ✅ Avantages de ce Système

1. **Simple pour le client** - Juste 3 champs à remplir
2. **Flexible pour l'admin** - Peut ajouter n'importe quelle méthode
3. **Pas de preuve à uploader** - L'admin vérifie directement
4. **Notifications complètes** - Tout le monde est informé
5. **Même système pour dépôt et retrait** - Les méthodes sont réutilisées

## 🚀 Prochaines Étapes

Pour compléter:
1. ✅ Système de dépôt (fait)
2. ⏳ Système de retrait (similaire au dépôt)
3. ⏳ Page historique des transactions
4. ⏳ Tests et déploiement
