# Formulaire Dynamique de Méthodes de Paiement

## Date: 2026-02-16

## Amélioration Implémentée

Le formulaire d'ajout de méthodes de paiement affiche maintenant uniquement les champs pertinents selon le type de méthode sélectionné, pour une meilleure expérience utilisateur admin.

## Types de Méthodes et Champs Associés

### 1. Mobile Money (📱)

**Champs affichés:**
- Numéro de téléphone * (obligatoire)
- Nom du compte (optionnel)

**Exemple:**
```
Numéro: +237 670 00 00 00
Nom: InterShop
```

**Placeholder instructions:**
> "Envoyez le montant au numéro ci-dessous via votre application Mobile Money..."

### 2. M-Pesa (💳)

**Champs affichés:**
- Numéro de téléphone * (obligatoire)
- Nom du compte (optionnel)

**Exemple:**
```
Numéro: +254 712 345 678
Nom: InterShop Kenya
```

**Placeholder instructions:**
> "Allez dans M-Pesa, sélectionnez 'Envoyer de l'argent', entrez le numéro..."

### 3. Cryptomonnaie (₿)

**Champs affichés:**
- Adresse du wallet * (obligatoire)
- Réseau / Blockchain * (obligatoire - sélection)
  - BEP20 (Binance Smart Chain)
  - TRC20 (Tron)
  - ERC20 (Ethereum)
  - Bitcoin
  - Polygon
  - Solana

**Exemple:**
```
Adresse: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Réseau: BEP20
```

**Avertissement affiché:**
> ⚠️ Vérifiez bien l'adresse et le réseau. Une erreur peut entraîner une perte de fonds.

**Placeholder instructions:**
> "Envoyez le montant en USDT sur le réseau BEP20 à l'adresse ci-dessous..."

### 4. Virement Bancaire (🏦)

**Champs affichés:**
- Nom de la banque * (obligatoire)
- Numéro de compte * (obligatoire)
- Nom du titulaire * (obligatoire)

**Exemple:**
```
Banque: Ecobank
Numéro: 1234567890
Titulaire: InterShop SARL
```

**Placeholder instructions:**
> "Effectuez un virement bancaire vers le compte ci-dessous..."

### 5. Autre (💰)

**Champs affichés:**
- Informations de paiement * (textarea, obligatoire)

**Exemple:**
```
Informations: Contactez-nous au +237 XXX XX XX XX 
pour obtenir les coordonnées de paiement Western Union
```

**Placeholder instructions:**
> "Contactez-nous pour obtenir les instructions de paiement..."

## Logique du Formulaire

### Champs Communs (Toujours Affichés)

1. **Nom de la méthode** *
   - Exemple: "MTN Mobile Money", "Orange Money", "USDT BEP20"

2. **Type de méthode** * (sélection)
   - Déclenche l'affichage des champs spécifiques

3. **Instructions de paiement** * (textarea)
   - Placeholder dynamique selon le type
   - Affiché aux clients lors du paiement

### Champs Dynamiques

Les champs s'affichent/masquent automatiquement selon le type sélectionné:

```typescript
{formData.type === 'mobile_money' && (
  // Afficher champs Mobile Money
)}

{formData.type === 'crypto' && (
  // Afficher champs Crypto
)}

// etc.
```

## Avantages de Cette Approche

### 1. Clarté pour l'Admin
- ✅ Pas de confusion avec des champs non pertinents
- ✅ Formulaire plus court et ciblé
- ✅ Moins d'erreurs de saisie

### 2. Validation Contextuelle
- ✅ Champs obligatoires adaptés au type
- ✅ Placeholders pertinents
- ✅ Avertissements spécifiques (crypto)

### 3. Expérience Utilisateur
- ✅ Interface intuitive
- ✅ Guidage visuel avec icônes
- ✅ Instructions contextuelles

## Exemple de Flux Utilisateur

### Scénario 1: Ajout Mobile Money

1. Admin clique "Ajouter une méthode"
2. Entre le nom: "MTN Mobile Money"
3. Sélectionne type: "📱 Mobile Money"
4. **Formulaire affiche uniquement:**
   - Numéro de téléphone
   - Nom du compte
5. Entre: "+237 670 00 00 00"
6. Entre instructions: "Envoyez via MTN MoMo..."
7. Clique "Créer"

### Scénario 2: Ajout Crypto

1. Admin clique "Ajouter une méthode"
2. Entre le nom: "USDT BEP20"
3. Sélectionne type: "₿ Cryptomonnaie"
4. **Formulaire affiche uniquement:**
   - Adresse wallet (avec avertissement)
   - Sélection réseau
5. Entre adresse: "0x742d35..."
6. Sélectionne réseau: "BEP20"
7. Voit l'avertissement de sécurité
8. Entre instructions détaillées
9. Clique "Créer"

### Scénario 3: Ajout Virement Bancaire

1. Admin clique "Ajouter une méthode"
2. Entre le nom: "Ecobank Cameroun"
3. Sélectionne type: "🏦 Virement Bancaire"
4. **Formulaire affiche uniquement:**
   - Nom de la banque
   - Numéro de compte
   - Nom du titulaire
5. Remplit tous les champs bancaires
6. Entre instructions de virement
7. Clique "Créer"

## Structure des Données Sauvegardées

Selon le type, seuls les champs pertinents sont remplis:

### Mobile Money
```json
{
  "name": "MTN Mobile Money",
  "type": "mobile_money",
  "instructions": "Envoyez via MTN MoMo...",
  "accountDetails": {
    "accountNumber": "+237 670 00 00 00",
    "accountName": "InterShop",
    "bankName": "",
    "walletAddress": "",
    "network": "",
    "additionalInfo": ""
  }
}
```

### Crypto
```json
{
  "name": "USDT BEP20",
  "type": "crypto",
  "instructions": "Envoyez USDT sur BEP20...",
  "accountDetails": {
    "accountNumber": "",
    "accountName": "",
    "bankName": "",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "network": "BEP20",
    "additionalInfo": ""
  }
}
```

### Virement Bancaire
```json
{
  "name": "Ecobank Cameroun",
  "type": "bank_transfer",
  "instructions": "Effectuez un virement...",
  "accountDetails": {
    "accountNumber": "1234567890",
    "accountName": "InterShop SARL",
    "bankName": "Ecobank",
    "walletAddress": "",
    "network": "",
    "additionalInfo": ""
  }
}
```

## Validation

### Champs Obligatoires par Type

**Mobile Money / M-Pesa:**
- ✅ Nom
- ✅ Instructions
- ✅ Numéro de téléphone

**Crypto:**
- ✅ Nom
- ✅ Instructions
- ✅ Adresse wallet
- ✅ Réseau

**Virement Bancaire:**
- ✅ Nom
- ✅ Instructions
- ✅ Nom de la banque
- ✅ Numéro de compte
- ✅ Nom du titulaire

**Autre:**
- ✅ Nom
- ✅ Instructions
- ✅ Informations de paiement

## Améliorations Futures Possibles

1. **Validation en temps réel**
   - Format de numéro de téléphone selon le pays
   - Validation d'adresse crypto (checksum)
   - Validation IBAN pour virements internationaux

2. **Prévisualisation**
   - Montrer comment le client verra la méthode
   - Aperçu des instructions formatées

3. **Templates**
   - Instructions pré-remplies par type
   - Modèles personnalisables

4. **Multi-devises**
   - Support de plusieurs devises par méthode
   - Taux de change automatiques

5. **Limites**
   - Montant minimum/maximum par méthode
   - Frais variables selon le montant

## Résumé

Le formulaire dynamique améliore significativement l'expérience admin en affichant uniquement les champs pertinents pour chaque type de méthode de paiement. Cela réduit la confusion, les erreurs et rend la configuration plus intuitive.
