# Structure du projet AlibabaClone

## 📁 Arborescence complète

```
alibaba-clone/
│
├── 📂 app/                          # Pages Next.js (App Router)
│   ├── 📂 cart/                     # Page panier
│   │   └── page.tsx
│   ├── 📂 dashboard/                # Tableaux de bord
│   │   ├── 📂 fournisseur/         # Dashboard fournisseur
│   │   │   └── page.tsx
│   │   └── page.tsx                # Dashboard général
│   ├── 📂 login/                    # Page de connexion
│   │   └── page.tsx
│   ├── 📂 products/                 # Pages produits
│   │   └── page.tsx                # Liste des produits
│   ├── 📂 register/                 # Page d'inscription
│   │   └── page.tsx
│   ├── globals.css                  # Styles globaux
│   ├── layout.tsx                   # Layout principal
│   └── page.tsx                     # Page d'accueil
│
├── 📂 components/                   # Composants React réutilisables
│   ├── 📂 auth/                     # Composants d'authentification
│   │   └── ProtectedRoute.tsx      # Protection des routes
│   ├── 📂 chat/                     # Composants de chat
│   │   └── ChatWindow.tsx          # Fenêtre de chat
│   ├── 📂 layout/                   # Composants de mise en page
│   │   ├── Footer.tsx              # Pied de page
│   │   └── Header.tsx              # En-tête
│   ├── 📂 products/                 # Composants produits
│   │   └── ProductCard.tsx         # Carte produit
│   └── 📂 providers/                # Providers React
│       └── AuthProvider.tsx        # Provider d'authentification
│
├── 📂 hooks/                        # Hooks React personnalisés
│   ├── useChat.ts                  # Hook pour le chat
│   └── useNotifications.ts         # Hook pour les notifications
│
├── 📂 lib/                          # Bibliothèques et utilitaires
│   ├── 📂 firebase/                 # Services Firebase
│   │   ├── auth.ts                 # Authentification
│   │   ├── chat.ts                 # Chat en temps réel
│   │   ├── config.ts               # Configuration Firebase
│   │   ├── notifications.ts        # Notifications
│   │   ├── orders.ts               # Gestion des commandes
│   │   └── products.ts             # Gestion des produits
│   ├── constants.ts                # Constantes de l'application
│   └── utils.ts                    # Fonctions utilitaires
│
├── 📂 store/                        # Stores Zustand (State Management)
│   ├── authStore.ts                # État d'authentification
│   ├── cartStore.ts                # État du panier
│   └── chatStore.ts                # État du chat
│
├── 📂 types/                        # Définitions TypeScript
│   └── index.ts                    # Tous les types de l'application
│
├── 📂 public/                       # Assets statiques
│   └── (images, fonts, etc.)
│
├── 📄 .env.local                    # Variables d'environnement (à créer)
├── 📄 .gitignore                    # Fichiers ignorés par Git
├── 📄 CONTRIBUTING.md               # Guide de contribution
├── 📄 DEPLOYMENT.md                 # Guide de déploiement
├── 📄 firestore.indexes.json       # Indexes Firestore
├── 📄 firestore.rules               # Règles de sécurité Firestore
├── 📄 middleware.ts                 # Middleware Next.js
├── 📄 next.config.ts                # Configuration Next.js
├── 📄 package.json                  # Dépendances npm
├── 📄 postcss.config.mjs            # Configuration PostCSS
├── 📄 PROJECT_STRUCTURE.md          # Ce fichier
├── 📄 QUICKSTART.md                 # Guide de démarrage rapide
├── 📄 README.md                     # Documentation principale
├── 📄 storage.rules                 # Règles de sécurité Storage
└── 📄 tsconfig.json                 # Configuration TypeScript
```

## 🎯 Description des dossiers principaux

### `/app` - Pages et Routes
Contient toutes les pages de l'application utilisant le App Router de Next.js 15.
- Chaque dossier représente une route
- `page.tsx` définit le contenu de la route
- `layout.tsx` définit la mise en page partagée

### `/components` - Composants réutilisables
Composants React organisés par fonctionnalité :
- **auth/** : Authentification et protection des routes
- **chat/** : Interface de messagerie
- **layout/** : En-tête, pied de page, navigation
- **products/** : Affichage des produits
- **providers/** : Context providers React

### `/lib` - Logique métier
Code partagé et services :
- **firebase/** : Toutes les interactions avec Firebase
- **constants.ts** : Valeurs constantes (catégories, pays, etc.)
- **utils.ts** : Fonctions utilitaires (formatage, calculs, etc.)

### `/store` - Gestion d'état
Stores Zustand pour l'état global :
- **authStore** : Utilisateur connecté
- **cartStore** : Panier d'achat (persisté)
- **chatStore** : Conversations et messages

### `/hooks` - Hooks personnalisés
Hooks React réutilisables :
- **useChat** : Gestion des conversations
- **useNotifications** : Gestion des notifications

### `/types` - Types TypeScript
Définitions de types pour toute l'application :
- User, Product, Order, Message, etc.
- Interfaces et types partagés

## 🔥 Services Firebase

### Authentication
- Inscription/Connexion email/password
- Gestion des sessions
- Réinitialisation de mot de passe

### Firestore Database
Collections principales :
- `users` : Profils utilisateurs
- `products` : Catalogue de produits
- `orders` : Commandes
- `conversations` : Conversations de chat
- `messages` : Messages
- `notifications` : Notifications
- `reviews` : Avis clients
- `marketingCodes` : Codes promotionnels

### Storage
Stockage de fichiers :
- Avatars utilisateurs
- Images de produits
- Logos de boutiques
- Pièces jointes de chat
- Images d'avis

### Cloud Messaging
Notifications push en temps réel

## 🎨 Stack technique

### Frontend
- **Next.js 15** : Framework React
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling
- **Lucide React** : Icônes

### Backend
- **Firebase Auth** : Authentification
- **Firestore** : Base de données NoSQL
- **Firebase Storage** : Stockage de fichiers
- **Cloud Messaging** : Notifications

### State Management
- **Zustand** : État global léger
- **React Hooks** : État local

### Utilitaires
- **date-fns** : Manipulation de dates
- **react-hot-toast** : Notifications toast
- **clsx + tailwind-merge** : Gestion des classes CSS

## 🚀 Flux de données

### Authentification
```
User → Login Form → Firebase Auth → AuthStore → Protected Routes
```

### Produits
```
Firestore → Products Service → Product List → ProductCard → User
```

### Chat
```
User → ChatWindow → Firebase Realtime → ChatStore → Other User
```

### Commandes
```
Cart → Checkout → Order Service → Firestore → Notifications
```

## 📊 Modèle de données

### User
```typescript
{
  id: string
  email: string
  role: 'client' | 'fournisseur' | 'marketiste'
  displayName: string
  // ... autres champs
}
```

### Product
```typescript
{
  id: string
  fournisseurId: string
  name: string
  prices: PriceTier[]
  moq: number
  // ... autres champs
}
```

### Order
```typescript
{
  id: string
  clientId: string
  fournisseurId: string
  products: OrderProduct[]
  total: number
  status: OrderStatus
  // ... autres champs
}
```

## 🔐 Sécurité

### Règles Firestore (`firestore.rules`)
- Contrôle d'accès basé sur les rôles
- Validation des données
- Protection contre les accès non autorisés

### Règles Storage (`storage.rules`)
- Limitation de taille des fichiers
- Validation des types de fichiers
- Contrôle d'accès par utilisateur

### Middleware (`middleware.ts`)
- Protection des routes sensibles
- Redirection des utilisateurs non authentifiés

## 📝 Conventions de code

### Nommage
- **Composants** : PascalCase (ex: `ProductCard.tsx`)
- **Hooks** : camelCase avec préfixe `use` (ex: `useAuth.ts`)
- **Utilitaires** : camelCase (ex: `formatPrice.ts`)
- **Constantes** : UPPER_SNAKE_CASE

### Organisation
- Un composant par fichier
- Exports nommés pour les utilitaires
- Default export pour les composants

### Types
- Interfaces pour les objets
- Types pour les unions et alias
- Typage strict (pas de `any`)

## 🎯 Prochaines fonctionnalités

- [ ] Système de paiement (Stripe/PayPal)
- [ ] Upload d'images avec Firebase Storage
- [ ] Système d'avis et notations
- [ ] Recherche avancée avec Algolia
- [ ] Recommandations IA
- [ ] Multi-devises
- [ ] Multi-langues (i18n)
- [ ] Application mobile (React Native)
- [ ] Back-office admin complet
- [ ] Analytics et reporting
- [ ] Export de données
- [ ] API REST publique

## 📚 Documentation

- **README.md** : Vue d'ensemble et installation
- **QUICKSTART.md** : Démarrage rapide
- **CONTRIBUTING.md** : Guide de contribution
- **DEPLOYMENT.md** : Guide de déploiement
- **PROJECT_STRUCTURE.md** : Ce fichier

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les issues GitHub
3. Créez une nouvelle issue si nécessaire
