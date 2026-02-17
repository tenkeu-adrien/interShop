# 🔧 Correction - user.uid vs user.id

## ❌ Erreur rencontrée

```
Error: userId est requis
at sendPhoneVerificationCode (verification.ts:255:13)
at handleSendCode (page.tsx:161:61)
```

## 🔍 Cause du problème

Le code utilisait `user.uid` alors que le type `User` dans le projet utilise `user.id`.

### Structure du type User

```typescript
// types/index.ts
export interface User {
  id: string;        // ✅ Correct
  email: string;
  // ... autres propriétés
}
```

### Code erroné

```typescript
// ❌ AVANT - Incorrect
await sendPhoneVerificationCode(
  user.uid,  // undefined car la propriété n'existe pas
  fullPhoneNumber,
  recaptchaVerifier
);
```

## ✅ Correction apportée

**Fichier**: `app/verify-phone/page.tsx`

Remplacement de toutes les occurrences de `user.uid` par `user.id` :

### 1. Envoi du code SMS (ligne 163)

```typescript
// ✅ APRÈS - Correct
await sendPhoneVerificationCode(
  user.id,  // Utilise la bonne propriété
  fullPhoneNumber,
  recaptchaVerifier
);
```

### 2. Vérification du code (ligne 220)

```typescript
// ✅ APRÈS - Correct
await verifyPhoneCode(user.id, verificationId, code);
```

### 3. Renvoi du code (ligne 256)

```typescript
// ✅ APRÈS - Correct
await resendPhoneVerificationCode(
  user.id,
  fullPhoneNumber,
  recaptchaVerifier
);
```

## 📝 Explication

### Pourquoi cette confusion ?

Firebase Authentication utilise `uid` comme identifiant utilisateur :

```typescript
// Firebase Auth User
const firebaseUser = auth.currentUser;
console.log(firebaseUser.uid); // ✅ Existe dans Firebase
```

Mais dans ce projet, le type `User` personnalisé utilise `id` :

```typescript
// Notre type User personnalisé
interface User {
  id: string;  // Mappé depuis Firebase uid
  email: string;
  // ...
}
```

### Où se fait le mapping ?

Le mapping de `uid` vers `id` se fait probablement dans `lib/firebase/auth.ts` lors de la création ou récupération de l'utilisateur :

```typescript
// Exemple de mapping
const user: User = {
  id: firebaseUser.uid,  // uid de Firebase → id dans notre type
  email: firebaseUser.email,
  // ...
};
```

## 🧪 Test

Après cette correction, la vérification téléphone devrait fonctionner :

1. ✅ reCAPTCHA s'initialise
2. ✅ L'utilisateur entre son numéro
3. ✅ Le SMS est envoyé via Firebase Auth
4. ✅ L'utilisateur entre le code reçu
5. ✅ Le téléphone est vérifié

## 🔍 Vérification dans d'autres fichiers

Pour éviter ce problème ailleurs, vérifier que tous les fichiers utilisent `user.id` et non `user.uid` :

```bash
# Chercher les occurrences de user.uid
grep -r "user\.uid" app/ lib/ components/
```

Si des occurrences sont trouvées, les remplacer par `user.id`.

## 📚 Bonnes pratiques

### 1. Utiliser le type User partout

```typescript
import { User } from '@/types';

// ✅ Bon
function myFunction(user: User) {
  console.log(user.id); // TypeScript valide
}

// ❌ Mauvais
function myFunction(user: any) {
  console.log(user.uid); // Pas de vérification TypeScript
}
```

### 2. Vérifier l'existence de l'utilisateur

```typescript
// ✅ Bon
if (!user || !user.id) {
  throw new Error('Utilisateur non connecté');
}

// ❌ Insuffisant
if (!user) {
  throw new Error('Utilisateur non connecté');
}
```

### 3. Utiliser des assertions TypeScript

```typescript
// ✅ Bon - TypeScript vérifie que user.id existe
const userId: string = user.id;

// ❌ Mauvais - Pas de vérification
const userId = user.uid; // TypeScript ne détecte pas l'erreur si any
```

## ✅ Résultat

- ✅ Toutes les occurrences de `user.uid` remplacées par `user.id`
- ✅ Aucune erreur TypeScript
- ✅ La vérification téléphone devrait maintenant fonctionner
- ✅ Phone Authentication activé dans Firebase Console

## 🚀 Prochaines étapes

1. Tester l'envoi du code SMS
2. Vérifier la réception du SMS
3. Tester la vérification du code
4. Vérifier que le statut de l'utilisateur est mis à jour

---

**Date**: 14 février 2026
**Statut**: ✅ Corrigé
**Fichiers modifiés**: `app/verify-phone/page.tsx`
