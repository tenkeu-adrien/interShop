# Correction - User Not Found (Reset Password)

## 🐛 Problème identifié

**Erreur** : `There is no user record corresponding to the provided identifier`

**Cause** : Le `userId` retourné par l'API `find-user` ne correspond à aucun utilisateur dans Firebase Auth.

### Scénarios possibles

1. **L'utilisateur existe dans Firestore mais pas dans Firebase Auth**
   - Peut arriver si la création a échoué partiellement
   - Ou si l'utilisateur a été supprimé de Firebase Auth mais pas de Firestore

2. **L'ID retourné n'est pas le bon**
   - Le document Firestore a un ID différent de l'UID Firebase Auth

3. **L'utilisateur a été supprimé de Firebase Auth**
   - Mais existe toujours dans Firestore

## ✅ Solution apportée

### Modification de l'API `find-user`

L'API utilise maintenant **deux méthodes** pour trouver l'utilisateur :

#### Méthode 1 (Prioritaire) : Firebase Auth
```typescript
const userRecord = await adminAuth.getUserByEmail(email);
// Retourne l'UID Firebase Auth (le vrai identifiant)
```

**Avantages** :
- ✅ Retourne toujours l'UID correct
- ✅ Garantit que l'utilisateur existe dans Firebase Auth
- ✅ Peut réinitialiser le mot de passe

#### Méthode 2 (Fallback) : Firestore
```typescript
const usersSnapshot = await adminDb
  .collection('users')
  .where('email', '==', email)
  .get();
```

**Utilisé si** :
- L'utilisateur n'existe pas dans Firebase Auth
- Permet de détecter les incohérences

### Logs détaillés ajoutés

```
🔍 API /api/auth/find-user appelée
📧 Recherche de l'utilisateur avec email: xxx@xxx.com
✅ Utilisateur trouvé dans Firebase Auth
   - UID: BTaNXCGCk6U4jiSS2wOypT8GEq42
   - Email: xxx@xxx.com
   - DisplayName: John Doe
✅ Utilisateur trouvé aussi dans Firestore
```

Ou en cas de problème :
```
❌ Utilisateur non trouvé dans Firebase Auth: auth/user-not-found
🔄 Tentative de recherche dans Firestore...
⚠️ Utilisateur trouvé dans Firestore mais pas dans Auth
   - Document ID: xxx
   - Email: xxx@xxx.com
```

## 🔄 Actions à effectuer

### 1. Redémarrer le serveur

```bash
npm run dev
```

### 2. Tester avec votre email

1. Allez sur `/forgot-password`
2. Entrez votre email : `devagencyweb@gmail.com`
3. Regardez les logs du serveur

**Logs attendus** :
```
🔍 API /api/auth/find-user appelée
📧 Recherche de l'utilisateur avec email: devagencyweb@gmail.com
✅ Utilisateur trouvé dans Firebase Auth
   - UID: [votre_uid]
```

### 3. Si l'utilisateur n'existe pas dans Firebase Auth

**Symptôme** :
```
❌ Utilisateur non trouvé dans Firebase Auth: auth/user-not-found
⚠️ Utilisateur trouvé dans Firestore mais pas dans Auth
```

**Solution** : Vous devez recréer le compte

#### Option A : Supprimer et recréer le compte

1. Supprimez le document Firestore :
   - Allez dans Firebase Console → Firestore
   - Collection `users`
   - Trouvez et supprimez le document avec votre email

2. Réinscrivez-vous sur `/register`

#### Option B : Créer l'utilisateur dans Firebase Auth manuellement

1. Allez dans Firebase Console → Authentication
2. Cliquez sur "Add user"
3. Entrez votre email et un mot de passe temporaire
4. Copiez l'UID généré
5. Mettez à jour le document Firestore avec ce nouvel UID

## 🔍 Diagnostic

Pour vérifier l'état de votre compte :

### 1. Vérifier Firebase Auth

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet `interappshop`
3. Allez dans "Authentication" → "Users"
4. Cherchez `devagencyweb@gmail.com`

**Si l'utilisateur existe** :
- Notez l'UID (ex: `BTaNXCGCk6U4jiSS2wOypT8GEq42`)

**Si l'utilisateur n'existe pas** :
- C'est le problème ! L'utilisateur doit être recréé

### 2. Vérifier Firestore

1. Allez dans "Firestore Database"
2. Collection `users`
3. Cherchez un document avec `email: devagencyweb@gmail.com`

**Si le document existe** :
- Notez l'ID du document
- Vérifiez qu'il correspond à l'UID Firebase Auth

**Si les IDs ne correspondent pas** :
- C'est le problème ! Il faut les synchroniser

## 🛠️ Script de vérification

Créez un fichier `scripts/checkUser.ts` :

```typescript
import { adminAuth, adminDb } from '@/lib/firebase-admin';

async function checkUser(email: string) {
  console.log('🔍 Vérification de l\'utilisateur:', email);
  
  // Vérifier Firebase Auth
  try {
    const authUser = await adminAuth.getUserByEmail(email);
    console.log('✅ Firebase Auth:');
    console.log('   - UID:', authUser.uid);
    console.log('   - Email:', authUser.email);
    console.log('   - DisplayName:', authUser.displayName);
  } catch (error: any) {
    console.log('❌ Firebase Auth:', error.code);
  }
  
  // Vérifier Firestore
  const snapshot = await adminDb
    .collection('users')
    .where('email', '==', email)
    .get();
  
  if (snapshot.empty) {
    console.log('❌ Firestore: Aucun document trouvé');
  } else {
    snapshot.forEach(doc => {
      console.log('✅ Firestore:');
      console.log('   - Document ID:', doc.id);
      console.log('   - Email:', doc.data().email);
      console.log('   - DisplayName:', doc.data().displayName);
    });
  }
}

checkUser('devagencyweb@gmail.com');
```

Exécutez :
```bash
npx ts-node scripts/checkUser.ts
```

## ✅ Checklist de résolution

- [ ] Serveur redémarré
- [ ] Logs montrent "✅ Utilisateur trouvé dans Firebase Auth"
- [ ] L'UID retourné existe dans Firebase Auth
- [ ] Le document Firestore a le même ID que l'UID
- [ ] Le reset password fonctionne

## 🎯 Résumé

**Problème** : L'utilisateur existe dans Firestore mais pas dans Firebase Auth (ou avec un ID différent)

**Solution** : L'API `find-user` utilise maintenant Firebase Auth en priorité pour garantir que l'UID retourné existe

**Prochaine étape** : Vérifiez les logs pour voir si votre utilisateur existe dans Firebase Auth
