# Système de Portefeuille InterShop - Spécifications

## Vue d'ensemble

Système de portefeuille virtuel permettant aux utilisateurs de déposer et retirer de l'argent via Mobile Money (MTN, Orange Money, Moov Money, etc.).

## Objectifs

1. Permettre aux utilisateurs de recharger leur portefeuille InterShop depuis leur Mobile Money
2. Permettre aux utilisateurs de retirer de l'argent vers leur Mobile Money
3. Permettre aux admins de configurer les comptes Mobile Money de la plateforme
4. Tracer toutes les transactions pour la comptabilité
5. Gérer les commissions et frais de transaction

## Acteurs

### 1. Utilisateur (Client/Fournisseur/Marketiste)
- Consulter son solde de portefeuille
- Recharger son portefeuille (Dépôt)
- Retirer de l'argent (Retrait)
- Voir l'historique des transactions
- Recevoir des notifications de transaction

### 2. Admin
- Configurer les comptes Mobile Money de la plateforme
- Valider/Rejeter les demandes de dépôt
- Valider/Rejeter les demandes de retrait
- Voir toutes les transactions
- Gérer les frais et commissions
- Voir les statistiques financières

## Fonctionnalités principales

### 1. Portefeuille utilisateur

#### Affichage
- Solde actuel en FCFA
- Solde disponible (après retenues en attente)
- Solde en attente (transactions en cours)
- Boutons: "Déposer" et "Retirer"
- Historique des transactions

#### Informations
```typescript
{
  userId: string;
  balance: number;              // Solde disponible
  pendingBalance: number;       // En attente de validation
  totalDeposits: number;        // Total des dépôts
  totalWithdrawals: number;     // Total des retraits
  currency: 'XAF';              // FCFA
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Dépôt (Recharge)

#### Processus
1. Utilisateur clique sur "Déposer"
2. Sélectionne le service Mobile Money (MTN, Orange, Moov)
3. Entre le montant à déposer (min: 500 FCFA, max: 1,000,000 FCFA)
4. Voit le numéro Mobile Money de la plateforme
5. Effectue le transfert depuis son téléphone
6. Entre le numéro de transaction Mobile Money
7. Soumet la demande
8. Admin vérifie et valide
9. Solde crédité

#### Validation
- Montant minimum: 500 FCFA
- Montant maximum: 1,000,000 FCFA par transaction
- Frais de dépôt: 0% (gratuit)
- Délai de validation: 5-30 minutes

#### Statuts
- `pending`: En attente de validation admin
- `completed`: Validé et crédité
- `rejected`: Rejeté par admin
- `cancelled`: Annulé par utilisateur

### 3. Retrait

#### Processus
1. Utilisateur clique sur "Retirer"
2. Sélectionne le service Mobile Money
3. Entre son numéro Mobile Money
4. Entre le montant à retirer
5. Voit les frais de retrait
6. Confirme le retrait
7. Solde débité immédiatement
8. Admin traite le retrait
9. Utilisateur reçoit l'argent sur son Mobile Money

#### Validation
- Montant minimum: 1,000 FCFA
- Montant maximum: 500,000 FCFA par transaction
- Frais de retrait: 2% (min: 100 FCFA, max: 5,000 FCFA)
- Solde suffisant requis
- Délai de traitement: 1-24 heures

#### Statuts
- `pending`: En attente de traitement admin
- `processing`: En cours de traitement
- `completed`: Envoyé à l'utilisateur
- `rejected`: Rejeté (solde recrédité)
- `cancelled`: Annulé (solde recrédité)

### 4. Services Mobile Money supportés

#### MTN Mobile Money (Cameroun)
- Code: `*126#`
- Numéro plateforme: Configurable par admin
- Frais: Selon grille MTN

#### Orange Money (Cameroun)
- Code: `#150#`
- Numéro plateforme: Configurable par admin
- Frais: Selon grille Orange

#### Moov Money (Afrique de l'Ouest)
- Code: Varie selon pays
- Numéro plateforme: Configurable par admin
- Frais: Selon grille Moov

#### Express Union Mobile
- Code: `*991#`
- Numéro plateforme: Configurable par admin
- Frais: Selon grille Express Union

### 5. Configuration Admin

#### Comptes Mobile Money de la plateforme
```typescript
{
  id: string;
  provider: 'mtn' | 'orange' | 'moov' | 'express_union';
  accountName: string;          // Ex: "InterShop SARL"
  phoneNumber: string;          // Ex: "+237670000000"
  isActive: boolean;
  country: string;              // Ex: "Cameroun"
  createdAt: Date;
  updatedAt: Date;
}
```

#### Frais et limites
```typescript
{
  depositMinAmount: 500;
  depositMaxAmount: 1000000;
  depositFeePercent: 0;
  
  withdrawalMinAmount: 1000;
  withdrawalMaxAmount: 500000;
  withdrawalFeePercent: 2;
  withdrawalFeeMin: 100;
  withdrawalFeeMax: 5000;
}
```

### 6. Transactions

#### Structure
```typescript
{
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission';
  amount: number;
  fee: number;
  netAmount: number;            // amount - fee
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  provider: 'mtn' | 'orange' | 'moov' | 'express_union';
  phoneNumber: string;          // Numéro utilisateur
  transactionRef: string;       // Référence Mobile Money
  description: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    adminNote?: string;
  };
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;         // Admin ID
}
```

### 7. Notifications

#### Événements notifiés
- Demande de dépôt soumise
- Dépôt validé (solde crédité)
- Dépôt rejeté
- Demande de retrait soumise
- Retrait en cours de traitement
- Retrait complété
- Retrait rejeté
- Solde insuffisant
- Transaction importante (> 100,000 FCFA)

### 8. Sécurité

#### Mesures
- Vérification du numéro de téléphone obligatoire
- Limite de transactions par jour: 5
- Limite de montant par jour: 2,000,000 FCFA
- Code PIN pour les retraits (optionnel)
- Historique complet des transactions
- Logs d'audit pour les admins
- Blocage automatique en cas d'activité suspecte

#### Validation admin obligatoire
- Tous les dépôts (vérification manuelle)
- Tous les retraits > 100,000 FCFA
- Première transaction d'un utilisateur

## Cas d'usage

### Cas 1: Client recharge son portefeuille

**Scénario**: Marie veut acheter un produit à 50,000 FCFA

1. Marie va sur "Mon portefeuille"
2. Clique sur "Déposer"
3. Sélectionne "MTN Mobile Money"
4. Entre 50,000 FCFA
5. Voit le numéro MTN de InterShop: +237 670 00 00 00
6. Ouvre son téléphone, compose `*126#`
7. Sélectionne "Transfert d'argent"
8. Entre le numéro +237 670 00 00 00
9. Entre 50,000 FCFA
10. Confirme avec son code PIN
11. Reçoit SMS de confirmation avec référence: MTN123456789
12. Retourne sur InterShop
13. Entre la référence MTN123456789
14. Soumet la demande
15. Reçoit notification "Demande en attente de validation"
16. Admin vérifie la transaction MTN
17. Admin valide
18. Marie reçoit notification "Dépôt validé: +50,000 FCFA"
19. Son solde passe à 50,000 FCFA
20. Elle peut acheter le produit

### Cas 2: Fournisseur retire ses gains

**Scénario**: Paul a vendu pour 200,000 FCFA et veut retirer

1. Paul va sur "Mon portefeuille"
2. Solde: 200,000 FCFA
3. Clique sur "Retirer"
4. Sélectionne "Orange Money"
5. Entre son numéro: +237 699 00 00 00
6. Entre 200,000 FCFA
7. Voit les frais: 4,000 FCFA (2%)
8. Montant net: 196,000 FCFA
9. Confirme le retrait
10. Son solde passe à 0 FCFA
11. Reçoit notification "Retrait en cours de traitement"
12. Admin traite le retrait
13. Admin envoie 196,000 FCFA via Orange Money
14. Admin marque comme "Complété"
15. Paul reçoit notification "Retrait complété: 196,000 FCFA"
16. Paul reçoit SMS Orange Money

### Cas 3: Admin configure un compte Mobile Money

**Scénario**: Admin ajoute un compte MTN

1. Admin va sur "Paramètres" > "Mobile Money"
2. Clique sur "Ajouter un compte"
3. Sélectionne "MTN Mobile Money"
4. Entre le nom: "InterShop SARL"
5. Entre le numéro: +237 670 00 00 00
6. Sélectionne pays: "Cameroun"
7. Active le compte
8. Sauvegarde
9. Le compte apparaît dans la liste
10. Les utilisateurs peuvent maintenant déposer via MTN

## Règles métier

### Dépôts
1. Validation admin obligatoire pour tous les dépôts
2. Référence Mobile Money obligatoire
3. Vérification manuelle de la transaction
4. Pas de frais pour l'utilisateur
5. Crédit immédiat après validation

### Retraits
1. Débit immédiat du solde utilisateur
2. Traitement admin dans les 24h
3. Frais de 2% appliqués
4. Minimum 1,000 FCFA, maximum 500,000 FCFA
5. Recréditer si rejeté

### Transactions
1. Toutes les transactions sont tracées
2. Historique conservé indéfiniment
3. Notifications automatiques
4. Logs d'audit pour conformité

### Limites
1. 5 transactions maximum par jour
2. 2,000,000 FCFA maximum par jour
3. Compte vérifié requis (email + téléphone)
4. Blocage automatique si activité suspecte

## Intégrations futures

### Phase 2 (optionnel)
- API Mobile Money pour validation automatique
- Webhook pour notifications temps réel
- QR Code pour dépôts rapides
- Paiement direct depuis le portefeuille
- Transfert entre utilisateurs
- Cashback et promotions

### APIs Mobile Money
- MTN MoMo API
- Orange Money API
- Moov Money API
- Express Union API

## Métriques à suivre

### Financières
- Volume total des dépôts
- Volume total des retraits
- Frais collectés
- Solde moyen des utilisateurs
- Transactions par jour/mois

### Opérationnelles
- Temps moyen de validation dépôt
- Temps moyen de traitement retrait
- Taux de rejet dépôt
- Taux de rejet retrait
- Nombre de litiges

### Utilisateurs
- Nombre d'utilisateurs avec portefeuille
- Utilisateurs actifs (transactions dans les 30 jours)
- Montant moyen par transaction
- Fréquence d'utilisation

## Conformité

### Légal
- Enregistrement comme établissement de paiement (si requis)
- Conformité KYC (Know Your Customer)
- Lutte contre le blanchiment d'argent
- Protection des données financières
- Conditions générales d'utilisation

### Comptabilité
- Registre de toutes les transactions
- Rapports mensuels
- Déclarations fiscales
- Audit trail complet
