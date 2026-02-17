# Correction: Erreur Firestore "Unsupported field value: undefined"

## Problème

### Erreur Complète
```
FirebaseError: Function addDoc() called with invalid data. 
Unsupported field value: undefined 
(found in field participantsData.ux1jhAeMF7cLYRrVfItmhyCHRLp2.photo 
in document conversations/biAWsVyH1GekLZUdVjsP)
```

### Cause
Firestore n'accepte pas les valeurs `undefined` dans les documents. Quand un champ optionnel est `undefined`, il faut soit:
1. L'omettre complètement du document
2. Utiliser `null` à la place

Dans notre cas, le champ `photo` des utilisateurs était optionnel (`photo?: string`), et quand un utilisateur n'avait pas de photo, la valeur `undefined` était passée à Firestore.

## Où Se Produisait l'Erreur

### 1. Fonction `getOrCreateConversation`

**Avant (❌ Incorrect):**
```typescript
const conversationData: Omit<Conversation, 'id'> = {
  participants: [userId1, userId2],
  participantsData: {
    [userId1]: user1Data,  // ❌ user1Data.photo peut être undefined
    [userId2]: user2Data,  // ❌ user2Data.photo peut être undefined
  },
  productContext,          // ❌ Peut être undefined
  // ...
};
```

**Après (✅ Correct):**
```typescript
// Nettoyer les données pour omettre les undefined
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

### 2. Fonction `sendMessage`

**Avant (❌ Incorrect):**
```typescript
const messageData: Omit<ChatMessage, 'id'> = {
  conversationId,
  senderId,
  senderName,
  senderPhoto,        // ❌ Peut être undefined
  receiverId,
  content,
  type,
  fileUrl,            // ❌ Peut être undefined
  fileName,           // ❌ Peut être undefined
  fileSize,           // ❌ Peut être undefined
  thumbnailUrl,       // ❌ Peut être undefined
  productReference,   // ❌ Peut être undefined
  isRead: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

**Après (✅ Correct):**
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

## Solution Appliquée

### Technique: Spread Operator Conditionnel

```typescript
// ✅ Ajoute le champ seulement si la valeur existe
const obj = {
  requiredField: value,
  ...(optionalValue && { optionalField: optionalValue })
};
```

### Technique: Vérification Avant Ajout

```typescript
// ✅ Construit l'objet progressivement
const obj: any = {
  requiredField: value,
};

if (optionalValue) {
  obj.optionalField = optionalValue;
}
```

## Pourquoi C'est Important

### Firestore vs JavaScript

| Aspect | JavaScript | Firestore |
|--------|-----------|-----------|
| `undefined` | Valeur valide | ❌ Rejeté |
| `null` | Valeur valide | ✅ Accepté |
| Champ omis | Équivalent à `undefined` | ✅ Accepté |

### Règles Firestore

1. ✅ **Champ avec valeur**: `{ name: "John" }`
2. ✅ **Champ avec null**: `{ photo: null }`
3. ✅ **Champ omis**: `{ name: "John" }` (pas de photo)
4. ❌ **Champ undefined**: `{ photo: undefined }` → ERREUR

## Autres Endroits à Vérifier

Si vous rencontrez la même erreur ailleurs, vérifiez:

### 1. Création de Documents
```typescript
// ❌ Mauvais
await addDoc(collection(db, 'collection'), {
  field1: value1,
  field2: optionalValue  // Peut être undefined
});

// ✅ Bon
const data: any = { field1: value1 };
if (optionalValue) data.field2 = optionalValue;
await addDoc(collection(db, 'collection'), data);
```

### 2. Mise à Jour de Documents
```typescript
// ❌ Mauvais
await updateDoc(docRef, {
  field1: value1,
  field2: optionalValue  // Peut être undefined
});

// ✅ Bon
const updates: any = { field1: value1 };
if (optionalValue) updates.field2 = optionalValue;
await updateDoc(docRef, updates);
```

### 3. Données Utilisateur
```typescript
// ❌ Mauvais
const userData = {
  name: user.displayName,
  photo: user.photoURL,  // Peut être undefined
  email: user.email
};

// ✅ Bon
const userData: any = {
  name: user.displayName,
  email: user.email
};
if (user.photoURL) userData.photo = user.photoURL;
```

## Pattern Réutilisable

### Fonction Helper

```typescript
/**
 * Nettoie un objet en retirant les valeurs undefined
 */
function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

// Usage
const data = cleanObject({
  name: "John",
  photo: undefined,  // Sera omis
  email: "john@example.com"
});
// Résultat: { name: "John", email: "john@example.com" }
```

## Tests

### Vérifier que le Chat Fonctionne

1. **Utilisateur sans photo**
   - Se connecter avec un compte sans photo
   - Cliquer sur "Discuter" sur un produit
   - ✅ La conversation devrait se créer sans erreur

2. **Utilisateur avec photo**
   - Se connecter avec un compte avec photo
   - Cliquer sur "Demander un devis"
   - ✅ La conversation devrait inclure la photo

3. **Vérifier dans Firestore**
   - Ouvrir la console Firebase
   - Collection `conversations`
   - Vérifier `participantsData`
   - ✅ Le champ `photo` devrait être présent OU absent (pas undefined)

## Fichiers Modifiés

1. ✅ `lib/firebase/chat.ts` - Fonctions `getOrCreateConversation` et `sendMessage`
2. ✅ `CHAT_UNDEFINED_FIX.md` - Ce document

## Prévention Future

### Checklist pour Firestore

Avant d'envoyer des données à Firestore:

- [ ] Tous les champs optionnels sont vérifiés
- [ ] Les valeurs `undefined` sont omises ou remplacées par `null`
- [ ] Les objets imbriqués sont également nettoyés
- [ ] Les arrays ne contiennent pas de `undefined`
- [ ] Les types TypeScript utilisent `?` pour les champs optionnels

### ESLint Rule (Optionnel)

Vous pouvez ajouter une règle ESLint pour détecter les `undefined` potentiels:

```json
{
  "rules": {
    "no-undefined": "warn"
  }
}
```

## Ressources

- [Firestore Data Types](https://firebase.google.com/docs/firestore/manage-data/data-types)
- [JavaScript Spread Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [TypeScript Optional Properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#optional-properties)

## Date

13 février 2026
