# Architecture du projet

## 🏗️ Vue d'ensemble

AlibabaClone est une application e-commerce B2B/B2C construite avec une architecture moderne et scalable.

## 📐 Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js 15 (App Router)                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Pages    │  │ Components │  │   Hooks    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │         Zustand (State Management)         │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE (Backend)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │     Auth     │  │   Firestore  │  │   Storage    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │  Messaging   │  │   Functions  │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Architecture en couches

### 1. Couche Présentation (UI)

```
app/
├── page.tsx                 # Pages Next.js
├── layout.tsx              # Layouts
└── [routes]/               # Routes dynamiques

components/
├── layout/                 # Composants de mise en page
├── products/              # Composants produits
├── chat/                  # Composants chat
└── auth/                  # Composants auth
```

**Responsabilités :**
- Affichage de l'interface utilisateur
- Gestion des interactions utilisateur
- Routing et navigation
- Responsive design

### 2. Couche Logique Métier

```
lib/
├── firebase/
│   ├── auth.ts            # Logique d'authentification
│   ├── products.ts        # Logique produits
│   ├── orders.ts          # Logique commandes
│   ├── chat.ts            # Logique chat
│   └── notifications.ts   # Logique notifications
├── utils.ts               # Fonctions utilitaires
└── constants.ts           # Constantes
```

**Responsabilités :**
- Règles métier
- Validation des données
- Calculs et transformations
- Logique de l'application

### 3. Couche État (State Management)

```
store/
├── authStore.ts           # État d'authentification
├── cartStore.ts           # État du panier
└── chatStore.ts           # État du chat
```

**Responsabilités :**
- Gestion de l'état global
- Persistance des données
- Synchronisation de l'état
- Actions et mutations

### 4. Couche Données (Backend)

```
Firebase
├── Authentication         # Gestion des utilisateurs
├── Firestore             # Base de données NoSQL
├── Storage               # Stockage de fichiers
├── Cloud Messaging       # Notifications push
└── Functions             # Fonctions serverless
```

**Responsabilités :**
- Stockage des données
- Authentification
- Autorisation
- Notifications
- Traitement côté serveur

## 🔄 Flux de données

### Flux d'authentification

```
User Action (Login)
    ↓
Login Component
    ↓
Firebase Auth Service
    ↓
Firebase Authentication
    ↓
User Data (Firestore)
    ↓
Auth Store (Zustand)
    ↓
UI Update (Protected Routes)
```

### Flux de produits

```
User Action (Search)
    ↓
Products Page
    ↓
Products Service
    ↓
Firestore Query
    ↓
Products Data
    ↓
Product Cards
    ↓
UI Display
```

### Flux de panier

```
User Action (Add to Cart)
    ↓
Product Card
    ↓
Cart Store (Zustand)
    ↓
LocalStorage (Persist)
    ↓
Cart Page
    ↓
Checkout
```

### Flux de chat

```
User Message
    ↓
Chat Window
    ↓
Chat Service
    ↓
Firestore (Real-time)
    ↓
Chat Store
    ↓
Other User (Real-time)
```

## 🗄️ Modèle de données

### Collections Firestore

```
users/
├── {userId}/
    ├── email
    ├── role
    ├── displayName
    └── ...

products/
├── {productId}/
    ├── fournisseurId
    ├── name
    ├── prices[]
    ├── images[]
    └── ...

orders/
├── {orderId}/
    ├── clientId
    ├── fournisseurId
    ├── products[]
    ├── total
    └── ...

conversations/
├── {conversationId}/
    ├── participants[]
    ├── lastMessage
    └── ...

messages/
├── {messageId}/
    ├── conversationId
    ├── senderId
    ├── content
    └── ...
```

### Relations entre entités

```
User (Client) ──1:N──> Orders
User (Fournisseur) ──1:N──> Products
User (Fournisseur) ──1:N──> Orders (received)
User (Marketiste) ──1:N──> MarketingCodes
Product ──N:1──> Fournisseur
Order ──N:M──> Products
Order ──N:1──> Client
Order ──N:1──> Fournisseur
Order ──N:1──> Marketiste (optional)
Conversation ──N:M──> Users
Message ──N:1──> Conversation
```

## 🔐 Sécurité

### Architecture de sécurité

```
┌─────────────────────────────────────────┐
│         Client (Browser)                 │
│  ┌───────────────────────────────────┐  │
│  │  Environment Variables (.env)     │  │
│  │  - NEXT_PUBLIC_* (exposed)        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                ↓ HTTPS
┌─────────────────────────────────────────┐
│         Firebase (Backend)               │
│  ┌───────────────────────────────────┐  │
│  │  Authentication                   │  │
│  │  - Email/Password                 │  │
│  │  - Session Management             │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Firestore Rules                  │  │
│  │  - Role-based access              │  │
│  │  - Data validation                │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Storage Rules                    │  │
│  │  - File size limits               │  │
│  │  - File type validation           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Niveaux de sécurité

1. **Client-side**
   - Validation des formulaires
   - Protection des routes (ProtectedRoute)
   - Gestion des tokens

2. **Transport**
   - HTTPS obligatoire
   - Chiffrement des données

3. **Server-side**
   - Règles Firestore
   - Règles Storage
   - Validation des données

4. **Database**
   - Contrôle d'accès basé sur les rôles
   - Indexes sécurisés

## 🚀 Performance

### Optimisations

```
┌─────────────────────────────────────────┐
│         Performance Strategy             │
├─────────────────────────────────────────┤
│  1. Code Splitting (Next.js)            │
│     - Automatic route-based splitting   │
│     - Dynamic imports                   │
├─────────────────────────────────────────┤
│  2. Image Optimization                  │
│     - next/image component              │
│     - Lazy loading                      │
│     - WebP format                       │
├─────────────────────────────────────────┤
│  3. Caching                             │
│     - Browser cache                     │
│     - Service Worker (PWA)              │
│     - Firebase cache                    │
├─────────────────────────────────────────┤
│  4. Database Optimization               │
│     - Firestore indexes                 │
│     - Pagination                        │
│     - Query optimization                │
├─────────────────────────────────────────┤
│  5. State Management                    │
│     - Zustand (lightweight)             │
│     - Selective re-renders              │
│     - Memoization                       │
└─────────────────────────────────────────┘
```

## 📱 Responsive Design

### Breakpoints

```
Mobile First Approach

┌──────────────────────────────────────┐
│  Mobile (< 640px)                    │
│  - Single column                     │
│  - Touch-optimized                   │
│  - Simplified navigation             │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  Tablet (640px - 1024px)             │
│  - 2 columns                         │
│  - Expanded navigation               │
│  - More content visible              │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│  Desktop (> 1024px)                  │
│  - 3-4 columns                       │
│  - Full navigation                   │
│  - Maximum content                   │
└──────────────────────────────────────┘
```

## 🔄 Real-time Architecture

### Chat en temps réel

```
User A                    Firestore                    User B
  │                          │                           │
  │──── Send Message ───────>│                           │
  │                          │                           │
  │                          │<──── Subscribe ───────────│
  │                          │                           │
  │                          │──── Push Update ─────────>│
  │                          │                           │
  │<──── Confirmation ───────│                           │
  │                          │                           │
```

### Notifications

```
Event Trigger
    ↓
Firestore Write
    ↓
Cloud Function (optional)
    ↓
Notification Document
    ↓
Real-time Listener
    ↓
User Notification
```

## 🧩 Patterns de conception

### 1. Component Pattern
- Composants fonctionnels
- Hooks personnalisés
- Props typing strict

### 2. Service Pattern
- Services Firebase isolés
- Fonctions réutilisables
- Gestion d'erreurs centralisée

### 3. Store Pattern
- État global avec Zustand
- Actions et sélecteurs
- Persistance sélective

### 4. Provider Pattern
- AuthProvider pour l'authentification
- Context API pour les données partagées

## 🔮 Évolutivité

### Scalabilité horizontale

```
┌─────────────────────────────────────────┐
│         Current Architecture             │
│  Next.js + Firebase                     │
│  - Serverless                           │
│  - Auto-scaling                         │
│  - Global CDN                           │
└─────────────────────────────────────────┘
         ↓ Future Growth
┌─────────────────────────────────────────┐
│         Enhanced Architecture            │
│  - Microservices                        │
│  - Load Balancing                       │
│  - Caching Layer (Redis)                │
│  - Message Queue                        │
│  - Analytics Pipeline                   │
└─────────────────────────────────────────┘
```

## 📊 Monitoring & Analytics

### Architecture de monitoring

```
Application
    ↓
┌─────────────────────────────────────────┐
│  Logging & Monitoring                   │
│  ├── Firebase Analytics                 │
│  ├── Performance Monitoring             │
│  ├── Error Tracking                     │
│  └── Custom Events                      │
└─────────────────────────────────────────┘
    ↓
Dashboard & Alerts
```

## 🎯 Principes architecturaux

### 1. Separation of Concerns
- UI séparée de la logique
- Services isolés
- État centralisé

### 2. DRY (Don't Repeat Yourself)
- Composants réutilisables
- Fonctions utilitaires
- Hooks personnalisés

### 3. SOLID Principles
- Single Responsibility
- Open/Closed
- Dependency Inversion

### 4. Clean Code
- Nommage explicite
- Fonctions courtes
- Documentation claire

## 🔄 CI/CD Pipeline (Future)

```
Developer
    ↓
Git Push
    ↓
GitHub Actions
    ↓
┌─────────────────────────────────────────┐
│  Build & Test                           │
│  ├── TypeScript Check                   │
│  ├── Linting                            │
│  ├── Unit Tests                         │
│  └── Integration Tests                  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Deploy                                 │
│  ├── Vercel (Frontend)                  │
│  ├── Firebase (Backend)                 │
│  └── CDN (Assets)                       │
└─────────────────────────────────────────┘
    ↓
Production
```

## 📚 Ressources

- [Next.js Architecture](https://nextjs.org/docs/architecture)
- [Firebase Architecture](https://firebase.google.com/docs/guides)
- [React Patterns](https://reactpatterns.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

Cette architecture est conçue pour être :
- ✅ Scalable
- ✅ Maintenable
- ✅ Sécurisée
- ✅ Performante
- ✅ Testable
