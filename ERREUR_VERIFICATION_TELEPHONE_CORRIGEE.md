# 🔧 Correction - Erreur de Vérification Téléphone

## ❌ Erreur rencontrée

```
TypeError: Cannot read properties of undefined (reading 'indexOf')
at ResourcePath.fromString (path.ts:273:16)
at doc (reference.ts:646:39)
at sendPhoneVerificationCode (verification.ts:262:37)
```

Et aussi :
```
❌ Erreur initialisation reCAPTCHA: FirebaseError: Firebase: Error (auth/network-request-failed)
```

## 🔍 Analyse du problème

### Problème 1 : Paramètres undefined
L'erreur `Cannot read properties of undefined (reading 'indexOf')` indique qu'un paramètre passé à `doc()` était `undefined`. Cela se produisait lorsque :
- `userId` était `undefined` ou `null`
- La fonction était appelée avant que l'utilisateur soit chargé

### Problème 2 : Erreur réseau reCAPTCHA
L'erreur `auth/network-request-failed` indique un problème de connexion réseau ou de configuration Firebase.

## ✅ Corrections apportées

### 1. Validation des paramètres dans `sendPhoneVerificationCode`

**Fichier**: `lib/firebase/verification.ts`

Ajout de validations strictes au début de la fonction :

```typescript
export async function sendPhoneVerificationCode(
  userId: string,
  phoneNumber: string,
  recaptchaVerifier: any
): Promise<string> {
  try {
    // Vérifier les paramètres
    if (!userId) {
      throw new Error('userId est requis');
    }
    
    if (!phoneNumber) {
      throw new Error('phoneNumber est requis');
    }
    
    // Vérifier que recaptchaVerifier est fourni
    if (!recaptchaVerifier) {
      throw new Error('reCAPTCHA verifier non fourni');
    }
    
    // ... reste du code
  }
}
```

### 2. Vérification de l'utilisateur dans la page

**Fichier**: `app/verify-phone/page.tsx`

La page vérifie déjà que `user` existe avant d'appeler la fonction :

```typescript
const handleSendCode = async () => {
  if (!user) return; // ✅ Déjà présent
  
  // ... reste du code
}
```

## 🚨 Problèmes restants à résoudre

### 1. Configuration Firebase Phone Authentication

L'erreur `auth/network-request-failed` peut être causée par :

#### A. Phone Authentication non activé dans Firebase Console

**Solution** :
1. Aller dans Firebase Console : https://console.firebase.google.com
2. Sélectionner le projet `interappshop`
3. Aller dans **Authentication** > **Sign-in method**
4. Activer **Phone** dans la liste des fournisseurs
5. Configurer les numéros de test si nécessaire

#### B. Domaine non autorisé

**Solution** :
1. Dans Firebase Console > **Authentication** > **Settings**
2. Onglet **Authorized domains**
3. Ajouter `localhost` pour le développement
4. Ajouter votre domaine de production

#### C. reCAPTCHA v3 non configuré

**Solution** :
1. Aller dans Google Cloud Console
2. Activer l'API reCAPTCHA Enterprise
3. Créer une clé reCAPTCHA v3
4. Ajouter la clé dans Firebase Console

### 2. Problème de connexion réseau

Si vous êtes derrière un proxy ou un pare-feu :

**Solution** :
- Vérifier que les domaines Firebase sont accessibles :
  - `firebaseapp.com`
  - `googleapis.com`
  - `google.com`
- Désactiver temporairement le VPN/proxy pour tester

### 3. Configuration du projet Firebase

Vérifier que le fichier `.env.local` contient les bonnes credentials :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=interappshop.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=interappshop
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=interappshop.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

## 🧪 Tests à effectuer

### Test 1 : Vérifier que Phone Auth est activé

```bash
# Dans la console Firebase, vérifier :
Authentication > Sign-in method > Phone > Enabled
```

### Test 2 : Tester avec un numéro de test

Dans Firebase Console :
1. **Authentication** > **Sign-in method** > **Phone**
2. Ajouter un numéro de test : `+237 651 50 39 14`
3. Ajouter un code de test : `123456`
4. Tester avec ce numéro

### Test 3 : Vérifier les logs

Ouvrir la console du navigateur et vérifier :
- ✅ `reCAPTCHA initialisé` apparaît
- ✅ `Envoi SMS vers: +237651503914` apparaît
- ❌ Pas d'erreur `auth/network-request-failed`

## 📝 Messages d'erreur améliorés

Les messages d'erreur sont maintenant plus clairs :

| Erreur | Message |
|--------|---------|
| `userId` manquant | "userId est requis" |
| `phoneNumber` manquant | "phoneNumber est requis" |
| reCAPTCHA non initialisé | "reCAPTCHA verifier non fourni" |
| Utilisateur non trouvé | "Utilisateur non trouvé" |
| Numéro invalide | "Numéro de téléphone invalide" |
| Erreur réseau | "Erreur réseau. Vérifiez votre connexion." |

## 🔄 Prochaines étapes

1. **Activer Phone Authentication dans Firebase Console** (priorité haute)
2. **Ajouter un numéro de test** pour le développement
3. **Vérifier la configuration reCAPTCHA**
4. **Tester avec un vrai numéro** une fois configuré

## 📞 Support

Si le problème persiste après avoir activé Phone Authentication :

1. Vérifier les logs Firebase Console > **Authentication** > **Users**
2. Vérifier les quotas Firebase (gratuit = 10,000 vérifications/mois)
3. Vérifier que le projet Firebase est bien `interappshop`
4. Consulter la documentation : https://firebase.google.com/docs/auth/web/phone-auth

## ✅ Résumé

- ✅ Validation des paramètres ajoutée
- ✅ Messages d'erreur améliorés
- ⏳ Phone Authentication à activer dans Firebase Console
- ⏳ Configuration reCAPTCHA à vérifier
- ⏳ Tests avec numéro de test à effectuer

---

**Date**: 14 février 2026
**Statut**: Correction partielle - Configuration Firebase requise
