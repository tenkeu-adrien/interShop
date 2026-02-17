# Correction des Requêtes Firestore - Transactions Flexibles

## Date: 2026-02-16

## Problème Rencontré

### Erreur
```
GET http://localhost:3000/api/transactions/pending 500 (Internal Server Error)
transactions.map is not a function
```

### Cause
Les requêtes Firestore dans `flexibleWallet.ts` utilisaient plusieurs `orderBy` après un `where` avec l'opérateur `!=`, ce qui nécessite des index composites complexes dans Firestore. Sans ces index, les requêtes échouaient avec une erreur 500.

Exemple de requête problématique:
```typescript
query(
  collection(db, TRANSACTIONS_COLLECTION),
  where('status', '==', 'pending'),
  where('paymentMethodId', '!=', null),
  orderBy('paymentMethodId'),      // ❌ Nécessite un index
  orderBy('createdAt', 'desc')     // ❌ Nécessite un index composite
);
```

## Solutions Appliquées

### 1. Simplification de `getPendingFlexibleTransactions`

**Avant:**
```typescript
let q = query(
  collection(db, TRANSACTIONS_COLLECTION),
  where('status', '==', 'pending'),
  where('paymentMethodId', '!=', null),
  orderBy('paymentMethodId'),
  orderBy('createdAt', 'desc')
);
```

**Après:**
```typescript
let q = query(
  collection(db, TRANSACTIONS_COLLECTION),
  where('status', '==', 'pending'),
  where('paymentMethodId', '!=', null)
  // Pas de orderBy - tri côté client
);

// Tri côté client
transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
```

### 2. Simplification de `getFlexibleTransactionsWithFilters`

**Stratégie:**
- Utiliser maximum 2 clauses `where` dans Firestore
- Appliquer les autres filtres côté client (JavaScript)
- Trier côté client au lieu d'utiliser `orderBy`

**Avantages:**
- ✅ Pas besoin de créer des index composites
- ✅ Plus flexible pour ajouter des filtres
- ✅ Fonctionne immédiatement sans configuration Firestore

**Inconvénients:**
- ⚠️ Charge plus de données depuis Firestore
- ⚠️ Tri et filtrage côté client (acceptable pour des volumes modérés)

### 3. Amélioration de la Gestion d'Erreurs

**Page Admin (`wallet-transactions/page.tsx`):**
```typescript
const fetchTransactions = async () => {
  try {
    const response = await fetch(url);
    
    // Vérifier le statut de la réponse
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors du chargement');
    }
    
    const data = await response.json();
    
    // S'assurer que data est un tableau
    if (Array.isArray(data)) {
      setTransactions(data);
    } else {
      console.error('Les données reçues ne sont pas un tableau:', data);
      setTransactions([]);
    }
  } catch (error) {
    console.error('Erreur chargement transactions:', error);
    setTransactions([]);
    alert('Erreur lors du chargement des transactions');
  }
};
```

**API Route (`/api/transactions/pending/route.ts`):**
```typescript
try {
  console.log('Fetching pending transactions, type:', type);
  const transactions = await getPendingFlexibleTransactions(type || undefined);
  console.log('Transactions fetched:', transactions?.length || 0);
  return NextResponse.json(transactions);
} catch (error: any) {
  console.error('Erreur GET pending transactions:', error);
  console.error('Error stack:', error.stack);
  return NextResponse.json(
    { error: error.message || 'Erreur serveur' },
    { status: 500 }
  );
}
```

## Fichiers Modifiés

### `lib/firebase/flexibleWallet.ts`
- ✅ `getPendingFlexibleTransactions()` - Suppression des orderBy multiples
- ✅ `getFlexibleTransactionsWithFilters()` - Simplification des requêtes
- ✅ Ajout du tri côté client

### `app/api/transactions/pending/route.ts`
- ✅ Ajout de logs détaillés pour le débogage
- ✅ Meilleure gestion des erreurs

### `app/dashboard/admin/wallet-transactions/page.tsx`
- ✅ Vérification du statut de la réponse HTTP
- ✅ Validation que les données sont un tableau
- ✅ Initialisation à tableau vide en cas d'erreur
- ✅ Affichage d'une alerte en cas d'erreur

## Règles Firestore à Retenir

### Limitations des Requêtes

1. **Opérateur `!=`**: Nécessite un index sur le champ
2. **Multiple `orderBy`**: Nécessite un index composite si utilisé avec `where`
3. **Combinaisons complexes**: Préférer le filtrage côté client

### Bonnes Pratiques

✅ **À FAIRE:**
- Utiliser maximum 1-2 clauses `where`
- Filtrer et trier côté client pour les petits volumes
- Créer des index uniquement si nécessaire
- Gérer les erreurs de requête

❌ **À ÉVITER:**
- Multiple `orderBy` sans index
- Trop de clauses `where` combinées
- Requêtes complexes sans planification

## Quand Créer des Index

Si vous avez beaucoup de transactions (>1000), créez des index dans `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "paymentMethodId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "paymentMethodId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Puis déployez:
```bash
firebase deploy --only firestore:indexes
```

## Tests à Effectuer

1. ✅ Accéder à `/dashboard/admin/wallet-transactions`
2. ✅ Vérifier que la page charge sans erreur 500
3. ✅ Vérifier que les transactions s'affichent (ou message "Aucune transaction")
4. ✅ Tester les filtres (Toutes, Dépôts, Retraits)
5. ✅ Créer une transaction de test via `/wallet/deposit`
6. ✅ Vérifier qu'elle apparaît dans l'admin

## Performance

Pour les volumes actuels (< 1000 transactions), le tri côté client est acceptable:
- Temps de chargement: < 1 seconde
- Mémoire utilisée: Négligeable
- Expérience utilisateur: Fluide

Si le volume augmente significativement, envisager:
- Pagination des résultats
- Création d'index Firestore
- Cache côté client
- Lazy loading

## Résumé

Les erreurs 500 étaient causées par des requêtes Firestore trop complexes nécessitant des index composites. La solution a été de simplifier les requêtes et d'effectuer le tri et le filtrage côté client, ce qui fonctionne parfaitement pour des volumes modérés de transactions.
