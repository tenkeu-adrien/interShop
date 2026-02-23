# Système de Gestion du Code PIN - Documentation Complète

## Vue d'ensemble

Le système de code PIN permet aux utilisateurs de sécuriser leur portefeuille avec un code à 4-6 chiffres. Il inclut la création, la modification et la récupération du PIN par email.

## Fonctionnalités Implémentées

### 1. Création du Code PIN

#### Page: `/wallet/settings`

**Processus:**
1. Utilisateur accède aux paramètres du portefeuille
2. Entre un nouveau code PIN (4-6 chiffres)
3. Confirme le code PIN
4. Le code est hashé avec bcrypt et sauvegardé

**Validation:**
- ✅ 4 à 6 chiffres uniquement
- ✅ Chiffres seulement (pas de lettres)
- ✅ Confirmation doit correspondre
- ✅ Indicateur visuel de force du PIN

### 2. Modification du Code PIN

**Processus:**
1. Si PIN existe déjà, demander l'ancien PIN
2. OU utiliser "PIN oublié" pour réinitialiser
3. Entre le nouveau PIN
4. Confirme le nouveau PIN
5. Le code est mis à jour

### 3. Récupération du PIN (PIN Oublié)

#### Étape 1: Demande de Code
**API:** `POST /api/wallet/pin/send-reset-code`

**Processus:**
1. Utilisateur clique sur "PIN oublié?"
2. Modal s'ouvre avec confirmation de l'email
3. Clic sur "Envoyer le code"
4. Code à 6 chiffres généré
5. Code sauvegardé dans Firestore (`pinResetCodes`)
6. Email envoyé avec template InterAppshop

**Données sauvegardées:**
```typescript
{
  code: string,           // Code à 6 chiffres
  email: string,          // Email de l'utilisateur
  userId: string,         // ID de l'utilisateur
  createdAt: number,      // Timestamp de création
  expiresAt: number,      // Expire dans 10 minutes
  attempts: number,       // Nombre de tentatives (max 3)
  used: boolean,          // Si le code a été utilisé
  type: 'pin_reset'       // Type de code
}
```

#### Étape 2: Vérification du Code
**API:** `POST /api/wallet/pin/verify-reset-code`

**Processus:**
1. Utilisateur entre le code reçu par email
2. Vérification du code:
   - ✅ Code existe
   - ✅ Code non expiré (< 10 minutes)
   - ✅ Code non utilisé
   - ✅ Moins de 3 tentatives
   - ✅ Code correspond
3. Si valide, marquer comme utilisé
4. Permettre la création d'un nouveau PIN

**Sécurité:**
- Maximum 3 tentatives
- Expiration après 10 minutes
- Code à usage unique
- Suppression après expiration ou 3 échecs

#### Étape 3: Nouveau PIN
1. Après vérification du code
2. Formulaire de nouveau PIN activé
3. Pas besoin de l'ancien PIN
4. Création du nouveau PIN

### 4. Template Email InterAppshop

**Couleurs:**
- Header: Gradient jaune-vert (`#fbbf24` → `#10b981` → `#fbbf24`)
- Fond: Jaune clair (`#fffbeb`)
- Code: Vert (`#10b981`)
- Texte: Gris foncé (`#111827`)

**Structure:**
```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Styles inline avec couleurs InterAppshop -->
  </head>
  <body>
    <div class="header">
      🔐 Réinitialisation de votre code PIN
    </div>
    <div class="content">
      <p>Bonjour <strong>{name}</strong>,</p>
      
      <div class="code-box">
        <div class="code">{code}</div>
      </div>
      
      <div class="warning">
        ⏰ Ce code expire dans 10 minutes
      </div>
      
      <div class="security-tip">
        🔒 Si vous n'avez pas demandé cette réinitialisation...
      </div>
      
      <p>Conseils pour votre nouveau code PIN...</p>
    </div>
    <div class="footer">
      InterAppshop - Votre marketplace de confiance
    </div>
  </body>
</html>
```

### 5. Sécurité du PIN

#### Hashage
```typescript
import bcrypt from 'bcryptjs';

// Création
const hashedPIN = await bcrypt.hash(pin, 10);

// Vérification
const isValid = await bcrypt.compare(pin, wallet.pin);
```

#### Protection contre les Tentatives
```typescript
// Dans wallet.ts
if (wallet.pinAttempts >= 3) {
  const lastAttempt = wallet.lastPinAttempt?.getTime() || 0;
  const now = Date.now();
  
  // Bloquer pendant 30 minutes
  if (now - lastAttempt < 30 * 60 * 1000) {
    const remainingMinutes = Math.ceil(
      (30 * 60 * 1000 - (now - lastAttempt)) / 60000
    );
    throw new Error(
      `Trop de tentatives. Réessayez dans ${remainingMinutes} minutes.`
    );
  }
}
```

### 6. Flux Utilisateur Complet

#### Scénario 1: Première Configuration du PIN
```
1. Utilisateur va dans /wallet/settings
   ↓
2. Voit "Aucun code PIN configuré"
   ↓
3. Entre un nouveau PIN (4-6 chiffres)
   ↓
4. Confirme le PIN
   ↓
5. Clic sur "Définir le code PIN"
   ↓
6. PIN hashé et sauvegardé
   ↓
7. Message de succès
```

#### Scénario 2: Modification du PIN (avec ancien PIN)
```
1. Utilisateur va dans /wallet/settings
   ↓
2. Voit "Code PIN configuré"
   ↓
3. Entre l'ancien PIN
   ↓
4. Entre le nouveau PIN
   ↓
5. Confirme le nouveau PIN
   ↓
6. Clic sur "Modifier le code PIN"
   ↓
7. Vérification de l'ancien PIN
   ↓
8. Nouveau PIN sauvegardé
   ↓
9. Message de succès
```

#### Scénario 3: PIN Oublié
```
1. Utilisateur va dans /wallet/settings
   ↓
2. Clic sur "PIN oublié?"
   ↓
3. Modal s'ouvre
   ↓
4. Confirmation de l'email affiché
   ↓
5. Clic sur "Envoyer le code"
   ↓
6. Code généré et envoyé par email
   ↓
7. Utilisateur reçoit l'email
   ↓
8. Entre le code à 6 chiffres
   ↓
9. Clic sur "Vérifier"
   ↓
10. Code vérifié
   ↓
11. Modal se ferme
   ↓
12. Message "Code vérifié! Vous pouvez définir un nouveau PIN"
   ↓
13. Formulaire de nouveau PIN activé (sans ancien PIN)
   ↓
14. Entre et confirme le nouveau PIN
   ↓
15. Clic sur "Définir le code PIN"
   ↓
16. Nouveau PIN sauvegardé
   ↓
17. Message de succès
```

### 7. API Endpoints

#### POST `/api/wallet/pin/send-reset-code`

**Request:**
```json
{
  "userId": "string",
  "email": "string",
  "displayName": "string"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Code de réinitialisation envoyé par email",
  "expiresIn": 600,
  "code": "123456" // Seulement en dev
}
```

**Response Error:**
```json
{
  "error": "Message d'erreur"
}
```

#### POST `/api/wallet/pin/verify-reset-code`

**Request:**
```json
{
  "userId": "string",
  "code": "string"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Code vérifié avec succès"
}
```

**Response Error:**
```json
{
  "error": "Code incorrect",
  "attemptsLeft": 2
}
```

### 8. Collections Firestore

#### Collection: `wallets`
```typescript
{
  id: string,              // = userId
  userId: string,
  balance: number,
  pin: string,             // Hashé avec bcrypt
  pinAttempts: number,     // Tentatives de PIN
  lastPinAttempt: Date,    // Dernière tentative
  // ... autres champs
}
```

#### Collection: `pinResetCodes`
```typescript
{
  id: string,              // = userId
  code: string,            // Code à 6 chiffres
  email: string,
  userId: string,
  createdAt: number,
  expiresAt: number,       // +10 minutes
  attempts: number,        // Max 3
  used: boolean,
  usedAt?: number,
  type: 'pin_reset'
}
```

### 9. Variables d'Environnement Requises

```env
# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

### 10. Gestion des Erreurs

#### Erreurs Possibles

**Création/Modification du PIN:**
- ❌ PIN trop court (< 4 chiffres)
- ❌ PIN trop long (> 6 chiffres)
- ❌ PIN contient des lettres
- ❌ Confirmation ne correspond pas
- ❌ Ancien PIN incorrect (si modification)
- ❌ Trop de tentatives (blocage 30 min)

**Réinitialisation du PIN:**
- ❌ Email non configuré
- ❌ Firebase Admin non disponible
- ❌ Portefeuille non trouvé
- ❌ Code expiré (> 10 minutes)
- ❌ Code déjà utilisé
- ❌ Trop de tentatives (> 3)
- ❌ Code incorrect

### 11. Messages Utilisateur

#### Succès
- ✅ "Code PIN configuré avec succès!"
- ✅ "Code PIN modifié avec succès!"
- ✅ "Code envoyé par email!"
- ✅ "Code vérifié! Vous pouvez maintenant définir un nouveau PIN."

#### Erreurs
- ❌ "Le code PIN doit contenir entre 4 et 6 chiffres"
- ❌ "Le code PIN ne doit contenir que des chiffres"
- ❌ "Les codes PIN ne correspondent pas"
- ❌ "Veuillez entrer votre code PIN actuel ou utiliser 'PIN oublié'"
- ❌ "PIN incorrect"
- ❌ "Trop de tentatives. Réessayez dans X minutes."
- ❌ "Code non trouvé ou expiré"
- ❌ "Code expiré. Demandez un nouveau code."
- ❌ "Code déjà utilisé"
- ❌ "Code incorrect" (avec tentatives restantes)

### 12. Interface Utilisateur

#### Composants
- **Input PIN** - Masqué par défaut avec toggle
- **Indicateur de force** - Barre de progression colorée
- **Modal de réinitialisation** - Framer Motion animations
- **Bouton "PIN oublié?"** - Visible seulement si PIN existe

#### Couleurs (InterAppshop)
- Gradient header: `from-yellow-400 via-green-400 to-yellow-500`
- Fond: `from-yellow-50 via-green-50 to-yellow-50`
- Boutons primaires: `bg-green-600 hover:bg-green-700`
- Boutons secondaires: `bg-yellow-600 hover:bg-yellow-700`
- Succès: `bg-green-50 border-green-200 text-green-800`
- Erreur: `bg-red-50 border-red-200 text-red-800`
- Avertissement: `bg-yellow-50 border-yellow-200 text-yellow-800`

### 13. Tests Recommandés

#### Tests Manuels
- ✅ Créer un PIN pour la première fois
- ✅ Modifier un PIN existant avec l'ancien PIN
- ✅ Tenter de modifier sans l'ancien PIN
- ✅ Utiliser "PIN oublié" et recevoir l'email
- ✅ Vérifier le code reçu par email
- ✅ Créer un nouveau PIN après vérification
- ✅ Tester l'expiration du code (10 minutes)
- ✅ Tester les 3 tentatives maximum
- ✅ Tester le blocage après 3 tentatives
- ✅ Vérifier le hashage du PIN dans Firestore

#### Tests Automatisés (À Implémenter)
```typescript
describe('PIN System', () => {
  describe('PIN Creation', () => {
    it('should create PIN with 4 digits', async () => {});
    it('should create PIN with 6 digits', async () => {});
    it('should reject PIN with letters', () => {});
    it('should reject PIN < 4 digits', () => {});
    it('should reject PIN > 6 digits', () => {});
    it('should hash PIN with bcrypt', async () => {});
  });

  describe('PIN Reset', () => {
    it('should send reset code by email', async () => {});
    it('should verify valid code', async () => {});
    it('should reject expired code', async () => {});
    it('should reject used code', async () => {});
    it('should block after 3 attempts', async () => {});
  });
});
```

### 14. Améliorations Futures

#### Fonctionnalités
1. **Biométrie** - Empreinte digitale / Face ID
2. **PIN à 6 chiffres obligatoire** - Plus sécurisé
3. **Historique des changements** - Log des modifications
4. **Notification par SMS** - En plus de l'email
5. **Questions de sécurité** - Alternative à l'email
6. **2FA obligatoire** - Pour montants élevés
7. **PIN temporaire** - Pour urgences
8. **Délégation de compte** - PIN secondaire

#### Sécurité
1. **Rate limiting** - Limiter les demandes de code
2. **IP tracking** - Détecter les tentatives suspectes
3. **Device fingerprinting** - Reconnaître les appareils
4. **Géolocalisation** - Alertes si changement de pays
5. **Analyse comportementale** - Détecter les anomalies

### 15. Documentation Développeur

#### Utilisation du PIN dans le Code

```typescript
// Vérifier le PIN avant une action
import { verifyPIN } from '@/lib/firebase/wallet';

try {
  await verifyPIN(userId, pin);
  // PIN valide, continuer l'action
} catch (error) {
  // PIN invalide ou trop de tentatives
  console.error(error.message);
}
```

```typescript
// Définir/Modifier le PIN
import { setPIN } from '@/lib/firebase/wallet';

try {
  await setPIN(userId, newPin);
  // PIN sauvegardé avec succès
} catch (error) {
  // Erreur lors de la sauvegarde
  console.error(error.message);
}
```

## Conclusion

Le système de gestion du code PIN est maintenant complet avec:
- ✅ Création et modification du PIN
- ✅ Récupération par email avec code de vérification
- ✅ Template email aux couleurs InterAppshop
- ✅ Sécurité renforcée (hashage, tentatives limitées, expiration)
- ✅ Interface utilisateur intuitive
- ✅ Gestion complète des erreurs
- ✅ Code couleur cohérent avec le header

Le système est prêt pour la production et offre une expérience utilisateur fluide et sécurisée.
