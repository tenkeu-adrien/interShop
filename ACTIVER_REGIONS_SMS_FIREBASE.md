# 🌍 Activer les Régions SMS dans Firebase

## ❌ Erreur rencontrée

```
FirebaseError: Firebase: SMS unable to be sent until this region enabled by the app developer. 
(auth/operation-not-allowed)
```

## 🔍 Explication du problème

Firebase Phone Authentication nécessite que vous **activiez explicitement les régions** vers lesquelles vous souhaitez envoyer des SMS. Par défaut, aucune région n'est activée pour des raisons de sécurité et de coût.

### Pourquoi cette restriction ?

1. **Sécurité** : Éviter l'envoi de SMS vers des régions non autorisées
2. **Coûts** : Les SMS ont un coût variable selon les pays
3. **Conformité** : Respecter les réglementations locales

## ✅ Solution : Activer les régions africaines

### Étape 1 : Accéder à Firebase Console

1. Aller sur : https://console.firebase.google.com
2. Sélectionner votre projet : **interappshop**
3. Cliquer sur **Authentication** dans le menu de gauche

### Étape 2 : Configurer Phone Authentication

1. Cliquer sur l'onglet **Sign-in method**
2. Trouver **Phone** dans la liste des fournisseurs
3. Cliquer sur **Phone** pour ouvrir les paramètres

### Étape 3 : Activer les régions

Dans les paramètres de Phone Authentication :

1. Chercher la section **"Phone number sign-in countries"** ou **"Allowed countries"**
2. Par défaut, elle peut être vide ou limitée
3. Cliquer sur **"Add country"** ou **"Edit"**

### Étape 4 : Ajouter les pays africains

Ajouter les pays suivants (selon vos besoins) :

#### Pays prioritaires pour votre application

- 🇨🇲 **Cameroun** (+237)
- 🇨🇮 **Côte d'Ivoire** (+225)
- 🇸🇳 **Sénégal** (+221)
- 🇧🇫 **Burkina Faso** (+226)
- 🇲🇱 **Mali** (+223)
- 🇳🇪 **Niger** (+227)
- 🇹🇬 **Togo** (+228)
- 🇧🇯 **Bénin** (+229)
- 🇬🇭 **Ghana** (+233)
- 🇳🇬 **Nigeria** (+234)

#### Autres pays africains (optionnel)

- 🇨🇩 **RD Congo** (+243)
- 🇨🇬 **Congo** (+242)
- 🇬🇦 **Gabon** (+241)
- 🇨🇫 **Centrafrique** (+236)
- 🇹🇩 **Tchad** (+235)
- 🇬🇶 **Guinée Équatoriale** (+240)
- 🇬🇲 **Gambie** (+220)
- 🇬🇳 **Guinée** (+224)
- 🇬🇼 **Guinée-Bissau** (+245)
- 🇱🇷 **Liberia** (+231)

### Étape 5 : Sauvegarder

1. Cliquer sur **Save** ou **Enregistrer**
2. Attendre quelques secondes que la configuration se propage

## 🎯 Configuration alternative : Utiliser l'API Cloud Console

Si l'option n'est pas visible dans Firebase Console, vous devez la configurer via Google Cloud Console :

### Méthode 1 : Via Google Cloud Console

1. Aller sur : https://console.cloud.google.com
2. Sélectionner le projet **interappshop**
3. Aller dans **APIs & Services** > **Credentials**
4. Trouver votre clé API (celle dans .env.local)
5. Cliquer sur la clé API
6. Dans **API restrictions**, vérifier que **Identity Toolkit API** est activée
7. Dans **Application restrictions**, configurer les domaines autorisés

### Méthode 2 : Activer Identity Toolkit API

1. Aller sur : https://console.cloud.google.com/apis/library
2. Chercher **"Identity Toolkit API"**
3. Cliquer sur **Enable** si ce n'est pas déjà fait
4. Aller dans **Identity Toolkit** > **Settings**
5. Configurer les **SMS regions**

### Méthode 3 : Via Firebase CLI

```bash
# Installer Firebase CLI si pas déjà fait
npm install -g firebase-tools

# Se connecter
firebase login

# Sélectionner le projet
firebase use interappshop

# Configurer les régions (exemple)
firebase auth:config:set --phone-regions CM,CI,SN,BF,ML,NE,TG,BJ,GH,NG
```

## 📋 Liste des codes pays ISO

Pour la configuration, vous aurez besoin des codes ISO à 2 lettres :

| Pays | Code ISO | Indicatif |
|------|----------|-----------|
| Cameroun | CM | +237 |
| Côte d'Ivoire | CI | +225 |
| Sénégal | SN | +221 |
| Burkina Faso | BF | +226 |
| Mali | ML | +223 |
| Niger | NE | +227 |
| Togo | TG | +228 |
| Bénin | BJ | +229 |
| Ghana | GH | +233 |
| Nigeria | NG | +234 |
| RD Congo | CD | +243 |
| Congo | CG | +242 |
| Gabon | GA | +241 |
| Centrafrique | CF | +236 |
| Tchad | TD | +235 |
| Guinée Équatoriale | GQ | +240 |
| Gambie | GM | +220 |
| Guinée | GN | +224 |
| Guinée-Bissau | GW | +245 |
| Liberia | LR | +231 |

## 💰 Coûts des SMS par région

Firebase utilise les tarifs de Twilio/MessageBird. Voici une estimation :

| Région | Coût approximatif par SMS |
|--------|---------------------------|
| Afrique de l'Ouest | $0.05 - $0.15 |
| Afrique Centrale | $0.08 - $0.20 |
| Nigeria | $0.10 - $0.25 |

**Note** : Les coûts varient selon l'opérateur et peuvent changer.

### Plan gratuit Firebase

- **Spark Plan (gratuit)** : Pas d'envoi de SMS
- **Blaze Plan (pay-as-you-go)** : SMS facturés selon utilisation

⚠️ **Important** : Vous devez passer au **Blaze Plan** pour envoyer des SMS réels.

## 🧪 Solution temporaire : Numéros de test

En attendant d'activer les régions ou de passer au Blaze Plan, utilisez des **numéros de test** :

### Configuration des numéros de test

1. Firebase Console > **Authentication** > **Sign-in method**
2. Cliquer sur **Phone**
3. Descendre jusqu'à **"Phone numbers for testing"**
4. Ajouter des numéros de test :

```
Numéro : +237651503914
Code : 123456
```

```
Numéro : +225070000000
Code : 654321
```

### Avantages des numéros de test

- ✅ Gratuit (pas de SMS réel envoyé)
- ✅ Fonctionne sans Blaze Plan
- ✅ Pas besoin d'activer les régions
- ✅ Code de vérification fixe (pas de SMS)

### Inconvénients

- ❌ Limité à quelques numéros
- ❌ Pas de SMS réel (pour les tests uniquement)
- ❌ Code fixe (moins sécurisé)

## 🔧 Vérification de la configuration

### 1. Vérifier que Phone Auth est activé

```bash
# Dans Firebase Console
Authentication > Sign-in method > Phone > Enabled ✅
```

### 2. Vérifier les régions autorisées

```bash
# Dans Firebase Console
Authentication > Sign-in method > Phone > Allowed countries
# Doit contenir au moins : CM, CI, SN, BF, etc.
```

### 3. Vérifier le plan Firebase

```bash
# Dans Firebase Console
Settings > Usage and billing > Plan
# Doit être "Blaze" pour les SMS réels
```

### 4. Vérifier Identity Toolkit API

```bash
# Dans Google Cloud Console
APIs & Services > Enabled APIs
# "Identity Toolkit API" doit être activée ✅
```

## 📝 Checklist complète

- [ ] Phone Authentication activé dans Firebase Console
- [ ] Régions africaines ajoutées dans "Allowed countries"
- [ ] Identity Toolkit API activée dans Google Cloud Console
- [ ] Plan Blaze activé (pour SMS réels) OU numéros de test configurés
- [ ] Domaines autorisés configurés (localhost + production)
- [ ] Clé API correcte dans .env.local
- [ ] reCAPTCHA configuré et fonctionnel

## 🚀 Après configuration

Une fois les régions activées :

1. **Attendre 2-5 minutes** pour la propagation
2. **Rafraîchir la page** de vérification téléphone
3. **Tester avec un vrai numéro** du Cameroun (+237)
4. **Vérifier la réception du SMS**
5. **Entrer le code reçu**

## ⚠️ Erreurs courantes

### Erreur 1 : "auth/operation-not-allowed"
**Solution** : Activer les régions comme décrit ci-dessus

### Erreur 2 : "auth/quota-exceeded"
**Solution** : Passer au Blaze Plan ou attendre le reset du quota

### Erreur 3 : "auth/invalid-phone-number"
**Solution** : Vérifier le format : +237XXXXXXXXX (avec indicatif)

### Erreur 4 : "auth/too-many-requests"
**Solution** : Attendre quelques minutes avant de réessayer

## 📞 Support

Si le problème persiste :

1. Vérifier les logs Firebase Console > **Authentication** > **Usage**
2. Vérifier les quotas Google Cloud Console > **IAM & Admin** > **Quotas**
3. Contacter le support Firebase si nécessaire

## ✅ Résumé

Pour envoyer des SMS au Cameroun (+237) :

1. ✅ Activer Phone Authentication
2. ✅ Ajouter le Cameroun (CM) dans les régions autorisées
3. ✅ Passer au Blaze Plan (ou utiliser des numéros de test)
4. ✅ Attendre la propagation (2-5 minutes)
5. ✅ Tester l'envoi de SMS

---

**Date**: 14 février 2026
**Statut**: Configuration requise
**Action requise**: Activer les régions dans Firebase Console
