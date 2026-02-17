# Guide de contribution

## Architecture du projet

### Structure des dossiers

```
alibaba-clone/
├── app/                    # Pages Next.js (App Router)
├── components/             # Composants React réutilisables
├── lib/                    # Utilitaires et configurations
│   ├── firebase/          # Services Firebase
│   ├── constants.ts       # Constantes de l'application
│   └── utils.ts           # Fonctions utilitaires
├── store/                  # Stores Zustand pour la gestion d'état
├── hooks/                  # Hooks React personnalisés
├── types/                  # Définitions TypeScript
└── public/                 # Assets statiques
```

### Technologies utilisées

- **Next.js 15** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utility-first
- **Firebase** : Backend as a Service
- **Zustand** : Gestion d'état légère
- **React Hot Toast** : Notifications toast

## Standards de code

### TypeScript

- Toujours typer les props des composants
- Utiliser les interfaces pour les objets complexes
- Éviter `any`, préférer `unknown` si nécessaire
- Utiliser les types génériques quand approprié

```typescript
// ✅ Bon
interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

// ❌ Mauvais
function ProductCard(props: any) { }
```

### Composants React

- Utiliser les composants fonctionnels
- Préférer les named exports pour les composants
- Utiliser 'use client' uniquement quand nécessaire
- Extraire la logique complexe dans des hooks personnalisés

```typescript
// ✅ Bon
'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

### Styling

- Utiliser Tailwind CSS pour le styling
- Créer des classes utilitaires réutilisables dans `globals.css`
- Utiliser la fonction `cn()` pour combiner les classes conditionnelles

```typescript
import { cn } from '@/lib/utils';

<button className={cn(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-orange-500',
  isDisabled && 'opacity-50'
)}>
  Click me
</button>
```

### Firebase

- Toujours gérer les erreurs Firebase
- Utiliser les transactions pour les opérations critiques
- Optimiser les requêtes avec des indexes
- Nettoyer les listeners dans useEffect

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(query, (snapshot) => {
    // Handle data
  });
  
  return () => unsubscribe();
}, []);
```

### State Management

- Utiliser Zustand pour l'état global
- Utiliser useState pour l'état local
- Persister l'état important (panier, préférences)

```typescript
// Store Zustand
export const useMyStore = create<MyState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

## Conventions de nommage

### Fichiers

- Composants : `PascalCase.tsx` (ex: `ProductCard.tsx`)
- Hooks : `camelCase.ts` avec préfixe `use` (ex: `useAuth.ts`)
- Utilitaires : `camelCase.ts` (ex: `formatPrice.ts`)
- Types : `index.ts` dans le dossier `types/`

### Variables et fonctions

- Variables : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`
- Fonctions : `camelCase`
- Composants : `PascalCase`
- Types/Interfaces : `PascalCase`

## Git Workflow

### Branches

- `main` : Production
- `develop` : Développement
- `feature/nom-feature` : Nouvelles fonctionnalités
- `fix/nom-bug` : Corrections de bugs
- `hotfix/nom-hotfix` : Corrections urgentes

### Commits

Utiliser le format Conventional Commits :

```
type(scope): description

[body optionnel]

[footer optionnel]
```

Types :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage, point-virgules manquants, etc.
- `refactor` : Refactoring de code
- `test` : Ajout de tests
- `chore` : Maintenance

Exemples :
```
feat(auth): add social login
fix(cart): correct total calculation
docs(readme): update installation steps
```

## Tests

### Tests unitaires

```typescript
// À implémenter avec Jest/Vitest
describe('formatPrice', () => {
  it('should format price correctly', () => {
    expect(formatPrice(100, 'USD')).toBe('$100.00');
  });
});
```

### Tests d'intégration

- Tester les flux utilisateur complets
- Utiliser React Testing Library
- Mocker les appels Firebase

## Performance

### Optimisations

- Utiliser `next/image` pour les images
- Lazy loading des composants lourds
- Mémorisation avec `useMemo` et `useCallback`
- Pagination des listes longues
- Optimiser les requêtes Firestore

```typescript
// ✅ Bon
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ❌ Mauvais
const expensiveValue = computeExpensiveValue(data);
```

## Sécurité

### Bonnes pratiques

- Ne jamais exposer les clés API privées
- Valider toutes les entrées utilisateur
- Utiliser les règles de sécurité Firebase
- Sanitiser les données avant affichage
- Implémenter la limitation de débit

### Variables d'environnement

- Préfixer avec `NEXT_PUBLIC_` pour les variables client
- Ne jamais commiter `.env.local`
- Documenter toutes les variables nécessaires

## Accessibilité

- Utiliser les balises sémantiques HTML
- Ajouter des attributs ARIA quand nécessaire
- Assurer le contraste des couleurs
- Supporter la navigation au clavier
- Tester avec un lecteur d'écran

```typescript
// ✅ Bon
<button aria-label="Ajouter au panier">
  <ShoppingCart />
</button>

// ❌ Mauvais
<div onClick={handleClick}>
  <ShoppingCart />
</div>
```

## Documentation

### Commentaires

- Commenter le "pourquoi", pas le "quoi"
- Utiliser JSDoc pour les fonctions complexes
- Documenter les types complexes

```typescript
/**
 * Calcule le prix total d'une commande incluant les frais
 * @param items - Articles du panier
 * @param shippingFee - Frais de livraison
 * @returns Prix total en centimes
 */
function calculateTotal(items: CartItem[], shippingFee: number): number {
  // Implementation
}
```

## Pull Requests

### Checklist

- [ ] Le code compile sans erreurs
- [ ] Les tests passent
- [ ] Le code suit les conventions
- [ ] La documentation est à jour
- [ ] Les changements sont testés manuellement
- [ ] Les variables d'environnement sont documentées
- [ ] Les migrations de base de données sont incluses

### Template

```markdown
## Description
[Description des changements]

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
[Comment tester les changements]

## Screenshots
[Si applicable]

## Checklist
- [ ] Code testé localement
- [ ] Documentation mise à jour
- [ ] Tests ajoutés/mis à jour
```

## Questions ?

Pour toute question, ouvrir une issue sur GitHub ou contacter l'équipe de développement.
