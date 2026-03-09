# Tests et Validation - Processus de Développement

## Problème identifié

Vous avez raison de souligner que je dois tester mon code avant de le soumettre. L'erreur 503 était causée par :

1. **Export manquant** : `lib/firebase-admin.ts` exportait `auth` au lieu de `adminAuth`
2. **Import silencieux** : L'erreur d'import n'était pas visible dans les logs

## Corrections apportées

### 1. Ajout de `adminAuth` dans firebase-admin.ts

```typescript
export const adminAuth = admin.auth(); // Ajouté
export const auth = admin.auth(); // Gardé pour compatibilité
```

### 2. Logs détaillés dans reset-password

Maintenant, l'API affiche :
- État de Firebase Admin au démarrage
- Variables d'environnement présentes
- Détails de chaque étape du processus
- Erreurs détaillées avec stack trace

## Tests à effectuer après redémarrage

### Test 1 : Vérifier les logs au démarrage

Après `npm run dev`, vous devriez voir :
```
🔧 Initialisation de Firebase Admin...
   - FIREBASE_PROJECT_ID: true
   - FIREBASE_CLIENT_EMAIL: true
   - FIREBASE_PRIVATE_KEY: true
✅ Firebase Admin initialisé avec succès
```

### Test 2 : Flux complet de réinitialisation

1. **Demander un code** :
   - Allez sur `/forgot-password`
   - Entrez votre email
   - Vérifiez les logs :
     ```
     ✅ Firebase Admin chargé
     📧 Envoi code pour: votre@email.com
     🔑 Code généré: 123456
     ✅ Document créé dans Firestore
     ```

2. **Entrer le code** :
   - Entrez le code reçu par email (ou visible dans les logs)
   - Vérifiez les logs :
     ```
     🔍 Vérification du code pour userId: xxx
     ✅ Code vérifié avec succès
     ```

3. **Changer le mot de passe** :
   - Entrez un nouveau mot de passe
   - Vérifiez les logs :
     ```
     🔐 API /api/auth/reset-password appelée
        Firebase Admin disponible: true
        adminAuth: true
        adminDb: true
     📝 Données reçues:
        - userId: xxx
        - code: 123456
        - newPassword: ***
     🔍 Vérification du code pour userId: xxx
     📄 Document passwordResets trouvé
     ✅ Code valide, mise à jour du mot de passe...
     ✅ Mot de passe mis à jour dans Firebase Auth
     ✅ Mot de passe réinitialisé avec succès
     ```

### Test 3 : Tester les erreurs

1. **Code expiré** :
   - Attendez 10 minutes après avoir reçu le code
   - Essayez de l'utiliser
   - Devrait afficher : "Code expiré"

2. **Code incorrect** :
   - Entrez un mauvais code
   - Devrait afficher : "Code incorrect"

3. **Code déjà utilisé** :
   - Utilisez le même code deux fois
   - Devrait afficher : "Ce code a déjà été utilisé"

## Checklist de validation

Avant de dire que c'est corrigé, vérifier :

- [ ] Le serveur démarre sans erreur
- [ ] Les logs montrent "✅ Firebase Admin initialisé avec succès"
- [ ] L'email est reçu avec le code
- [ ] Le code peut être vérifié
- [ ] Le mot de passe peut être changé
- [ ] La connexion fonctionne avec le nouveau mot de passe
- [ ] Les erreurs sont gérées correctement

## Mode Debug permanent

En développement, le code est toujours affiché dans :

1. **Logs serveur** :
   ```
   🔑 Code généré: 123456
   ```

2. **Console navigateur** (F12) :
   ```javascript
   console.log('🔑 CODE DE VÉRIFICATION (DEV):', '123456');
   ```

3. **Toast sur la page** :
   ```
   Code (DEV): 123456
   ```

Cela permet de tester sans dépendre de l'email !

## Prochaines étapes

1. **Redémarrez le serveur** : `npm run dev`
2. **Vérifiez les logs** au démarrage
3. **Testez le flux complet** de réinitialisation
4. **Vérifiez que vous pouvez vous connecter** avec le nouveau mot de passe

## Si ça ne fonctionne toujours pas

Envoyez-moi les logs complets du serveur, en particulier :
- Les logs au démarrage
- Les logs lors de l'appel à `/api/auth/reset-password`

Je pourrai alors identifier le problème exact.
