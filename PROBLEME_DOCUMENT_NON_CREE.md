# 🐛 Problème: Document emailVerifications non créé dans Firestore

## 📊 Diagnostic

### Symptômes observés:
1. ✅ L'email de vérification est bien envoyé avec le code
2. ❌ Le document n'est PAS créé dans la collection `emailVerifications` de Firestore
3. ❌ Lors de la vérification du code, erreur "Aucun code de vérification trouvé"

### Cause racine identifiée:

**Les credentials Firebase Admin pointent vers le MAUVAIS projet Firebase !**

Dans `.env.local`, les variables Firebase Admin utilisaient:
```env
FIREBASE_PROJECT_ID=criteo-ea902
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@criteo-ea902.iam.gserviceaccount.com
```

Alors que votre projet Firebase réel est:
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=interappshop
```

**Résultat**: Firebase Admin SDK essayait d'écrire dans le projet `criteo-ea902` au lieu de `interappshop`, donc le document n'apparaissait jamais dans votre Firestore !

## 🔧 Solution

### Étape 1: Obtenir les bonnes credentials

1. Allez sur: https://console.firebase.google.com/project/interappshop/settings/serviceaccounts/adminsdk

2. Cliquez sur **"Générer une nouvelle clé privée"**

3. Un fichier JSON sera téléchargé avec les bonnes credentials pour le projet `interappshop`

### Étape 2: Mettre à jour `.env.local`

Remplacez les 3 variables Firebase Admin:

```env
FIREBASE_PROJECT_ID=interappshop
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@interappshop.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_COMPLETE_ICI\n-----END PRIVATE KEY-----\n"
```

### Étape 3: Redémarrer le serveur

**IMPORTANT**: Après avoir modifié `.env.local`, vous DEVEZ redémarrer le serveur Next.js:

```bash
# Arrêter le serveur (Ctrl+C dans le terminal)
# Puis relancer
npm run dev
```

### Étape 4: Tester

1. Créez un nouveau compte
2. Vérifiez les logs du terminal - vous devriez voir:
   ```
   ✅ Firebase Admin chargé
   ✅ Document créé dans Firestore
   ✅ Vérification: Document existe bien dans Firestore
   ```

3. Vérifiez dans la console Firebase que le document apparaît dans `emailVerifications`

## 📝 Explication technique

### Pourquoi l'email était envoyé mais pas le document créé ?

L'API Route `/api/verification/send-code/route.ts` fait 2 choses:

1. **Sauvegarder le code dans Firestore** (via Firebase Admin SDK)
   - ❌ Échouait silencieusement car mauvais projet
   
2. **Envoyer l'email** (via Nodemailer)
   - ✅ Fonctionnait car Nodemailer n'a pas besoin de Firebase

### Pourquoi ça n'a pas généré d'erreur visible ?

Le code ne vérifiait pas si l'écriture Firestore réussissait vraiment. J'ai ajouté des logs détaillés pour diagnostiquer:

```typescript
// Sauvegarder dans Firestore
await adminDb.collection('emailVerifications').doc(userId).set(verificationData);
console.log("✅ Document créé dans Firestore");

// Vérifier que le document existe vraiment
const savedDoc = await adminDb.collection('emailVerifications').doc(userId).get();
if (savedDoc.exists) {
  console.log("✅ Vérification: Document existe bien");
} else {
  console.error("❌ Le document n'a pas été créé!");
}
```

## 🎯 Prochaines étapes

Une fois les bonnes credentials configurées:

1. ✅ Le document sera créé dans Firestore
2. ✅ La vérification du code fonctionnera
3. ✅ Le statut du compte sera mis à jour correctement
4. 🚀 Phase 2: Vérification téléphone par SMS

## 📚 Documentation complète

Voir `FIREBASE_ADMIN_SETUP.md` pour les instructions détaillées.
