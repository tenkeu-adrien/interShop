# 🚀 Bienvenue sur AlibabaClone !

## 👋 Commencez ici

Vous venez de recevoir un projet e-commerce B2B/B2C complet inspiré d'Alibaba. Ce fichier vous guide pour démarrer rapidement.

## ⚡ Démarrage ultra-rapide (5 minutes)

### 1. Vérifiez les prérequis
```bash
node --version  # Doit être 18+
npm --version
```

### 2. Configurez Firebase

1. Allez sur https://console.firebase.google.com/
2. Créez un nouveau projet
3. Activez :
   - Authentication (Email/Password)
   - Firestore Database (mode test)
   - Storage
   - Cloud Messaging
4. Copiez vos credentials Firebase

### 3. Configurez les variables d'environnement

Le fichier `.env.local` existe déjà. Remplacez les valeurs :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_clé_ici
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domaine_ici
# ... etc
```

### 4. Lancez l'application

```bash
npm run dev
```

Ouvrez http://localhost:3000 🎉

## 📚 Documentation

Le projet contient une documentation complète :

### Pour démarrer
- **[QUICKSTART.md](QUICKSTART.md)** ⭐ - Guide de démarrage détaillé
- **[README.md](README.md)** - Vue d'ensemble du projet

### Pour développer
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Architecture du projet
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Standards de code
- **[COMMANDS.md](COMMANDS.md)** - Commandes utiles

### Pour déployer
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide de déploiement
- **[TESTING.md](TESTING.md)** - Configuration des tests

### Pour comprendre
- **[FEATURES.md](FEATURES.md)** - Liste des fonctionnalités
- **[CHANGELOG.md](CHANGELOG.md)** - Historique des versions

## 🎯 Que faire ensuite ?

### Option 1 : Tester l'application
1. Créez un compte sur http://localhost:3000/register
2. Explorez les différents rôles (Client, Fournisseur, Marketiste)
3. Testez le panier et les fonctionnalités de base

### Option 2 : Développer une fonctionnalité
1. Consultez [FEATURES.md](FEATURES.md) pour voir ce qui reste à faire
2. Lisez [CONTRIBUTING.md](CONTRIBUTING.md) pour les standards
3. Créez une branche et commencez à coder !

### Option 3 : Déployer en production
1. Suivez [DEPLOYMENT.md](DEPLOYMENT.md)
2. Déployez sur Vercel ou votre hébergeur préféré
3. Configurez Firebase en mode production

## 🏗️ Structure du projet

```
alibaba-clone/
├── 📂 app/              # Pages Next.js
├── 📂 components/       # Composants React
├── 📂 lib/              # Services et utilitaires
│   └── firebase/       # Services Firebase
├── 📂 store/            # Stores Zustand
├── 📂 types/            # Types TypeScript
├── 📂 hooks/            # Hooks personnalisés
└── 📄 Documentation/    # Tous les fichiers .md
```

## 🔥 Fonctionnalités principales

### ✅ Déjà implémenté
- Authentification multi-rôles
- Catalogue de produits
- Panier d'achat persistant
- Chat en temps réel
- Notifications
- Dashboards de base
- Structure de données complète

### 🚧 À implémenter
- Système de paiement
- Upload d'images
- Avis et notations
- Recherche avancée
- Back-office admin
- Application mobile

Voir [FEATURES.md](FEATURES.md) pour la liste complète.

## 🛠️ Technologies utilisées

- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Firebase** - Backend (Auth, Firestore, Storage, Messaging)
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icônes

## 📊 Rôles utilisateurs

### 👤 Client (Acheteur)
- Rechercher et acheter des produits
- Discuter avec les fournisseurs
- Suivre les commandes
- Laisser des avis

### 🏪 Fournisseur (Vendeur)
- Créer une boutique
- Gérer les produits
- Traiter les commandes
- Voir les statistiques

### 🎯 Marketiste (Affilié)
- Créer des codes promo
- Suivre les performances
- Gagner des commissions

### 👨‍💼 Admin
- Gérer la plateforme
- Modérer les contenus
- Voir les statistiques globales

## 🆘 Besoin d'aide ?

### Problèmes courants

**Le serveur ne démarre pas**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**Erreur Firebase**
- Vérifiez `.env.local`
- Vérifiez que les services sont activés dans Firebase Console

**Port 3000 occupé**
```bash
npm run dev -- -p 3001
```

### Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Zustand](https://docs.pmnd.rs/zustand)
- [Documentation Tailwind](https://tailwindcss.com/docs)

### Support

- 📖 Consultez la documentation dans les fichiers .md
- 🐛 Ouvrez une issue sur GitHub
- 💬 Contactez l'équipe de développement

## 🎨 Personnalisation

### Changer les couleurs
Modifiez `app/globals.css` et les classes Tailwind dans les composants.

### Ajouter une page
Créez un nouveau dossier dans `app/` avec un fichier `page.tsx`.

### Ajouter un composant
Créez un nouveau fichier dans `components/` avec votre composant.

### Modifier la base de données
Éditez les types dans `types/index.ts` et les services dans `lib/firebase/`.

## 🚀 Prochaines étapes recommandées

1. **Configurez Firebase** (si pas déjà fait)
2. **Testez l'application** localement
3. **Lisez la documentation** pour comprendre l'architecture
4. **Choisissez une fonctionnalité** à implémenter
5. **Développez et testez**
6. **Déployez** en production

## 📈 Roadmap

### Court terme (1-2 mois)
- Système de paiement
- Upload d'images
- Page détail produit
- Gestion des commandes

### Moyen terme (3-6 mois)
- Avis et notations
- Recherche avancée
- Dashboard admin
- Notifications push

### Long terme (6-12 mois)
- Application mobile
- IA pour recommandations
- Multi-langues
- API publique

## 🎉 Félicitations !

Vous avez maintenant une base solide pour créer votre plateforme e-commerce B2B/B2C.

**Bon développement ! 🚀**

---

## 📞 Liens rapides

- [Guide de démarrage rapide](QUICKSTART.md)
- [Documentation complète](README.md)
- [Structure du projet](PROJECT_STRUCTURE.md)
- [Liste des fonctionnalités](FEATURES.md)
- [Guide de contribution](CONTRIBUTING.md)
- [Guide de déploiement](DEPLOYMENT.md)

---

**Note :** Ce projet est en développement actif. Consultez [CHANGELOG.md](CHANGELOG.md) pour voir les dernières modifications.
