# Correction: Erreur "Invalid time value" avec Firestore Timestamps

## Problème

### Erreur
```
RangeError: Invalid time value
at formatDistanceToNow (ChatWindow.tsx:314:37)
```

### Cause
Les dates Firestore sont des objets `Timestamp`, pas des objets `Date` JavaScript. Quand on essaie de les utiliser avec `formatDistanceToNow` ou `new Date()`, ça cause une erreur.

```typescript
// ❌ Firestore Timestamp (objet complexe)
{
  seconds: 1707849600,
  nanoseconds: 123456789
}

// ✅ JavaScript Date (objet Date)
new Date('2024-02-13T12:00:00Z')
```

## Solution

### Conversion des Timestamps

Firestore Timestamps ont une méthode `.toDate()` pour les convertir en Date JavaScript:

```typescript
// ❌ Avant
const messages = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data(),
}));

// ✅ Après
const messages = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
  };
});
```

## Fichiers Modifiés

### `lib/firebase/chat.ts`

Toutes les fonctions qui récupèrent des données de Firestore ont été mises à jour:

#### 1. `getConversationMessages`
```typescript
const messages = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
  };
}) as ChatMessage[];
```

#### 2. `subscribeToConversationMessages`
```typescript
const messages = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
  };
}) as ChatMessage[];
```

#### 3. `getUserConversations`
```typescript
return snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    lastMessage: data.lastMessage ? {
      ...data.lastMessage,
      createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
    } : undefined,
  };
}) as Conversation[];
```

#### 4. `subscribeToUserConversations`
Même conversion que `getUserConversations`.

#### 5. `getConversation`
```typescript
const data = docSnap.data();
return {
  id: docSnap.id,
  ...data,
  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
  updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
  lastMessage: data.lastMessage ? {
    ...data.lastMessage,
    createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
  } : undefined,
} as Conversation;
```

## Pattern de Conversion

### Fonction Helper Réutilisable

```typescript
/**
 * Convertit un Timestamp Firestore en Date JavaScript
 */
function toDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
}

// Usage
const messages = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
});
```

## Pourquoi C'est Important

### Firestore Timestamps vs JavaScript Dates

| Aspect | Firestore Timestamp | JavaScript Date |
|--------|-------------------|-----------------|
| Type | Objet Firestore | Objet Date natif |
| Structure | `{ seconds, nanoseconds }` | Millisecondes depuis epoch |
| Méthodes | `.toDate()`, `.toMillis()` | `.getTime()`, `.toISOString()` |
| Compatibilité | Firestore uniquement | Universel JavaScript |
| Précision | Nanosecondes | Millisecondes |

### Problèmes Sans Conversion

```typescript
// ❌ Ne fonctionne pas
const timestamp = { seconds: 1707849600, nanoseconds: 123456789 };
formatDistanceToNow(timestamp); // RangeError: Invalid time value

// ❌ Ne fonctionne pas non plus
new Date(timestamp); // Invalid Date

// ✅ Fonctionne
const date = timestamp.toDate();
formatDistanceToNow(date); // "il y a 2 heures"
```

## Autres Endroits à Vérifier

Si vous avez d'autres collections Firestore avec des dates, vérifiez:

### 1. Products
```typescript
const products = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
});
```

### 2. Orders
```typescript
const orders = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: toDate(data.createdAt),
    deliveryDate: toDate(data.deliveryDate),
  };
});
```

### 3. Notifications
```typescript
const notifications = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: toDate(data.createdAt),
  };
});
```

## Tests de Validation

### Test 1: Affichage des Messages
1. Ouvrir une conversation
2. Vérifier que les timestamps s'affichent correctement
3. ✅ "il y a 2 minutes", "il y a 1 heure", etc.

### Test 2: Liste des Conversations
1. Aller sur `/chat`
2. Vérifier que les dates des derniers messages s'affichent
3. ✅ Pas d'erreur "Invalid time value"

### Test 3: Nouveau Message
1. Envoyer un nouveau message
2. Vérifier que le timestamp s'affiche immédiatement
3. ✅ "à l'instant" ou "il y a quelques secondes"

### Test 4: Console
1. Ouvrir DevTools → Console
2. Vérifier qu'il n'y a pas d'erreurs de date
3. ✅ Pas de "RangeError" ou "Invalid Date"

## Prévention Future

### Checklist pour Firestore

Quand vous récupérez des données de Firestore:

- [ ] Identifier tous les champs de type date/timestamp
- [ ] Convertir avec `.toDate()` ou fonction helper
- [ ] Tester l'affichage des dates
- [ ] Vérifier la console pour les erreurs
- [ ] Documenter les conversions

### TypeScript Helper

Créer un type helper pour forcer la conversion:

```typescript
type FirestoreDoc<T> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
};

type AppDoc<T> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: Date;
  updatedAt: Date;
};

function convertFirestoreDoc<T>(doc: FirestoreDoc<T>): AppDoc<T> {
  return {
    ...doc,
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  } as AppDoc<T>;
}
```

## Ressources

- [Firestore Timestamps](https://firebase.google.com/docs/reference/js/firestore_.timestamp)
- [date-fns formatDistanceToNow](https://date-fns.org/docs/formatDistanceToNow)
- [JavaScript Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

## Résumé

### Avant
- ❌ Erreur "Invalid time value" dans le chat
- ❌ Timestamps Firestore non convertis
- ❌ Dates ne s'affichent pas

### Après
- ✅ Tous les timestamps convertis en Dates
- ✅ Affichage correct des dates relatives
- ✅ Pas d'erreurs dans la console
- ✅ Chat fonctionne parfaitement

## Date

13 février 2026
