# Système de Vérification de Compte - Architecture Technique

## Vue d'ensemble

Ce document décrit l'architecture technique du système de vérification multi-niveaux pour la plateforme.

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX DE VÉRIFICATION                      │
└─────────────────────────────────────────────────────────────┘

CLIENT:
Inscription → Vérification Email → Compte Actif ✓

FOURNISSEUR/MARKETISTE:
Inscription → Vérification Email → Vérification Téléphone → 
Validation Admin → Compte Actif ✓
```

## Composants Principaux

### 1. Extension du Modèle User

**Fichier**: `types/index.ts`

Nouveaux champs à ajouter à l'interface `User`:

```typescript
// Statut du compte
accountStatus: 'email_unverified' | 'phone_unverified' | 'pending_admin_approval' | 'active' | 'rejected' | 'suspended';

// Vérification Email
emailVerified: boolean;
emailVerificationCode?: string;
emailVerificationExpiry?: Date;
emailVerificationAttempts: number;

// Vérification Téléphone
phoneNumber?: string;
phoneVerified: boolean;
phoneVerificationAttempts: number;

// Validation Admin
adminApproval?: {
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
};

// Historique
verificationHistory: Array<{
  type: 'email' | 'phone' | 'admin_approval';
  status: 'success' | 'failed';
  timestamp: Date;
  details?: string;
}>;
```

### 2. Collections Firestore

#### Collection: `emailVerifications`
```typescript
{
  id: string;
  userId: string;
  email: string;
  code: string; // 6 chiffres
  createdAt: Timestamp;
  expiresAt: Timestamp; // +4 minutes
  attempts: number;
  verified: boolean;
  verifiedAt?: Timestamp;
}
```

#### Collection: `phoneVerifications`
```typescript
{
  id: string;
  userId: string;
  phoneNumber: string;
  verificationId: string; // Firebase Auth
  createdAt: Timestamp;
  expiresAt: Timestamp; // +2 minutes
  attempts: number;
  verified: boolean;
  verifiedAt?: Timestamp;
}
```

#### Collection: `adminApprovalQueue`
```typescript
{
  id: string;
  userId: string;
  userRole: 'fournisseur' | 'marketiste';
  userName: string;
  userEmail: string;
  userPhone: string;
  requestedAt: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
  notes?: string;
}
```

### 3. Services Firebase

#### Service: `lib/firebase/verification.ts`

Fonctions principales:

```typescript
// Vérification Email
generateEmailVerificationCode(userId: string, email: string): Promise<string>
verifyEmailCode(userId: string, code: string): Promise<boolean>
resendEmailVerificationCode(userId: string): Promise<void>

// Vérification Téléphone
sendPhoneVerificationCode(userId: string, phoneNumber: string): Promise<string>
verifyPhoneCode(userId: string, code: string): Promise<boolean>
resendPhoneVerificationCode(userId: string): Promise<void>

// Validation Admin
submitForAdminApproval(userId: string): Promise<void>
approveUser(userId: string, adminId: string): Promise<void>
rejectUser(userId: string, adminId: string, reason: string): Promise<void>
getApprovalQueue(role?: 'fournisseur' | 'marketiste'): Promise<AdminApprovalRequest[]>

// Utilitaires
updateAccountStatus(userId: string, status: AccountStatus): Promise<void>
addVerificationHistory(userId: string, entry: VerificationHistoryEntry): Promise<void>
```

### 4. Service Email

#### Service: `lib/services/emailService.ts`

Options d'implémentation:

**Option A: Nodemailer (Simple, gratuit)**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

**Option B: SendGrid (Professionnel, payant)**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

Fonctions:

```typescript
sendVerificationEmail(email: string, code: string, name: string): Promise<void>
sendWelcomeEmail(email: string, name: string): Promise<void>
sendApprovalEmail(email: string, name: string, approved: boolean, reason?: string): Promise<void>
```

### 5. Composants React

#### Composant: `components/auth/EmailVerification.tsx`

Interface de vérification email:
- Input pour le code à 6 chiffres
- Bouton "Vérifier"
- Bouton "Renvoyer le code" (avec timer)
- Affichage du temps restant
- Messages d'erreur/succès

#### Composant: `components/auth/PhoneVerification.tsx`

Interface de vérification téléphone:
- Input pour le numéro (format international)
- Bouton "Envoyer le code"
- Input pour le code OTP
- Bouton "Vérifier"
- Bouton "Renvoyer le code" (avec timer)
- Messages d'erreur/succès

#### Composant: `components/auth/AccountStatusBanner.tsx`

Bannière d'information selon le statut:
- `email_unverified`: "Veuillez vérifier votre email"
- `phone_unverified`: "Veuillez vérifier votre téléphone"
- `pending_admin_approval`: "Votre compte est en attente de validation"
- `rejected`: "Votre compte a été rejeté"
- `suspended`: "Votre compte est suspendu"

#### Composant: `components/admin/ApprovalDashboard.tsx`

Dashboard admin pour gérer les validations:
- Liste des comptes en attente
- Filtres (fournisseur/marketiste)
- Détails utilisateur
- Boutons Approuver/Rejeter
- Champ raison de rejet
- Statistiques

### 6. Pages Next.js

#### Page: `app/verify-email/page.tsx`

Page de vérification email après inscription.

#### Page: `app/verify-phone/page.tsx`

Page de vérification téléphone (fournisseurs/marketistes).

#### Page: `app/pending-approval/page.tsx`

Page d'attente de validation admin.

#### Page: `app/dashboard/admin/approvals/page.tsx`

Dashboard admin pour gérer les validations.

### 7. Middleware de Protection

#### Fichier: `middleware.ts` (mise à jour)

Logique de redirection selon le statut:

```typescript
if (!user.emailVerified) {
  return NextResponse.redirect('/verify-email');
}

if (user.role !== 'client' && !user.phoneVerified) {
  return NextResponse.redirect('/verify-phone');
}

if (user.role !== 'client' && user.accountStatus === 'pending_admin_approval') {
  return NextResponse.redirect('/pending-approval');
}

if (user.accountStatus === 'rejected' || user.accountStatus === 'suspended') {
  return NextResponse.redirect('/account-blocked');
}
```

### 8. Store Zustand

#### Store: `store/verificationStore.ts`

État global pour la vérification:

```typescript
interface VerificationState {
  emailCode: string;
  phoneCode: string;
  emailTimer: number;
  phoneTimer: number;
  emailAttempts: number;
  phoneAttempts: number;
  
  setEmailCode: (code: string) => void;
  setPhoneCode: (code: string) => void;
  startEmailTimer: () => void;
  startPhoneTimer: () => void;
  incrementEmailAttempts: () => void;
  incrementPhoneAttempts: () => void;
  reset: () => void;
}
```

## Flux de Données

### 1. Inscription Client

```
1. Utilisateur remplit formulaire
2. registerUser() crée compte Firebase Auth
3. Création document Firestore avec accountStatus: 'email_unverified'
4. generateEmailVerificationCode() génère code
5. sendVerificationEmail() envoie email
6. Redirection vers /verify-email
7. Utilisateur entre le code
8. verifyEmailCode() valide
9. accountStatus → 'active'
10. Redirection vers /dashboard
```

### 2. Inscription Fournisseur/Marketiste

```
1-7. Même processus que client
8. verifyEmailCode() valide
9. accountStatus → 'phone_unverified'
10. Redirection vers /verify-phone
11. Utilisateur entre numéro téléphone
12. sendPhoneVerificationCode() via Firebase Auth
13. Utilisateur entre code OTP
14. verifyPhoneCode() valide
15. accountStatus → 'pending_admin_approval'
16. submitForAdminApproval() crée entrée dans adminApprovalQueue
17. Notification envoyée aux admins
18. Redirection vers /pending-approval
19. Admin approuve/rejette
20. accountStatus → 'active' ou 'rejected'
21. Email de notification envoyé
22. Si approuvé: accès complet au dashboard
```

## Sécurité

### Règles Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users
    match /users/{userId} {
      // Lecture: utilisateur lui-même ou admin
      allow read: if request.auth.uid == userId 
        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Mise à jour: utilisateur lui-même (champs limités)
      allow update: if request.auth.uid == userId
        && !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['role', 'accountStatus', 'adminApproval', 'emailVerified', 'phoneVerified']);
      
      // Mise à jour admin: seulement admins
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Email Verifications
    match /emailVerifications/{verificationId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Phone Verifications
    match /phoneVerifications/{verificationId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Admin Approval Queue
    match /adminApprovalQueue/{requestId} {
      allow read: if request.auth.uid == resource.data.userId
        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Rate Limiting

Implémenter dans les fonctions:

```typescript
// Maximum 3 tentatives par type de vérification
if (attempts >= 3) {
  throw new Error('Nombre maximum de tentatives atteint');
}

// Délai de 1 minute entre chaque demande de nouveau code
const lastRequest = await getLastVerificationRequest(userId);
if (lastRequest && Date.now() - lastRequest.timestamp < 60000) {
  throw new Error('Veuillez attendre 1 minute avant de redemander un code');
}

// Blocage automatique après 5 échecs
if (failedAttempts >= 5) {
  await updateAccountStatus(userId, 'suspended');
  throw new Error('Compte suspendu pour raisons de sécurité');
}
```

## Configuration Environnement

### Variables `.env.local`

```bash
# Email Service (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# OU SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Firebase (déjà configuré)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
```

### Firebase Console

1. Activer Phone Authentication
2. Configurer domaines autorisés
3. Configurer reCAPTCHA v3
4. Définir quotas SMS (limiter les coûts)

## Index Firestore

Créer dans `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "accountStatus", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "adminApprovalQueue",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "requestedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "adminApprovalQueue",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userRole", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "requestedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Tests

### Tests Unitaires

```typescript
// lib/firebase/verification.test.ts
describe('Email Verification', () => {
  test('génère un code à 6 chiffres', async () => {
    const code = await generateEmailVerificationCode(userId, email);
    expect(code).toMatch(/^\d{6}$/);
  });
  
  test('expire après 4 minutes', async () => {
    // ...
  });
  
  test('limite à 3 tentatives', async () => {
    // ...
  });
});
```

### Tests d'Intégration

```typescript
// app/verify-email/page.test.tsx
describe('Email Verification Page', () => {
  test('affiche le formulaire de vérification', () => {
    // ...
  });
  
  test('valide le code correct', async () => {
    // ...
  });
  
  test('affiche erreur pour code incorrect', async () => {
    // ...
  });
});
```

## Performance

### Optimisations

1. **Cache des vérifications en cours**: Utiliser Zustand pour éviter requêtes répétées
2. **Debounce sur les inputs**: Éviter validations inutiles
3. **Lazy loading**: Charger composants de vérification à la demande
4. **Index Firestore**: Optimiser les requêtes admin

### Monitoring

- Temps moyen de vérification email
- Taux de succès vérification téléphone
- Délai moyen validation admin
- Taux d'abandon par étape

## Migration

### Utilisateurs Existants

Script de migration pour ajouter les nouveaux champs:

```typescript
// scripts/migrateUsersVerification.ts
async function migrateUsers() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  for (const userDoc of usersSnapshot.docs) {
    const user = userDoc.data();
    
    await updateDoc(doc(db, 'users', userDoc.id), {
      accountStatus: user.role === 'client' ? 'active' : 'pending_admin_approval',
      emailVerified: true, // Considérer existants comme vérifiés
      emailVerificationAttempts: 0,
      phoneVerified: user.role === 'client' ? false : true,
      phoneVerificationAttempts: 0,
      verificationHistory: []
    });
  }
}
```

## Déploiement

### Checklist

- [ ] Mettre à jour types TypeScript
- [ ] Créer collections Firestore
- [ ] Déployer règles de sécurité
- [ ] Créer index Firestore
- [ ] Configurer service email
- [ ] Activer Phone Auth Firebase
- [ ] Tester en environnement staging
- [ ] Migrer utilisateurs existants
- [ ] Déployer en production
- [ ] Monitorer les métriques

## Support et Maintenance

### Documentation Utilisateur

Créer guides:
- Comment vérifier son email
- Comment vérifier son téléphone
- Que faire si le code n'arrive pas
- Combien de temps prend la validation admin

### FAQ

- Pourquoi je ne reçois pas le code email?
- Le code SMS n'arrive pas, que faire?
- Combien de temps pour la validation admin?
- Mon compte a été rejeté, puis-je réessayer?

