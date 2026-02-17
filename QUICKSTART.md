# Guide de démarrage rapide

## 🚀 Installation en 5 minutes

### 1. Prérequis

- Node.js 18+ installé
- Un compte Firebase (gratuit)
- Git installé

### 2. Installation

```bash
# Le projet est déjà créé, naviguez dans le dossier
cd alibaba-clone

# Les dépendances sont déjà installées
# Si besoin, réinstallez avec :
npm install
```

### 3. Configuration Firebase

#### A. Créer un projet Firebase

1. Allez sur https://console.firebase.google.com/
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet (ex: "alibaba-clone-dev")
4. Désactivez Google Analytics (optionnel)
5. Cliquez sur "Créer le projet"

#### B. Activer les services

**Authentication :**
1. Dans le menu, cliquez sur "Authentication"
2. Cliquez sur "Commencer"
3. Activez "Email/Password"

**Firestore Database :**
1. Dans le menu, cliquez sur "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Démarrer en mode test" (pour le développement)
4. Sélectionnez une région proche (ex: europe-west1)

**Storage :**
1. Dans le menu, cliquez sur "Storage"
2. Cliquez sur "Commencer"
3. Acceptez les règles par défaut

**Cloud Messaging :**
1. Dans le menu, cliquez sur "Cloud Messaging"
2. Les notifications sont automatiquement activées

#### C. Obtenir les credentials

1. Cliquez sur l'icône ⚙️ (Paramètres) > "Paramètres du projet"
2. Descendez jusqu'à "Vos applications"
3. Cliquez sur l'icône Web `</>`
4. Nommez votre app (ex: "Web App")
5. Cochez "Configurer aussi Firebase Hosting" (optionnel)
6. Cliquez sur "Enregistrer l'application"
7. Copiez la configuration Firebase

#### D. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

### 4. Déployer les règles de sécurité (Optionnel mais recommandé)

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser Firebase dans le projet
firebase init

# Sélectionner :
# - Firestore
# - Storage
# Utiliser les fichiers existants (firestore.rules, storage.rules)

# Déployer les règles
firebase deploy --only firestore:rules,storage:rules
```

### 5. Lancer l'application

```bash
npm run dev
```

Ouvrez http://localhost:3000 dans votre navigateur.

## 🎯 Premiers pas

### Créer un compte

1. Allez sur http://localhost:3000/register
2. Remplissez le formulaire
3. Choisissez un type de compte :
   - **Client** : Pour acheter des produits
   - **Fournisseur** : Pour vendre des produits
   - **Marketiste** : Pour promouvoir des produits

### Tester les fonctionnalités

#### En tant que Client :
1. Parcourez les produits sur la page d'accueil
2. Utilisez la recherche et les filtres
3. Ajoutez des produits au panier
4. Passez une commande

#### En tant que Fournisseur :
1. Allez dans le tableau de bord
2. Ajoutez un nouveau produit
3. Gérez vos commandes
4. Discutez avec les clients

#### En tant que Marketiste :
1. Créez un code promotionnel
2. Partagez-le avec des clients
3. Suivez vos commissions

## 📊 Structure des données

### Collections Firestore créées automatiquement :

- `users` : Profils utilisateurs
- `products` : Catalogue de produits
- `orders` : Commandes
- `conversations` : Conversations de chat
- `messages` : Messages
- `notifications` : Notifications
- `reviews` : Avis clients
- `marketingCodes` : Codes promotionnels

## 🔧 Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm run start

# Vérifier les types TypeScript
npx tsc --noEmit

# Formater le code
npx prettier --write .
```

## 🐛 Dépannage

### Erreur "Firebase not configured"
- Vérifiez que le fichier `.env.local` existe
- Vérifiez que toutes les variables sont remplies
- Redémarrez le serveur de développement

### Erreur "Permission denied"
- Vérifiez que les services Firebase sont activés
- Déployez les règles de sécurité
- En développement, utilisez le mode test pour Firestore

### Erreur "Module not found"
```bash
# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 déjà utilisé
```bash
# Utilisez un autre port
npm run dev -- -p 3001
```

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Zustand](https://docs.pmnd.rs/zustand)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

## 🆘 Besoin d'aide ?

- Consultez le fichier `README.md` pour plus de détails
- Consultez `CONTRIBUTING.md` pour les standards de code
- Consultez `DEPLOYMENT.md` pour le déploiement en production
- Ouvrez une issue sur GitHub

## 🎉 Prochaines étapes

1. Personnalisez le design selon vos besoins
2. Ajoutez des produits de test
3. Testez le flux complet d'achat
4. Configurez le système de paiement (Stripe/PayPal)
5. Déployez sur Vercel

Bon développement ! 🚀
