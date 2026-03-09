# Correction - Page Forgot Password

## Problème identifié

**Erreur** : "userId et email requis"

### Cause du problème

L'API `/api/verification/send-code` attendait 3 paramètres :
- `userId` (requis)
- `email` (requis)
- `displayName` (optionnel)

Mais la page `forgot-password` n'envoyait que :
- `email`
- `type: 'password_reset'`

Le problème était que pour envoyer un code de vérification, il faut d'abord connaître l'ID de l'utilisateur, mais dans le flux "mot de passe oublié", on ne connaît que l'email.

## Solutions apportées

### 1. Création de l'API `/api/auth/find-user`

**Fichier** : `app/api/auth/find-user/route.ts`

Cette nouvelle API permet de chercher un utilisateur par son email et retourne :
- `userId` : L'ID Firebase de l'utilisateur
- `email` : L'email de l'utilisateur
- `displayName` : Le nom d'affichage

**Utilisation** :
```typescript
GET /api/auth/find-user?email=user@example.com
```

**Réponse** :
```json
{
  "userId": "abc123",
  "email": "user@example.com",
  "displayName": "John Doe"
}
```

### 2. Création de l'API `/api/verification/verify-code`

**Fichier** : `app/api/verification/verify-code/route.ts`

Cette API vérifie le code de vérification et :
- Vérifie que le code n'a pas expiré
- Vérifie que le code n'a pas déjà été utilisé
- Vérifie que le code correspond
- Limite les tentatives à 5 maximum
- Si `type === 'password_reset'`, crée un document dans `passwordResets` pour permettre la réinitialisation

**Utilisation** :
```typescript
POST /api/verification/verify-code
{
  "userId": "abc123",
  "code": "123456",
  "type": "password_reset"
}
```

### 3. Mise à jour de la page forgot-password

**Fichier** : `app/[locale]/forgot-password/page.tsx`

#### Changements dans `handleEmailSubmit` :

**Avant** :
```typescript
// Envoyait directement à send-code sans userId
const response = await fetch('/api/verification/send-code', {
  body: JSON.stringify({ 
    email,
    type: 'password_reset'
  })
});
```

**Après** :
```typescript
// 1. Cherche d'abord l'utilisateur par email
const searchResponse = await fetch(`/api/auth/find-user?email=${email}`);
const searchData = await searchResponse.json();

// 2. Puis envoie le code avec userId
const response = await fetch('/api/verification/send-code', {
  body: JSON.stringify({ 
    userId: searchData.userId,
    email: email,
    displayName: searchData.displayName
  })
});
```

#### Changements dans `handlePasswordSubmit` :

**Avant** :
```typescript
// N'envoyait pas le code
body: JSON.stringify({ 
  userId,
  newPassword
})
```

**Après** :
```typescript
// Envoie le code pour vérification
const verificationCode = code.join('');
body: JSON.stringify({ 
  userId,
  code: verificationCode,
  newPassword
})
```

## Flux complet de réinitialisation

### Étape 1 : Demande de code
1. Utilisateur entre son email
2. Frontend appelle `/api/auth/find-user?email=...`
3. API retourne `userId` et `displayName`
4. Frontend appelle `/api/verification/send-code` avec `userId`, `email`, `displayName`
5. API génère un code et l'envoie par email
6. Code sauvegardé dans Firestore `emailVerifications/{userId}`

### Étape 2 : Vérification du code
1. Utilisateur entre le code à 6 chiffres
2. Frontend appelle `/api/verification/verify-code` avec `userId`, `code`, `type: 'password_reset'`
3. API vérifie le code dans `emailVerifications/{userId}`
4. Si valide, crée un document dans `passwordResets/{userId}` avec le code
5. Marque le code comme vérifié

### Étape 3 : Nouveau mot de passe
1. Utilisateur entre son nouveau mot de passe
2. Frontend appelle `/api/auth/reset-password` avec `userId`, `code`, `newPassword`
3. API vérifie le code dans `passwordResets/{userId}`
4. Si valide, met à jour le mot de passe Firebase
5. Marque le code comme utilisé

## Collections Firestore utilisées

### `emailVerifications/{userId}`
```typescript
{
  code: string,           // Code à 6 chiffres
  email: string,          // Email de l'utilisateur
  userId: string,         // ID Firebase
  createdAt: number,      // Timestamp de création
  expiresAt: number,      // Timestamp d'expiration (4 minutes)
  attempts: number,       // Nombre de tentatives
  verified: boolean,      // Si le code a été vérifié
  verifiedAt?: number     // Timestamp de vérification
}
```

### `passwordResets/{userId}`
```typescript
{
  code: string,           // Code vérifié
  email: string,          // Email de l'utilisateur
  createdAt: number,      // Timestamp de création
  expiresAt: number,      // Timestamp d'expiration (10 minutes)
  attempts: number,       // Nombre de tentatives
  used: boolean,          // Si le code a été utilisé
  usedAt?: number         // Timestamp d'utilisation
}
```

## Sécurité

### Limitations mises en place :
1. **Expiration des codes** :
   - Code de vérification : 4 minutes
   - Code de réinitialisation : 10 minutes

2. **Limitation des tentatives** :
   - Maximum 5 tentatives par code
   - Après 5 tentatives, le code est supprimé

3. **Usage unique** :
   - Chaque code ne peut être utilisé qu'une seule fois
   - Marqué comme `used` après utilisation

4. **Validation** :
   - Vérification de l'expiration
   - Vérification de l'usage
   - Vérification du nombre de tentatives

## Tests recommandés

1. **Test du flux complet** :
   - Entrer un email existant
   - Recevoir le code par email
   - Entrer le code
   - Changer le mot de passe
   - Se connecter avec le nouveau mot de passe

2. **Test des erreurs** :
   - Email inexistant
   - Code expiré
   - Code incorrect
   - Trop de tentatives
   - Mots de passe non correspondants

3. **Test de sécurité** :
   - Vérifier que le code expire après 4 minutes
   - Vérifier qu'on ne peut pas utiliser un code deux fois
   - Vérifier la limitation à 5 tentatives
