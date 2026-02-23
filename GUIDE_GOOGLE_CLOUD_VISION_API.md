# Guide Complet: Obtenir la Clé Google Cloud Vision API

## 🎯 Objectif
Obtenir une clé API pour utiliser Google Cloud Vision API avec votre projet Firebase.

## ⚠️ Important à Comprendre

**Firebase ≠ Google Cloud Vision API**

- **Firebase**: Base de données, authentification, storage (ce que vous utilisez déjà)
- **Google Cloud Vision API**: Service d'analyse d'images par IA (nouveau service à activer)

Même si vous utilisez Firebase, vous devez activer Cloud Vision API séparément.

## 📋 Prérequis

- ✅ Avoir un projet Firebase existant
- ✅ Être connecté avec le compte Google propriétaire du projet
- ✅ Avoir accès à Internet

## 🚀 Étapes Détaillées

### Étape 1: Accéder à Google Cloud Console

1. **Ouvrir votre navigateur**
2. **Aller sur**: https://console.cloud.google.com/
3. **Se connecter** avec le même compte Google que Firebase

```
┌─────────────────────────────────────────┐
│  Google Cloud Console                   │
│  ┌───────────────────────────────────┐  │
│  │ Sélectionner un projet ▼         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

4. **Cliquer sur le sélecteur de projet** (en haut)
5. **Trouver votre projet Firebase** dans la liste
   - Il aura le même nom que votre projet Firebase
   - Format: `votre-projet-firebase` ou `votre-projet-firebase-xxxxx`

### Étape 2: Activer Cloud Vision API

1. **Dans le menu de gauche**, cliquer sur:
   ```
   ☰ Menu > APIs & Services > Library
   ```

2. **Dans la barre de recherche**, taper:
   ```
   Cloud Vision API
   ```

3. **Cliquer sur "Cloud Vision API"** dans les résultats

4. **Cliquer sur le bouton bleu "ENABLE"** (ou "ACTIVER")

```
┌─────────────────────────────────────────┐
│  Cloud Vision API                       │
│                                         │
│  Détecte et extrait du texte et des    │
│  objets dans les images                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        [ENABLE]                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

5. **Attendre quelques secondes** que l'API soit activée

### Étape 3: Créer une Clé API

1. **Dans le menu de gauche**, cliquer sur:
   ```
   ☰ Menu > APIs & Services > Credentials
   ```

2. **En haut de la page**, cliquer sur:
   ```
   + CREATE CREDENTIALS
   ```

3. **Dans le menu déroulant**, sélectionner:
   ```
   API key
   ```

```
┌─────────────────────────────────────────┐
│  + CREATE CREDENTIALS                   │
│  ┌───────────────────────────────────┐  │
│  │ API key                           │  │
│  │ OAuth client ID                   │  │
│  │ Service account                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

4. **Une popup apparaît** avec votre clé:

```
┌─────────────────────────────────────────┐
│  API key created                        │
│                                         │
│  Your API key:                          │
│  ┌───────────────────────────────────┐  │
│  │ AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXX  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [COPY]  [RESTRICT KEY]  [CLOSE]       │
└─────────────────────────────────────────┘
```

5. **IMPORTANT: Cliquer sur "COPY"** pour copier la clé
6. **Garder cette fenêtre ouverte** (on va restreindre la clé)

### Étape 4: Restreindre la Clé (Sécurité)

**Pourquoi?** Pour éviter que quelqu'un vole votre clé et l'utilise.

1. **Dans la popup**, cliquer sur "RESTRICT KEY"
   
   OU
   
   **Dans la liste des credentials**, cliquer sur l'icône ✏️ (crayon) à côté de votre clé

2. **Sous "API restrictions"**:
   ```
   ○ Don't restrict key
   ● Restrict key
   
   Select APIs:
   ☑ Cloud Vision API
   ```
   - Sélectionner "Restrict key"
   - Cocher UNIQUEMENT "Cloud Vision API"

3. **Sous "Application restrictions"** (optionnel mais recommandé):
   ```
   ● HTTP referrers (web sites)
   
   Add an item:
   http://localhost:3000/*
   https://votre-domaine.com/*
   ```
   - Sélectionner "HTTP referrers"
   - Ajouter `http://localhost:3000/*` (pour développement)
   - Ajouter `https://votre-domaine.com/*` (pour production)

4. **Cliquer sur "SAVE"** en bas

### Étape 5: Ajouter la Clé dans votre Projet

1. **Ouvrir votre projet** dans VS Code (ou votre éditeur)

2. **Ouvrir le fichier `.env.local`** (à la racine du projet)
   - Si le fichier n'existe pas, le créer

3. **Ajouter cette ligne**:
   ```env
   NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   - Remplacer `AIzaSy...` par votre vraie clé copiée

4. **Sauvegarder le fichier**

### Étape 6: Redémarrer le Serveur

1. **Dans votre terminal**, arrêter le serveur:
   ```bash
   Ctrl + C  (ou Cmd + C sur Mac)
   ```

2. **Redémarrer le serveur**:
   ```bash
   npm run dev
   ```

3. **Attendre que le serveur démarre**:
   ```
   ✓ Ready in 2.3s
   ○ Local:   http://localhost:3000
   ```

### Étape 7: Tester

1. **Ouvrir votre site**: http://localhost:3000

2. **Cliquer sur l'icône caméra** 📷 dans la barre de recherche

3. **Sélectionner une image**

4. **Vérifier les messages**:
   - ✅ "Upload de l'image..."
   - ✅ "Analyse de l'image avec l'IA..."
   - ✅ "Image analysée avec succès!"

5. **Si ça fonctionne**: Vous êtes redirigé vers la page produits avec résultats! 🎉

## 🐛 Dépannage

### Erreur: "API key not configured"

**Cause**: La clé n'est pas dans `.env.local` ou le serveur n'a pas redémarré

**Solution**:
1. Vérifier que `.env.local` contient bien la ligne
2. Vérifier qu'il n'y a pas d'espace avant/après la clé
3. Redémarrer le serveur (Ctrl+C puis `npm run dev`)

### Erreur: "API key not valid"

**Cause**: La clé est incorrecte ou mal copiée

**Solution**:
1. Retourner sur Google Cloud Console
2. Copier à nouveau la clé
3. Remplacer dans `.env.local`
4. Redémarrer le serveur

### Erreur: "Cloud Vision API has not been used"

**Cause**: L'API n'est pas activée

**Solution**:
1. Retourner sur Google Cloud Console
2. APIs & Services > Library
3. Rechercher "Cloud Vision API"
4. Cliquer "ENABLE"
5. Attendre 1-2 minutes

### Erreur: "This API call is not allowed from this referer"

**Cause**: Les restrictions HTTP referrers bloquent localhost

**Solution**:
1. Google Cloud Console > Credentials
2. Éditer votre clé API
3. Sous "Application restrictions":
   - Ajouter `http://localhost:3000/*`
   - Ajouter `http://localhost:*/*` (pour tous les ports)
4. Sauvegarder

## 💰 Coûts et Quotas

### Quota Gratuit
- ✅ **1000 requêtes/mois GRATUITES**
- ✅ Pas de carte bancaire requise
- ✅ Renouvellement automatique chaque mois

### Après le Quota Gratuit
- 💳 **$1.50 pour 1000 requêtes**
- 💳 Facturation automatique si carte ajoutée
- 💳 Sinon, l'API s'arrête jusqu'au mois suivant

### Surveiller l'Utilisation

1. **Google Cloud Console**
2. **Menu > APIs & Services > Dashboard**
3. **Cliquer sur "Cloud Vision API"**
4. **Voir le graphique d'utilisation**

```
┌─────────────────────────────────────────┐
│  Cloud Vision API Usage                 │
│                                         │
│  This month: 47 / 1000 requests        │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░ 4.7%  │
│                                         │
│  Remaining: 953 requests                │
└─────────────────────────────────────────┘
```

## 🔒 Sécurité

### ✅ Bonnes Pratiques

1. **Ne jamais commiter `.env.local`** dans Git
   - Vérifier que `.env.local` est dans `.gitignore`

2. **Restreindre la clé API**
   - Uniquement Cloud Vision API
   - Uniquement vos domaines

3. **Utiliser des variables d'environnement**
   - `NEXT_PUBLIC_` pour le client
   - Sans préfixe pour le serveur (plus sécurisé)

4. **Régénérer la clé si compromise**
   - Google Cloud Console > Credentials
   - Supprimer l'ancienne clé
   - Créer une nouvelle

### ❌ À Éviter

- ❌ Partager la clé publiquement
- ❌ La mettre dans le code source
- ❌ L'envoyer par email/chat
- ❌ La laisser sans restrictions

## 📊 Exemple de `.env.local` Complet

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Google Cloud Vision API (NOUVEAU)
NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXX
```

## 🎓 Résumé

1. ✅ Aller sur https://console.cloud.google.com/
2. ✅ Sélectionner votre projet Firebase
3. ✅ Activer Cloud Vision API (Library)
4. ✅ Créer une clé API (Credentials)
5. ✅ Restreindre la clé (Sécurité)
6. ✅ Ajouter dans `.env.local`
7. ✅ Redémarrer le serveur
8. ✅ Tester la recherche par image

## 🆘 Besoin d'Aide?

Si vous rencontrez des problèmes:

1. **Vérifier la console du navigateur** (F12)
2. **Vérifier les logs du serveur** (terminal)
3. **Vérifier que l'API est activée** (Google Cloud Console)
4. **Vérifier que la clé est correcte** (`.env.local`)
5. **Vérifier que le serveur a redémarré**

## 🎉 Félicitations!

Une fois configuré, votre recherche par image fonctionnera parfaitement! Les utilisateurs pourront trouver des produits en uploadant simplement une photo. 📷✨
