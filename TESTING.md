# Guide de tests

## 🧪 Configuration des tests (À implémenter)

Ce document décrit comment configurer et exécuter les tests pour le projet AlibabaClone.

## Stack de tests recommandée

### Tests unitaires et d'intégration
- **Vitest** : Framework de test rapide
- **React Testing Library** : Tests de composants React
- **@testing-library/user-event** : Simulation d'interactions utilisateur

### Tests E2E
- **Playwright** : Tests end-to-end
- **Cypress** : Alternative pour les tests E2E

## Installation (À faire)

```bash
# Tests unitaires
npm install -D vitest @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event

# Tests E2E
npm install -D @playwright/test
# ou
npm install -D cypress
```

## Configuration Vitest

Créer `vitest.config.ts` :

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

## Structure des tests

```
tests/
├── unit/                    # Tests unitaires
│   ├── components/         # Tests de composants
│   ├── hooks/              # Tests de hooks
│   ├── lib/                # Tests d'utilitaires
│   └── store/              # Tests de stores
├── integration/            # Tests d'intégration
│   ├── auth.test.ts       # Tests d'authentification
│   ├── cart.test.ts       # Tests du panier
│   └── checkout.test.ts   # Tests de commande
├── e2e/                    # Tests end-to-end
│   ├── user-flow.spec.ts  # Flux utilisateur complet
│   └── purchase.spec.ts   # Flux d'achat
└── setup.ts                # Configuration des tests
```

## Exemples de tests

### Test d'un composant

```typescript
// tests/unit/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductCard from '@/components/products/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    prices: [{ minQuantity: 1, price: 100, currency: 'USD' }],
    moq: 1,
    rating: 4.5,
    reviewCount: 10,
    images: ['/test.jpg'],
    country: 'France',
    deliveryTime: '3-7 jours',
  };

  it('should render product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should display correct price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
  });

  it('should show rating', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
});
```

### Test d'un hook

```typescript
// tests/unit/hooks/useCart.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCartStore } from '@/store/cartStore';

describe('useCartStore', () => {
  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        productId: '1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        image: '/test.jpg',
        fournisseurId: 'f1',
        moq: 1,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe('1');
  });

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        productId: '1',
        name: 'Product 1',
        price: 100,
        quantity: 2,
        image: '/test.jpg',
        fournisseurId: 'f1',
        moq: 1,
      });
    });

    expect(result.current.getTotal()).toBe(200);
  });
});
```

### Test d'une fonction utilitaire

```typescript
// tests/unit/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice, generateOrderNumber, calculateCommission } from '@/lib/utils';

describe('Utils', () => {
  describe('formatPrice', () => {
    it('should format USD correctly', () => {
      expect(formatPrice(100, 'USD')).toBe('$100.00');
    });

    it('should format EUR correctly', () => {
      expect(formatPrice(100, 'EUR')).toBe('100,00 €');
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate unique order numbers', () => {
      const order1 = generateOrderNumber();
      const order2 = generateOrderNumber();
      expect(order1).not.toBe(order2);
    });

    it('should start with ORD-', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^ORD-/);
    });
  });

  describe('calculateCommission', () => {
    it('should calculate 10% commission correctly', () => {
      expect(calculateCommission(1000, 0.1)).toBe(100);
    });

    it('should handle zero amount', () => {
      expect(calculateCommission(0, 0.1)).toBe(0);
    });
  });
});
```

### Test d'intégration

```typescript
// tests/integration/auth.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerUser, loginUser } from '@/lib/firebase/auth';

// Mock Firebase
vi.mock('@/lib/firebase/config', () => ({
  auth: {},
  db: {},
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('should register a new user', async () => {
    // Mock implementation
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'client',
    };

    // Test registration
    // Note: Requires proper Firebase mocking
  });

  it('should login existing user', async () => {
    // Test login
  });
});
```

### Test E2E avec Playwright

```typescript
// tests/e2e/purchase-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Purchase Flow', () => {
  test('should complete a purchase', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('http://localhost:3000');

    // 2. Search for a product
    await page.fill('input[placeholder*="Rechercher"]', 'laptop');
    await page.press('input[placeholder*="Rechercher"]', 'Enter');

    // 3. Click on first product
    await page.click('.product-card:first-child');

    // 4. Add to cart
    await page.click('button:has-text("Ajouter au panier")');

    // 5. Go to cart
    await page.click('a[href="/cart"]');

    // 6. Verify product in cart
    await expect(page.locator('.cart-item')).toHaveCount(1);

    // 7. Proceed to checkout
    await page.click('button:has-text("Passer la commande")');

    // 8. Fill shipping info
    await page.fill('input[name="fullName"]', 'John Doe');
    await page.fill('input[name="address"]', '123 Main St');

    // 9. Complete order
    await page.click('button:has-text("Confirmer")');

    // 10. Verify success
    await expect(page.locator('text=Commande confirmée')).toBeVisible();
  });
});
```

## Mocking Firebase

### Setup pour les tests

```typescript
// tests/setup.ts
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
}));
```

## Scripts de test

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Couverture de code

Objectifs de couverture :
- **Composants** : 80%+
- **Hooks** : 90%+
- **Utilitaires** : 95%+
- **Services** : 80%+

## Bonnes pratiques

### Tests unitaires
1. Tester un seul comportement par test
2. Utiliser des noms descriptifs
3. Suivre le pattern AAA (Arrange, Act, Assert)
4. Mocker les dépendances externes
5. Éviter les tests fragiles

### Tests d'intégration
1. Tester les flux complets
2. Utiliser des données réalistes
3. Nettoyer après chaque test
4. Tester les cas d'erreur

### Tests E2E
1. Tester les parcours utilisateur critiques
2. Utiliser des sélecteurs stables
3. Attendre les éléments asynchrones
4. Prendre des screenshots en cas d'échec

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
```

## Ressources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## TODO

- [ ] Configurer Vitest
- [ ] Écrire les tests unitaires des composants
- [ ] Écrire les tests des hooks
- [ ] Écrire les tests des utilitaires
- [ ] Configurer Playwright
- [ ] Écrire les tests E2E
- [ ] Configurer la couverture de code
- [ ] Intégrer dans CI/CD
