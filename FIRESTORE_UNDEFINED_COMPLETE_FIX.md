# Correction Complète: Erreurs Firestore "undefined"

## Résumé des Problèmes

Firestore rejette toutes les valeurs `undefined` dans les documents. Nous avons rencontré ce problème dans 3 endroits différents:

1. ✅ **Conversations** - Champ `photo` des utilisateurs
2. ✅ **Messages** - Champs optionnels (photo, fichiers, etc.)
3. ✅ **Notifications** - Champ `data` optionnel

## Erreurs Rencontrées

### Erreur 1: Conversations
```
FirebaseError: Function addDoc() called with invalid data. 
Unsupported field value: undefined 
(found in field participantsData.ux1jhAeMF7cLYRrVfItmhyCHRLp2.photo 
in document conversations/biAWsVyH1GekLZUdVjsP)
```

### Erreur 2: Notifications
```
FirebaseError: Function addDoc() called with invalid data. 
Unsupported field value: undefined 
(found in field type in document notifications/Q1uB2WobS5es4edaACuB)
```

## Solutions Appliquées

### 1. `lib/firebase/chat.ts` - Fonction `getOrCreateConversation`

**Problème:** Les champs `photo` des utilisateurs pouvaient être `undefined`.

**Solution:**
```typescript
// Nettoyer les données utilisateur
const cleanUser1Data = {
  name: user1Data.name,
  role: user1Data.role,
  ...(user1Data.photo && { photo: user1Data.photo })  // ✅ Ajouté seulement si existe
};

const cleanUser2Data = {
  name: user2Data.name,
  role: user2Data.role,
  ...(user2Data.photo && { photo: user2Data.photo })  // ✅ Ajouté seulement si existe
};

const conversationData: any = {
  participants: [userId1, userId2],
  participantsData: {
    [userId1]: cleanUser1Data,
    [userId2]: cleanUser2Data,
  },
  unreadCount: {
    [userId1]: 0,
    [userId2]: 0,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Ajouter productContext seulement s'il existe
if (productContext) {
  conversationData.productContext = productContext;
}
```

### 2. `lib/firebase/chat.ts` - Fonction `sendMessage`

**Problème:** Plusieurs champs optionnels pouvaient être `undefined`.

**Solution:**
```typescript
const messageData: any = {
  conversationId,
  senderId,
  senderName,
  receiverId,
  content,
  type,
  isRead: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Ajouter les champs optionnels seulement s'ils existent
if (senderPhoto) messageData.senderPhoto = senderPhoto;
if (fileUrl) messageData.fileUrl = fileUrl;
if (fileName) messageData.fileName = fileName;
if (fileSize) messageData.fileSize = fileSize;
if (thumbnailUrl) messageData.thumbnailUrl = thumbnailUrl;
if (productReference) messageData.productReference = productReference;
```

### 3. `lib/firebase/chat.ts` - Appel à `createNotification`

**Problème:** Mauvaise signature d'appel + `productId` pouvait être `undefined`.

**Avant:**
```typescript
await createNotification({
  userId: receiverId,
  type: 'message_received',
  title: 'Nouveau message',
  message: `${senderName} vous a envoyé un message`,
  data: {
    conversationId,
    senderId,
    messageType: type,
    productId: productReference?.productId,  // ❌ Peut être undefined
  },
});
```

**Après:**
```typescript
await createNotification(
  receiverId,
  'message_received',
  'Nouveau message',
  `${senderName} vous a envoyé un message`,
  {
    conversationId,
    senderId,
    messageType: type,
    ...(productReference?.productId && { productId: productReference.productId })  // ✅ Ajouté seulement si existe
  }
);
```

### 4. `lib/firebase/notifications.ts` - Fonction `createNotification`

**Problème:** Le champ `data` optionnel pouvait être `undefined`.

**Solution:**
```typescript
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: any
): Promise<void> => {
  const notificationData: any = {
    userId,
    type,
    title,
    message,
    isRead: false,
    createdAt: new Date(),
  };
  
  // Ajouter data seulement s'il existe
  if (data) {
    notificationData.data = data;
  }
  
  await addDoc(collection(db, 'notifications'), notificationData);
};
```

## Pattern Général

### Règle d'Or
**Avant d'envoyer des données à Firestore, toujours omettre les champs `undefined`.**

### Techniques

#### 1. Spread Operator Conditionnel
```typescript
const obj = {
  requiredField: value,
  ...(optionalValue && { optionalField: optionalValue })
};
```

#### 2. Construction Progressive
```typescript
const obj: any = {
  requiredField: value,
};

if (optionalValue) {
  obj.optionalField = optionalValue;
}
```

#### 3. Fonction Helper
```typescript
function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}
```

## Checklist de Vérification

Avant chaque appel à Firestore (`addDoc`, `updateDoc`, `setDoc`):

- [ ] Vérifier tous les champs optionnels
- [ ] Omettre ou remplacer les `undefined`
- [ ] Vérifier les objets imbriqués
- [ ] Vérifier les arrays
- [ ] Tester avec et sans les valeurs optionnelles

## Tests de Validation

### Test 1: Chat sans Photo
1. Se connecter avec un compte sans photo de profil
2. Aller sur un produit
3. Cliquer sur "Discuter avec le vendeur"
4. ✅ La conversation devrait se créer sans erreur
5. ✅ Le message devrait s'envoyer

### Test 2: Chat avec Photo
1. Se connecter avec un compte avec photo
2. Aller sur un produit
3. Cliquer sur "Demander un devis"
4. ✅ La conversation devrait inclure la photo
5. ✅ Le message devrait s'envoyer

### Test 3: Notifications
1. Envoyer un message
2. Vérifier dans Firestore → Collection `notifications`
3. ✅ Le document ne devrait pas avoir de champs `undefined`
4. ✅ Le champ `data` devrait être présent ou absent (pas undefined)

### Test 4: Vérification Firestore
1. Ouvrir la console Firebase
2. Vérifier les collections:
   - `conversations` → `participantsData` → pas de `undefined`
   - `messages` → pas de champs `undefined`
   - `notifications` → pas de champs `undefined`

## Fichiers Modifiés

1. ✅ `lib/firebase/chat.ts`
   - `getOrCreateConversation` - Nettoie les données utilisateur
   - `sendMessage` - Nettoie les données de message
   - Appel à `createNotification` - Corrigé

2. ✅ `lib/firebase/notifications.ts`
   - `createNotification` - Nettoie le champ `data`

3. ✅ `FIRESTORE_UNDEFINED_COMPLETE_FIX.md` - Ce document

## Prévention Future

### TypeScript Strict Mode
Activer le mode strict dans `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

### Utility Type
Créer un type helper:
```typescript
type FirestoreData<T> = {
  [K in keyof T]: Exclude<T[K], undefined>;
};
```

### Validation Runtime
Ajouter une fonction de validation:
```typescript
function validateFirestoreData(data: any): void {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      throw new Error(`Field "${key}" is undefined`);
    }
    if (typeof value === 'object' && value !== null) {
      validateFirestoreData(value);
    }
  }
}
```

## Ressources

- [Firestore Data Types](https://firebase.google.com/docs/firestore/manage-data/data-types)
- [TypeScript Optional Chaining](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#optional-chaining)
- [JavaScript Nullish Coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)

## Résumé

Tous les problèmes d'`undefined` dans Firestore ont été corrigés. Le système de chat devrait maintenant fonctionner parfaitement, que les utilisateurs aient ou non des photos de profil.

### Avant
- ❌ Erreur lors de la création de conversation
- ❌ Erreur lors de l'envoi de message
- ❌ Erreur lors de la création de notification

### Après
- ✅ Conversations créées sans erreur
- ✅ Messages envoyés correctement
- ✅ Notifications créées avec succès
- ✅ Fonctionne avec ou sans photo de profil
- ✅ Tous les champs optionnels gérés proprement

## Date

13 février 2026
