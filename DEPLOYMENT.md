# Guide de déploiement

## Configuration Firebase

### 1. Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur "Ajouter un projet"
3. Suivre les étapes de création

### 2. Activer les services

#### Authentication
1. Dans la console Firebase, aller dans "Authentication"
2. Cliquer sur "Commencer"
3. Activer "Email/Password"
4. (Optionnel) Activer d'autres méthodes (Google, Facebook, etc.)

#### Firestore Database
1. Aller dans "Firestore Database"
2. Cliquer sur "Créer une base de données"
3. Choisir le mode "Production"
4. Sélectionner une région proche de vos utilisateurs
5. Déployer les règles de sécurité :
   ```bash
   firebase deploy --only firestore:rules
   ```
6. Déployer les indexes :
   ```bash
   firebase deploy --only firestore:indexes
   ```

#### Storage
1. Aller dans "Storage"
2. Cliquer sur "Commencer"
3. Accepter les règles par défaut
4. Déployer les règles personnalisées :
   ```bash
   firebase deploy --only storage
   ```

#### Cloud Messaging
1. Aller dans "Cloud Messaging"
2. Générer une paire de clés VAPID
3. Copier la clé publique dans votre configuration

### 3. Obtenir les credentials

1. Dans les paramètres du projet (⚙️)
2. Aller dans "Paramètres du projet"
3. Descendre jusqu'à "Vos applications"
4. Cliquer sur l'icône Web (</>)
5. Enregistrer l'application
6. Copier la configuration Firebase

### 4. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

## Déploiement sur Vercel

### 1. Préparer le projet

```bash
npm run build
```

### 2. Déployer sur Vercel

#### Via CLI
```bash
npm install -g vercel
vercel login
vercel
```

#### Via GitHub
1. Pusher le code sur GitHub
2. Aller sur [vercel.com](https://vercel.com)
3. Importer le repository
4. Ajouter les variables d'environnement
5. Déployer

### 3. Configurer les variables d'environnement sur Vercel

1. Dans le dashboard Vercel
2. Aller dans "Settings" > "Environment Variables"
3. Ajouter toutes les variables du fichier `.env.local`

## Structure des collections Firestore

### Créer les collections initiales

Vous pouvez créer manuellement les collections dans la console Firebase ou elles seront créées automatiquement lors de la première utilisation.

Collections nécessaires :
- `users`
- `products`
- `orders`
- `conversations`
- `messages`
- `notifications`
- `reviews`
- `marketingCodes`

## Configuration des indexes

Les indexes composites sont définis dans `firestore.indexes.json`. Pour les déployer :

```bash
firebase deploy --only firestore:indexes
```

## Sécurité

### Règles Firestore
Les règles de sécurité sont définies dans `firestore.rules`. Elles contrôlent :
- Qui peut lire/écrire dans chaque collection
- Validation des données
- Permissions basées sur les rôles

### Règles Storage
Les règles de stockage sont définies dans `storage.rules`. Elles contrôlent :
- Taille maximale des fichiers
- Types de fichiers autorisés
- Permissions d'upload/download

## Monitoring

### Firebase Console
- Surveiller l'utilisation dans la console Firebase
- Vérifier les logs d'erreurs
- Analyser les performances

### Vercel Analytics
- Activer Vercel Analytics pour le monitoring
- Suivre les performances du site
- Analyser le trafic

## Maintenance

### Backup Firestore
```bash
gcloud firestore export gs://[BUCKET_NAME]
```

### Mise à jour des dépendances
```bash
npm update
npm audit fix
```

### Monitoring des coûts
- Surveiller l'utilisation Firebase dans la console
- Configurer des alertes de budget
- Optimiser les requêtes pour réduire les coûts

## Troubleshooting

### Erreurs courantes

1. **CORS errors** : Vérifier la configuration Firebase
2. **Permission denied** : Vérifier les règles Firestore
3. **Index required** : Créer les indexes manquants
4. **Quota exceeded** : Vérifier les limites Firebase

### Logs

```bash
# Logs Vercel
vercel logs

# Logs Firebase
firebase functions:log
```
