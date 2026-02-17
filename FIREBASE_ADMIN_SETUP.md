# 🔧 Configuration Firebase Admin SDK

## ⚠️ PROBLÈME IDENTIFIÉ

Les credentials Firebase Admin dans `.env.local` pointent vers le mauvais projet Firebase (`criteo-ea902`) alors que votre projet réel est `interappshop`.

C'est pour ça que le document `emailVerifications` n'est pas créé dans Firestore - Firebase Admin essaie d'écrire dans un projet différent !

## 📋 ÉTAPES POUR CORRIGER

### 1. Obtenir les bonnes credentials Firebase Admin

1. Allez sur la console Firebase: https://console.firebase.google.com/project/interappshop/settings/serviceaccounts/adminsdk

2. Cliquez sur l'onglet **"Comptes de service"**

3. Cliquez sur le bouton **"Générer une nouvelle clé privée"**

4. Un fichier JSON sera téléchargé avec ce format:
```json
{
  "type": "service_account",
  "project_id": "interappshop",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@interappshop.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 2. Mettre à jour `.env.local`

Remplacez les 3 variables Firebase Admin dans `.env.local`:

```env
FIREBASE_PROJECT_ID=interappshop
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@interappshop.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_COMPLETE_ICI\n-----END PRIVATE KEY-----\n"
```

**IMPORTANT**: 
- Gardez les guillemets autour de `FIREBASE_PRIVATE_KEY`
- Gardez les `\n` dans la clé privée (ils représentent les retours à la ligne)
- La clé doit commencer par `-----BEGIN PRIVATE KEY-----` et finir par `-----END PRIVATE KEY-----`

### 3. Redémarrer le serveur Next.js

Après avoir modifié `.env.local`, vous DEVEZ redémarrer le serveur:

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

### 4. Tester à nouveau

Une fois le serveur redémarré avec les bonnes credentials:

1. Allez sur la page d'inscription
2. Créez un nouveau compte
3. Vérifiez dans les logs du terminal que vous voyez:
   - ✅ Firebase Admin chargé
   - ✅ Document créé dans Firestore
   - ✅ Vérification: Document existe bien dans Firestore

4. Vérifiez dans la console Firebase (https://console.firebase.google.com/project/interappshop/firestore/data) que le document apparaît dans la collection `emailVerifications`

## 🔍 Comment vérifier que ça fonctionne

### Dans les logs du terminal:
```
✅ Firebase Admin chargé
✅ Nodemailer configuré
📨 API /api/verification/send-code appelée
📧 Envoi code pour: user@example.com userId: abc123
🔑 Code généré: 123456
💾 Tentative de sauvegarde dans Firestore...
Collection: emailVerifications, Document ID: abc123
✅ Document créé dans Firestore
✅ Vérification: Document existe bien dans Firestore
📤 Envoi de l'email...
✅ Email envoyé avec succès
```

### Dans la console Firebase:
- Collection: `emailVerifications`
- Document ID: `{userId}`
- Champs: `code`, `email`, `userId`, `createdAt`, `expiresAt`, `attempts`, `verified`

## ❌ Erreurs courantes

### "Firebase Admin non disponible"
- Les variables d'environnement ne sont pas définies
- Le fichier `.env.local` n'a pas été sauvegardé
- Le serveur n'a pas été redémarré

### "Permission denied" dans Firestore
- Les règles Firestore bloquent l'écriture
- Vérifiez que les règles permettent l'écriture pour Firebase Admin

### "Invalid credentials"
- La clé privée est mal formatée
- Les `\n` ont été supprimés ou modifiés
- Le `project_id` ne correspond pas

## 📚 Ressources

- [Documentation Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Générer une clé privée](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Variables d'environnement Next.js](https://nextjs.org/docs/basic-features/environment-variables)
