# Problèmes Identifiés: Page d'Accueil et Recherche

## Problème 1: Nouveau Produit Non Visible sur la Page d'Accueil

### Cause
La page d'accueil (`app/page.tsx`) affiche les produits dans 3 sections différentes:

1. **Meilleures offres** (Best Deals): Triées par `sales` (ventes) décroissant
   - Votre nouveau produit a `sales: 0` → N'apparaît pas
   
2. **Top classement** (Top Ranked): Triées par `rating` (note) décroissant
   - Votre nouveau produit a `rating: 0` → N'apparaît pas
   
3. **Nouveautés** (New Arrivals): Triées par `createdAt` décroissant
   - ✅ Votre nouveau produit DEVRAIT apparaître ici

### Solution
Le nouveau produit devrait apparaître dans la section "Nouveautés" en bas de la page d'accueil. Si ce n'est pas le cas, vérifiez:
- Le produit a bien `isActive: true`
- Le produit a bien un champ `createdAt` avec une date récente
- Les index Firestore sont déployés (voir `firestore.indexes.json`)

## Problème 2: Barre de Recherche Non Fonctionnelle

### Cause
Dans `components/layout/Header.tsx`, la barre de recherche est un simple input sans logique:

```tsx
<input
  type="text"
  placeholder="Rechercher des produits..."
  className="w-full px-4 py-2 rounded-full..."
/>
<button className="absolute right-2...">
  <Search size={18} />
</button>
```

Il n'y a:
- ❌ Pas de state pour stocker la recherche
- ❌ Pas de `onChange` pour capturer l'input
- ❌ Pas de `onSubmit` ou `onClick` pour lancer la recherche
- ❌ Pas de navigation vers `/products` avec query params

### Solution Nécessaire
Implémenter la fonctionnalité de recherche dans le Header pour:
1. Capturer le texte de recherche
2. Naviguer vers `/products?search=...` au clic ou Enter
3. Mettre à jour `app/products/page.tsx` pour gérer le paramètre `search`
4. Ajouter une fonction de recherche textuelle dans `lib/firebase/products.ts`

## Problème 3: Page /products Ne Charge Pas Tous les Produits

### Cause
La fonction `searchProducts` dans `lib/firebase/products.ts` utilise toujours un tri:

```typescript
// Par défaut, tri par 'views' décroissant
default:
  constraints.push(orderBy('views', 'desc'));
```

Votre nouveau produit a probablement `views: 0`, donc il apparaît en dernier.

### Solution
Changer le tri par défaut pour afficher les nouveaux produits en premier, ou ajouter une option "Tous les produits" sans tri spécifique.

## Recommandations

### Court Terme (Quick Fix)
1. Aller sur `/products?sortBy=newest` pour voir votre nouveau produit
2. Vérifier la section "Nouveautés" en bas de la page d'accueil

### Moyen Terme (Corrections Nécessaires)
1. Implémenter la recherche textuelle dans le Header
2. Ajouter une recherche full-text avec Algolia ou similaire
3. Modifier le tri par défaut de `/products` pour montrer les nouveaux produits

### Long Terme (Améliorations)
1. Ajouter des suggestions de recherche (autocomplete)
2. Implémenter des filtres avancés
3. Ajouter une recherche par image
4. Créer une page de résultats de recherche dédiée

## Vérification Rapide

Pour vérifier que votre produit existe bien dans Firestore:

1. Ouvrir la console Firebase
2. Aller dans Firestore Database
3. Collection `products`
4. Vérifier que votre produit a:
   - `isActive: true`
   - `createdAt: [date récente]`
   - `fournisseurId: [votre user ID]`
   - `images: [array avec au moins 1 URL]`
   - `prices: [array avec au moins 1 prix]`

## Fichiers à Modifier

Pour implémenter la recherche complète:
- `components/layout/Header.tsx` - Ajouter logique de recherche
- `app/products/page.tsx` - Gérer paramètre search
- `lib/firebase/products.ts` - Ajouter fonction searchByText
- `types/index.ts` - Ajouter type SearchFilters.searchText

