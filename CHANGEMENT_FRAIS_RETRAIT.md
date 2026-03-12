# 📝 Changement des Frais de Retrait

## 🎯 Objectif
Réduire les frais de retrait de **2%** à **0.5%** dans le système de wallet InterAppShop.

---

## ✅ Modifications Effectuées

### 1. Configuration par défaut (`lib/firebase/wallet.ts`)
**Ligne 223** : Changement du paramètre `withdrawalFeePercent`

```typescript
// AVANT
withdrawalFeePercent: 2,

// APRÈS
withdrawalFeePercent: 0.5,
```

### 2. Interface utilisateur (`components/wallet/WithdrawalModal.tsx`)
**Ligne 222** : Mise à jour de l'affichage des frais

```typescript
// AVANT
<span className="text-gray-600">Frais (2%)</span>

// APRÈS
<span className="text-gray-600">Frais (0.5%)</span>
```

---

## 📊 Impact sur les Utilisateurs

### Exemple de calcul pour un retrait de 100,000 FCFA

| Paramètre | Avant (2%) | Après (0.5%) | Économie |
|-----------|------------|--------------|----------|
| Montant retrait | 100,000 FCFA | 100,000 FCFA | - |
| Frais | 2,000 FCFA | 500 FCFA | **1,500 FCFA** |
| Montant reçu | 98,000 FCFA | 99,500 FCFA | **+1,500 FCFA** |

### Autres exemples

| Montant | Frais (2%) | Frais (0.5%) | Économie |
|---------|------------|--------------|----------|
| 10,000 FCFA | 200 FCFA | 100 FCFA* | 100 FCFA |
| 50,000 FCFA | 1,000 FCFA | 250 FCFA | 750 FCFA |
| 100,000 FCFA | 2,000 FCFA | 500 FCFA | 1,500 FCFA |
| 200,000 FCFA | 4,000 FCFA | 1,000 FCFA* | 3,000 FCFA |
| 500,000 FCFA | 10,000 FCFA | 2,500 FCFA | 7,500 FCFA |

*Note : Les frais sont plafonnés entre 100 FCFA (minimum) et 1,000 FCFA (maximum)*

---

## 🔧 Mise à Jour de la Base de Données

### Pour les installations existantes

Si vous avez déjà des paramètres wallet dans Firestore, exécutez le script de mise à jour :

```bash
npx ts-node scripts/updateWithdrawalFees.ts
```

Ce script va :
1. ✅ Vérifier les paramètres actuels
2. ✅ Mettre à jour `withdrawalFeePercent` de 2 à 0.5
3. ✅ Afficher un résumé des changements

### Pour les nouvelles installations

Les nouveaux paramètres seront automatiquement créés avec les frais de 0.5% lors de la première utilisation du wallet.

---

## 📋 Paramètres Wallet Complets

Voici tous les paramètres du système wallet après modification :

```typescript
{
  id: 'global',
  
  // FRAIS DE DÉPÔT
  depositFeePercent: 1,           // 1% de frais
  depositFeeMin: 50,              // Minimum 50 FCFA
  depositFeeThreshold: 5000,      // Gratuit si > 5,000 FCFA
  
  // FRAIS DE RETRAIT (MODIFIÉ)
  withdrawalFeePercent: 0.5,      // 0.5% de frais (était 2%)
  withdrawalFeeMin: 100,          // Minimum 100 FCFA
  withdrawalFeeMax: 1000,         // Maximum 1,000 FCFA
  
  // LIMITES
  minDeposit: 500,                // Dépôt minimum 500 FCFA
  minWithdrawal: 1000,            // Retrait minimum 1,000 FCFA
  maxWithdrawalPerDay: 500000,    // Max 500,000 FCFA/jour
  maxWithdrawalPerMonth: 2000000, // Max 2,000,000 FCFA/mois
  
  // SÉCURITÉ
  pinRequired: true,
  pinLength: 4,
  maxPinAttempts: 3,
  twoFactorThreshold: 100000,
  lowBalanceThreshold: 1000
}
```

---

## 🎉 Avantages du Changement

### Pour les utilisateurs
- ✅ **Économies importantes** : Jusqu'à 75% de réduction sur les frais
- ✅ **Plus compétitif** : Frais parmi les plus bas du marché
- ✅ **Transparence** : Frais clairement affichés

### Pour la plateforme
- ✅ **Attractivité accrue** : Encourage l'utilisation du wallet
- ✅ **Fidélisation** : Les utilisateurs préfèrent des frais bas
- ✅ **Compétitivité** : Se démarque de la concurrence

---

## 📱 Où les Frais sont Affichés

Les frais de retrait sont affichés dans :

1. **Modal de retrait** (`WithdrawalModal.tsx`)
   - Lors de la saisie du montant
   - Dans le récapitulatif avant confirmation

2. **Calcul automatique** (`lib/firebase/wallet.ts`)
   - Fonction `calculateWithdrawalFees()`
   - Applique automatiquement les min/max

3. **Historique des transactions**
   - Chaque transaction enregistre les frais appliqués

---

## 🔍 Vérification

Pour vérifier que les changements sont bien appliqués :

1. **Dans le code** :
   - Vérifier `lib/firebase/wallet.ts` ligne 223
   - Vérifier `components/wallet/WithdrawalModal.tsx` ligne 222

2. **Dans Firestore** :
   - Collection : `walletSettings`
   - Document : `global`
   - Champ : `withdrawalFeePercent` = 0.5

3. **Dans l'interface** :
   - Ouvrir le modal de retrait
   - Saisir un montant (ex: 100,000 FCFA)
   - Vérifier que les frais affichés sont de 500 FCFA (0.5%)

---

## 📅 Date de Mise en Production

**Date** : 12 Mars 2026
**Version** : 1.1.0
**Statut** : ✅ Implémenté et testé

---

## 🆘 Support

En cas de problème avec les frais de retrait :

1. Vérifier que le script de mise à jour a été exécuté
2. Vérifier les paramètres dans Firestore
3. Vider le cache du navigateur
4. Contacter le support technique

---

**Dernière mise à jour** : 12 Mars 2026
