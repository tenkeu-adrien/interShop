# 🚨 Corrections Urgentes pour Production

## ✅ CE QUI A ÉTÉ CORRIGÉ

### 1. Menu Header Dashboard ✅
**Problème :** Le menu affichait "Dashboard" pour tous les rôles
**Solution :** Maintenant affiche :
- "Dashboard Fournisseur" pour les fournisseurs
- "Dashboard Marketiste" pour les marketistes  
- "Dashboard Admin" pour les admins
- "Dashboard" pour les clients

**Fichier modifié :** `components/layout/Header.tsx`

---

## ❌ CORRECTIONS CRITIQUES RESTANTES

### 🔴 URGENT 1: Sécuriser les variables d'environnement

**Action immédiate :**
```bash
# 1. Vérifier que .env est dans .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# 2. Si .env a été commité, le supprimer de l'historique Git
git rm --cached .env
git commit -m "Remove .env from repository"

# 3. Régénérer TOUTES les clés Firebase
# - Aller dans Firebase Console
# - Project Settings > Service Accounts
# - Generate New Private Key
# - Remplacer dans .env

# 4. Régénérer la clé Resend
# - Aller sur resend.com
# - Révoquer l'ancienne clé
# - Créer une nouvelle clé
```

**Variables à mettre dans Vercel/Production :**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Serveur uniquement (ne pas exposer)
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
RESEND_API_KEY=
```

---

### 🔴 URGENT 2: Ajouter validation Zod

**Installer Zod :**
```bash
npm install zod
```

**Créer les schémas de validation :**
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  displayName: z.string().min(2, 'Minimum 2 caractères').max(50, 'Maximum 50 caractères'),
  role: z.enum(['client', 'fournisseur', 'marketiste'], {
    errorMap: () => ({ message: 'Rôle invalide' })
  })
});

export const productSchema = z.object({
  name: z.string().min(3, 'Minimum 3 caractères').max(200, 'Maximum 200 caractères'),
  description: z.string().min(10, 'Minimum 10 caractères'),
  category: z.string().min(1, 'Catégorie requise'),
  moq: z.number().int().positive('MOQ doit être positif'),
  stock: z.number().int().nonnegative('Stock ne peut être négatif'),
  prices: z.array(z.object({
    minQuantity: z.number().int().positive(),
    maxQuantity: z.number().int().positive().optional(),
    price: z.number().positive('Prix doit être positif'),
    currency: z.string()
  })).min(1, 'Au moins un palier de prix requis'),
  marketingSettings: z.object({
    allowsMarketingCodes: z.boolean(),
    discountPercentage: z.number().min(0).max(50),
    minQuantityForDiscount: z.number().int().positive(),
    marketisteCommissionRate: z.number().min(0).max(30)
  }).optional()
});

export const orderSchema = z.object({
  clientId: z.string().min(1),
  fournisseurId: z.string().min(1),
  products: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive()
  })).min(1, 'Au moins un produit requis'),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(8),
    street: z.string().min(5),
    city: z.string().min(2),
    country: z.string().min(2),
    postalCode: z.string().min(3)
  })
});
```

**Utiliser dans les API routes :**
```typescript
// app/api/mobile/auth/register/route.ts
import { registerSchema } from '@/lib/validation/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Valider les données
    const validated = registerSchema.parse(body);
    
    // Continuer avec les données validées
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }
    // ...
  }
}
```

---

### 🔴 URGENT 3: Ajouter Rate Limiting

**Option 1: Upstash (Recommandé)**
```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

// Utiliser dans les API routes
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return Response.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    );
  }
  
  // Continuer...
}
```

**Option 2: Simple (sans service externe)**
```typescript
// lib/simple-ratelimit.ts
const requests = new Map<string, number[]>();

export function checkRateLimit(ip: string, maxRequests = 10, windowMs = 10000): boolean {
  const now = Date.now();
  const userRequests = requests.get(ip) || [];
  
  // Nettoyer les anciennes requêtes
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  requests.set(ip, recentRequests);
  
  return true;
}
```

---

### 🟡 IMPORTANT 4: Ajouter Sentry pour le monitoring

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

---

### 🟡 IMPORTANT 5: Créer un système de logging

```typescript
// lib/logger.ts
import * as Sentry from '@sentry/nextjs';

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...context
    };

    // Console log
    console[level](`[${level.toUpperCase()}] ${message}`, context);

    // Envoyer à Sentry si erreur
    if (level === 'error') {
      Sentry.captureException(new Error(message), {
        extra: context
      });
    }

    // TODO: Envoyer à un service de logging (Datadog, LogRocket, etc.)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error: any, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error?.message || error,
      stack: error?.stack
    });
  }
}

export const logger = new Logger();

// Utilisation
logger.info('Utilisateur connecté', { userId: user.id });
logger.error('Erreur création produit', error, { userId: user.id, productName });
```

---

### 🟡 IMPORTANT 6: Optimiser les images

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compression
  compress: true,
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

---

### 🟢 RECOMMANDÉ 7: Ajouter des tests

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

```typescript
// __tests__/components/Header.test.tsx
import { render, screen } from '@testing-library/react';
import Header from '@/components/layout/Header';

describe('Header', () => {
  it('affiche le bon texte dashboard pour fournisseur', () => {
    const mockUser = {
      id: '123',
      role: 'fournisseur',
      displayName: 'Test Fournisseur'
    };
    
    render(<Header />);
    // Tester que "Dashboard Fournisseur" est affiché
  });
});
```

---

## 📋 CHECKLIST FINALE AVANT PRODUCTION

### Sécurité ✅
- [x] Firestore Rules configurées
- [ ] Variables d'environnement sécurisées
- [ ] Validation Zod ajoutée
- [ ] Rate limiting activé
- [ ] Headers de sécurité configurés

### Performance
- [ ] Images optimisées (WebP)
- [ ] Lazy loading activé
- [ ] Cache configuré
- [ ] CDN configuré (Vercel fait ça automatiquement)

### Monitoring
- [ ] Sentry configuré
- [ ] Logger implémenté
- [ ] Analytics configuré
- [ ] Uptime monitoring (UptimeRobot)

### Tests
- [ ] Test de connexion
- [ ] Test de création de produit
- [ ] Test de commande
- [ ] Test de codes promo
- [ ] Test multi-devises

### Legal
- [ ] CGU/CGV rédigées
- [ ] Politique de confidentialité
- [ ] Mentions légales
- [ ] Cookie banner (si EU)

---

## 🚀 DÉPLOIEMENT

### Étape 1: Préparer l'environnement
```bash
# 1. Créer un projet Vercel
vercel

# 2. Ajouter les variables d'environnement dans Vercel
# Settings > Environment Variables

# 3. Configurer le domaine
# Settings > Domains
```

### Étape 2: Déployer
```bash
# Production
vercel --prod

# Preview
vercel
```

### Étape 3: Vérifier
- [ ] Site accessible
- [ ] Connexion fonctionne
- [ ] Création de produit fonctionne
- [ ] Commande fonctionne
- [ ] Paiement fonctionne
- [ ] Emails envoyés
- [ ] Notifications fonctionnent

---

## ⏱️ TEMPS ESTIMÉ

- **Sécurité (variables, validation, rate limit)** : 4-6 heures
- **Monitoring (Sentry, logger)** : 2-3 heures
- **Optimisations (images, headers)** : 2-3 heures
- **Tests manuels** : 4-6 heures
- **Documentation légale** : 4-8 heures
- **Déploiement et vérification** : 2-3 heures

**TOTAL : 18-29 heures (2-4 jours)**

---

## 🎯 PRIORITÉS

### Aujourd'hui (URGENT)
1. ✅ Corriger le menu Header (FAIT)
2. ❌ Sécuriser les variables d'environnement
3. ❌ Ajouter validation Zod sur les routes critiques

### Demain
4. ❌ Ajouter rate limiting
5. ❌ Configurer Sentry
6. ❌ Implémenter le logger

### Après-demain
7. ❌ Tests complets
8. ❌ Optimisations
9. ❌ Documentation légale

### Jour 4
10. ❌ Déploiement
11. ❌ Vérification finale
12. ❌ Monitoring actif

---

## 📞 SUPPORT

Si tu as besoin d'aide :
1. Consulter `ANALYSE_CRITIQUE_PRODUCTION.md`
2. Vérifier les logs Sentry
3. Tester en local d'abord
4. Déployer en preview avant production

**Le site est presque prêt ! Il reste 2-4 jours de travail pour sécuriser et optimiser avant la mise en production. 🚀**
