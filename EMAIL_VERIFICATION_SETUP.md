# Configuration du Système de Vérification Email

## ✅ Ce qui a été fait

Le système de vérification email a été intégré avec ton système d'envoi d'email existant (Nodemailer).

### Fichiers créés/modifiés :

1. **`app/api/verification/send-code/route.ts`** - API Route pour envoyer les codes par email
2. **`lib/firebase-admin.ts`** - Configuration Firebase Admin SDK
3. **`lib/firebase/verification.ts`** - Service de vérification (mis à jour)
4. **`components/auth/EmailVerification.tsx`** - Composant de vérification (mis à jour)
5. **`app/register/page.tsx`** - Formulaire d'inscription avec téléphone et code pays

## 📋 Configuration Requise

### 1. Variables d'environnement

Ajoute ces variables dans ton fichier `.env.local` :

```bash
# Email Configuration (déjà configuré)
EMAIL_HOST=smtp.ton-serveur.com
EMAIL_PORT=465
EMAIL_USER=contact@ton-domaine.com
EMAIL_PASSWORD=ton-mot-de-passe

# Firebase Admin SDK (NOUVEAU - requis)
FIREBASE_PROJECT_ID=interappshop
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@interappshop.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"
```

### 2. Obtenir les credentials Firebase Admin

1. Va sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionne ton projet "interappshop"
3. Va dans **Paramètres du projet** (⚙️) → **Comptes de service**
4. Clique sur **Générer une nouvelle clé privée**
5. Un fichier JSON sera téléchargé avec ces informations :
   ```json
   {
     "project_id": "interappshop",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "firebase-adminsdk-xxxxx@interappshop.iam.gserviceaccount.com"
   }
   ```
6. Copie ces valeurs dans ton `.env.local`

### 3. Installer les dépendances

```bash
npm install firebase-admin nodemailer
npm install --save-dev @types/nodemailer
```

### 4. Déployer l'index Firestore

L'index pour `emailVerifications` doit être créé :

**Option 1 : Via le lien d'erreur**
- Lors de la première utilisation, Firebase te donnera un lien dans l'erreur
- Clique dessus pour créer l'index automatiquement

**Option 2 : Via la commande**
```bash
firebase deploy --only firestore:indexes
```

**Option 3 : Manuellement**
1. Va sur Firebase Console → Firestore Database → Indexes
2. Crée un index composite :
   - Collection: `emailVerifications`
   - Champs: 
     - `userId` (Ascending)
     - `createdAt` (Descending)

## 🚀 Utilisation

### Flux d'inscription

1. **Utilisateur remplit le formulaire** :
   - Nom complet
   - Email
   - Type de compte (Client/Fournisseur/Marketiste)
   - Numéro de téléphone avec code pays
   - Mot de passe (min 6 caractères)

2. **Système envoie le code** :
   - Code à 6 chiffres généré
   - Email envoyé via Nodemailer
   - Code valide pendant 4 minutes
   - Maximum 3 tentatives

3. **Utilisateur vérifie** :
   - Entre le code reçu par email
   - Timer de 4 minutes affiché
   - Peut renvoyer le code (délai de 1 minute)

4. **Compte activé** :
   - Client → Accès immédiat au dashboard
   - Fournisseur/Marketiste → Vérification téléphone (Phase 2)

## 🔧 Fonctionnalités

### Sécurité
- ✅ Code à 6 chiffres aléatoire
- ✅ Expiration après 4 minutes
- ✅ Maximum 3 tentatives par compte
- ✅ Délai de 1 minute entre chaque demande
- ✅ Retry automatique pour Firestore
- ✅ Logs détaillés pour debugging

### UX
- ✅ Timer en temps réel
- ✅ Bouton "Renvoyer le code" avec délai
- ✅ Messages d'erreur clairs
- ✅ Sélecteur de code pays (20 pays africains)
- ✅ Validation du format téléphone
- ✅ Email HTML responsive

### Email Template
- ✅ Design professionnel avec branding orange
- ✅ Code bien visible
- ✅ Avertissement d'expiration
- ✅ Instructions claires

## 🧪 Tests

### Test 1 : Inscription Client

1. Va sur `/register`
2. Remplis le formulaire :
   - Nom: "Test User"
   - Email: "test@example.com"
   - Type: Client
   - Téléphone: +243 812345678
   - Mot de passe: "test123"
3. Clique sur "S'inscrire"
4. Vérifie ton email
5. Entre le code reçu
6. Tu devrais être redirigé vers `/dashboard`

### Test 2 : Renvoi de code

1. Attends 1 minute après le premier envoi
2. Clique sur "Renvoyer le code"
3. Vérifie que tu reçois un nouvel email
4. Le timer se réinitialise à 4 minutes

### Test 3 : Code expiré

1. Attends 4 minutes sans entrer le code
2. Essaie de vérifier
3. Tu devrais voir "Le code de vérification a expiré"
4. Renvoie un nouveau code

### Test 4 : Code incorrect

1. Entre un code incorrect
2. Tu devrais voir "Code de vérification incorrect"
3. Le code reste valide pour réessayer

## 🐛 Debugging

### Problème : Email non reçu

**Vérifications** :
1. Vérifie les logs de la console (F12)
2. Vérifie les variables d'environnement EMAIL_*
3. Vérifie le dossier spam
4. Vérifie les logs Nodemailer dans la console serveur

**Solution** :
```bash
# Teste la configuration email
node -e "console.log(process.env.EMAIL_HOST, process.env.EMAIL_USER)"
```

### Problème : Erreur Firebase Admin

**Message** : "Error initializing Firebase Admin"

**Solution** :
1. Vérifie que `FIREBASE_PRIVATE_KEY` contient bien `\n` (pas de vraies nouvelles lignes)
2. Vérifie que la clé est entre guillemets dans `.env.local`
3. Redémarre le serveur Next.js

### Problème : Index Firestore manquant

**Message** : "The query requires an index"

**Solution** :
1. Clique sur le lien dans l'erreur
2. OU déploie : `firebase deploy --only firestore:indexes`
3. Attends 2-3 minutes que l'index soit créé

## 📊 Monitoring

### Logs à surveiller

```typescript
// Succès
✅ Firebase Admin initialisé
✅ Email envoyé avec succès
📧 Code de vérification envoyé par email

// Erreurs
❌ Erreur envoi email: ...
❌ Erreur initialisation Firebase Admin: ...
```

### Métriques importantes

- Taux de vérification email (objectif: >90%)
- Temps moyen de vérification
- Nombre de codes renvoyés
- Taux d'expiration

## 🔜 Prochaines étapes (Phase 2)

1. **Vérification téléphone par SMS**
   - Firebase Phone Authentication
   - Code OTP par SMS
   - Validation en 2 minutes

2. **Validation admin**
   - Dashboard admin pour approuver/rejeter
   - Notifications aux admins
   - Emails de confirmation

3. **Améliorations**
   - Vérification en 2 étapes (2FA)
   - Historique de vérification
   - Analytics détaillées

## 📝 Notes

- Les emails sont envoyés via ton système Nodemailer existant
- Le code est stocké dans Firestore avec expiration
- Firebase Admin SDK est utilisé côté serveur uniquement
- Le téléphone est collecté mais pas encore vérifié (Phase 2)

## 🆘 Support

Si tu rencontres des problèmes :
1. Vérifie les logs de la console
2. Vérifie les variables d'environnement
3. Vérifie que Firebase Admin est bien configuré
4. Vérifie que l'index Firestore est créé

---

**Date de création** : 14 février 2026  
**Version** : 1.0.0 (Phase 1 avec Nodemailer)
