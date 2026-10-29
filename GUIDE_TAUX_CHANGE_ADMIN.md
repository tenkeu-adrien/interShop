# 💰 Guide de Gestion des Taux de Change Manuel

## 📋 Vue d'ensemble

Le système de taux de change est maintenant **100% manuel**. L'administrateur définit tous les taux de conversion depuis l'interface admin. Plus d'API externe !

---

## 🎯 Accès à l'interface

### URL de gestion :
- **Français** : `http://localhost:3000/fr/dashboard/admin/exchange-rates`
- **Anglais** : `http://localhost:3000/en/dashboard/admin/exchange-rates`

### Prérequis :
- Compte avec rôle **admin**
- Connexion active

---

## 🚀 Première utilisation

### 1. Initialiser les taux par défaut

Si c'est la première fois, initialisez les taux avec des valeurs de base :

```bash
npx tsx scripts/seedExchangeRates.ts
```

Ce script crée **17 devises** avec des taux approximatifs :
- USD (Dollar Américain) - Base : 1
- CDF (Franc Congolais) - 2800
- XOF (Franc CFA BCEAO) - 600
- XAF (Franc CFA BEAC) - 600
- GHS (Cedi Ghanéen) - 12
- NGN (Naira Nigérian) - 1500
- KES (Shilling Kenyan) - 130
- TZS (Shilling Tanzanien) - 2500
- UGX (Shilling Ougandais) - 3700
- ZAR (Rand Sud-Africain) - 18
- MAD (Dirham Marocain) - 10
- EGP (Livre Égyptienne) - 48
- ETB (Birr Éthiopien) - 120
- GNF (Franc Guinéen) - 8600
- RWF (Franc Rwandais) - 1300
- MGA (Ariary Malgache) - 4500
- MUR (Roupie Mauricienne) - 45

---

## ⚙️ Fonctionnalités

### 📊 Tableau des taux

Affiche toutes les devises avec :
- **Drapeau et nom** de la devise
- **Taux actuel** (1 USD = X unités)
- **Date de dernière modification**
- **Nom de l'admin** qui a modifié
- **Statut** (Actif/Inactif)

### ✏️ Modifier un taux

1. Cliquez sur l'icône **✏️ Modifier**
2. Entrez le nouveau taux dans le champ
3. Cliquez sur **✓ Sauvegarder** ou **✗ Annuler**

**Exemple** :  
Pour fixer 1 USD = 3000 CDF, entrez `3000` dans le champ du Franc Congolais.

### 👁️ Activer/Désactiver une devise

- Cliquez sur l'icône **👁️/👁️‍🗨️** pour activer/désactiver
- Les devises inactives n'apparaissent pas dans le sélecteur du header
- **USD ne peut pas être désactivé** (devise de base)

### 📈 Appliquer une marge globale

Pour ajuster tous les taux en une fois :

1. Cliquez sur **"Appliquer une Marge"**
2. Entrez un pourcentage :
   - **+5** pour augmenter tous les taux de 5%
   - **-3** pour réduire tous les taux de 3%
3. Cliquez sur **"Appliquer"**

**Use case** :  
Vous voulez ajouter 5% de marge commerciale sur tous vos taux ? Entrez `5` et tous les taux seront multipliés par 1.05.

---

## 🔄 Impact du système

### 1️⃣ **Sélecteur de devise (Header)**

Le sélecteur dans l'en-tête du site utilise les taux admin :
- Affiche uniquement les devises **actives**
- Conversion en temps réel selon les taux définis

### 2️⃣ **Prix des produits**

Tous les prix sont convertis automatiquement :
- Prix stocké en USD dans la base de données
- Affiché dans la devise sélectionnée par l'utilisateur
- Utilise les taux que vous avez définis

**Exemple** :  
Produit à 100 USD → Si taux CDF = 3000 → Prix affiché : 300 000 FC

### 3️⃣ **Wallet / Portefeuille**

Les transactions du wallet utilisent aussi ces taux :
- Dépôts
- Retraits
- Paiements
- Conversions entre devises

---

## 💡 Bonnes pratiques

### ✅ Recommandations

1. **Mettez à jour régulièrement** vos taux selon le marché
2. **Ajoutez votre marge** pour couvrir les frais et commissions
3. **Testez les taux** avant de les valider (utilisez un compte client test)
4. **Gardez USD = 1** (devise de base, ne pas modifier)
5. **Documentez vos changements** (l'historique est enregistré)

### ⚠️ À éviter

- ❌ Ne mettez pas de taux à 0 (bloque les conversions)
- ❌ N'utilisez pas de valeurs absurdes (ex: 1 USD = 0.01 CDF)
- ❌ Ne désactivez pas toutes les devises (gardez au moins USD et 2-3 autres actives)

---

## 🗄️ Structure technique

### Collection Firestore : `adminExchangeRates`

Chaque document de devise contient :

```javascript
{
  currency: "CDF",
  currencyName: "Franc Congolais",
  symbol: "FC",
  flag: "CD",
  rateToUSD: 3000,           // 1 USD = 3000 CDF
  isActive: true,
  updatedAt: Timestamp,
  updatedBy: "admin_user_id",
  updatedByName: "Admin Name",
  createdAt: Timestamp
}
```

### Cache

Les taux sont mis en cache pendant **5 minutes** pour optimiser les performances. Les changements sont visibles dans les 5 minutes.

---

## 🔍 Vérification

Pour vérifier que tout fonctionne :

1. ✅ Connectez-vous en tant qu'**admin**
2. ✅ Allez sur `/dashboard/admin/exchange-rates`
3. ✅ Vérifiez que vous voyez la liste des devises
4. ✅ Modifiez un taux (ex: CDF)
5. ✅ Ouvrez la page d'accueil en navigation privée
6. ✅ Changez la devise dans le header
7. ✅ Vérifiez qu'un prix de produit se convertit correctement

---

## 📞 Support

Si vous rencontrez des problèmes :
- Vérifiez la console du navigateur (F12)
- Assurez-vous que Firestore est bien configuré
- Vérifiez que les index sont déployés (`firebase deploy --only firestore:indexes`)
- Relancez le script seed si nécessaire

---

## 📝 Changelog

**Version 1.0** (2026)
- ✅ Système manuel complet
- ✅ Interface admin intuitive
- ✅ 17 devises supportées
- ✅ Marge globale
- ✅ Activation/désactivation
- ✅ Historique des modifications
- ✅ Cache optimisé

---

**🎉 Vous avez maintenant le contrôle total sur vos taux de change !**
