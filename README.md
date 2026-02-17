# AlibabaClone - Plateforme E-commerce B2B/B2C

Plateforme e-commerce inspirée d'Alibaba avec Next.js 15, Firebase et Zustand.

## 🚀 Technologies

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Firebase** - Backend as a Service
  - Authentication
  - Firestore (Database)
  - Storage
  - Cloud Messaging (Notifications)
- **Zustand** - State Management
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 📁 Structure du projet

```
alibaba-clone/
├── app/                      # Pages Next.js (App Router)
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Page d'accueil
│   ├── login/               # Page de connexion
│   ├── register/            # Page d'inscription
│   └── dashboard/           # Tableau de bord
├── components/              # Composants React
│   ├── layout/             # Header, Footer
│   ├── products/           # ProductCard, etc.
│   ├── chat/               # ChatWindow
│   └── providers/          # AuthProvider
├── lib/                    # Utilitaires et configurations
│   └── firebase/           # Configuration et services Firebase
│       ├── config.ts       # Configuration Firebase
│       ├── auth.ts         # Services d'authentification
│       ├── products.ts     # Services produits
│       ├── chat.ts         # Services chat temps réel
│       ├── orders.ts       # Services commandes
│       └── notifications.ts # Services notifications
├── store/                  # Stores Zustand
│   ├── authStore.ts        # État d'authentification
│   ├── cartStore.ts        # État du panier
│   └── chatStore.ts        # État du chat
├── types/                  # Types TypeScript
│   └── index.ts            # Tous les types
└── public/                 # Assets statiques
```

## 🔧 Installation

1. Cloner le projet
```bash
cd alibaba-clone
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer Firebase
   - Créer un projet sur [Firebase Console](https://console.firebase.google.com/)
   - Activer Authentication (Email/Password)
   - Créer une base Firestore
   - Activer Storage
   - Activer Cloud Messaging
   - Copier les credentials dans `.env.local`

4. Lancer le serveur de développement
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🔥 Configuration Firebase

Créer un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 📊 Collections Firestore

### users
- id, email, role, displayName, photoURL, phoneNumber
- createdAt, updatedAt, isVerified, isActive

### products
- id, fournisseurId, name, description, images, videos
- category, subcategory, tags, moq, prices, stock
- country, deliveryTime, certifications
- rating, reviewCount, views, sales
- isActive, createdAt, updatedAt

### orders
- id, orderNumber, clientId, fournisseurId, marketisteId
- products, subtotal, marketingCommission, platformFee
- shippingFee, total, currency, status, paymentStatus
- shippingAddress, trackingNumber
- createdAt, updatedAt, paidAt, shippedAt, deliveredAt

### conversations
- id, participants, lastMessage, lastMessageAt
- unreadCount, createdAt

### messages
- id, conversationId, senderId, receiverId
- content, type, fileUrl, fileName
- isRead, createdAt

### notifications
- id, userId, type, title, message, data
- isRead, createdAt

## 👥 Rôles utilisateurs

### Client (Acheteur)
- Rechercher et acheter des produits
- Appliquer des codes marketiste
- Discuter avec les fournisseurs
- Suivre les commandes
- Laisser des avis

### Fournisseur (Vendeur)
- Créer et gérer une boutique
- Ajouter/modifier des produits
- Gérer les commandes
- Discuter avec les clients
- Consulter les statistiques

### Marketiste (Affilié)
- Générer des codes promotionnels
- Suivre les performances
- Consulter les commissions
- Demander des retraits

## 🎨 Fonctionnalités principales

- ✅ Authentification multi-rôles
- ✅ Recherche avancée avec filtres
- ✅ Chat en temps réel
- ✅ Système de commandes
- ✅ Codes marketiste avec commissions
- ✅ Notifications temps réel
- ✅ Panier persistant
- ✅ Gestion des produits
- ✅ Tableaux de bord par rôle

## 🚧 À développer

- [ ] Système de paiement (Stripe/PayPal)
- [ ] Upload d'images (Firebase Storage)
- [ ] Système d'avis et notations
- [ ] Filtres avancés de recherche
- [ ] Gestion des expéditions
- [ ] Back-office admin
- [ ] Recommandations IA
- [ ] Multi-devises
- [ ] Multi-langues

## 📝 Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Démarrer en production
npm run lint     # Linter
```

## 📄 Licence

MIT
