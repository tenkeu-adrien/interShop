# Système de Vérification de Compte - Requirements

## Vue d'ensemble

Implémenter un système de vérification multi-niveaux pour tous les types d'utilisateurs avec des exigences spécifiques selon le rôle.

## User Stories

### US-1: Vérification Email pour Tous les Utilisateurs
**En tant qu'** utilisateur (client, fournisseur, marketiste)  
**Je veux** recevoir un code de vérification par email lors de l'inscription  
**Afin de** prouver que mon adresse email est valide

**Critères d'acceptation:**
- 1.1 Un code à 6 chiffres est généré lors de l'inscription
- 1.2 Le code est envoyé par email à l'adresse fournie
- 1.3 Le code expire après 4 minutes
- 1.4 L'utilisateur peut demander un nouveau code (max 3 fois)
- 1.5 Le compte reste en statut "email_unverified" jusqu'à validation
- 1.6 L'utilisateur ne peut pas accéder à son dashboard sans vérification email

### US-2: Vérification Téléphone pour Fournisseurs et Marketistes
**En tant que** fournisseur ou marketiste  
**Je veux** vérifier mon numéro de téléphone via SMS OTP  
**Afin de** prouver mon identité et sécuriser mon compte professionnel

**Critères d'acceptation:**
- 2.1 Après vérification email, un code OTP est envoyé par SMS (Firebase Auth)
- 2.2 Le code OTP est à 6 chiffres
- 2.3 Le code expire après 2 minutes
- 2.4 L'utilisateur peut demander un nouveau code (max 3 fois)
- 2.5 Le compte reste en statut "phone_unverified" jusqu'à validation
- 2.6 Le numéro de téléphone doit être au format international (+XXX)

### US-3: Validation Admin pour Fournisseurs
**En tant que** fournisseur  
**Je dois** attendre la validation de mon compte par un administrateur  
**Afin de** pouvoir ajouter des produits et accéder aux fonctionnalités complètes

**Critères d'acceptation:**
- 3.1 Après vérification email + téléphone, le compte est en statut "pending_admin_approval"
- 3.2 Le fournisseur peut voir son dashboard mais ne peut pas ajouter de produits
- 3.3 Un message clair indique que le compte est en attente de validation
- 3.4 Les admins reçoivent une notification pour chaque nouveau fournisseur
- 3.5 Les admins peuvent approuver ou rejeter le compte
- 3.6 Le fournisseur reçoit un email de notification (approbation ou rejet)
- 3.7 Après approbation, le statut devient "active"

### US-4: Validation Admin pour Marketistes
**En tant que** marketiste  
**Je dois** attendre la validation de mon compte par un administrateur  
**Afin de** pouvoir générer des codes marketing et accéder aux fonctionnalités

**Critères d'acceptation:**
- 4.1 Après vérification email + téléphone, le compte est en statut "pending_admin_approval"
- 4.2 Le marketiste peut voir son dashboard mais ne peut pas générer de codes
- 4.3 Un message clair indique que le compte est en attente de validation
- 4.4 Les admins reçoivent une notification pour chaque nouveau marketiste
- 4.5 Les admins peuvent approuver ou rejeter le compte
- 4.6 Le marketiste reçoit un email de notification (approbation ou rejet)
- 4.7 Après approbation, le statut devient "active"

### US-5: Accès Client Simplifié
**En tant que** client  
**Je veux** accéder rapidement à mon compte après vérification email  
**Afin de** commencer à acheter sans délai

**Critères d'acceptation:**
- 5.1 Après vérification email, le compte client devient "active" immédiatement
- 5.2 Pas de vérification téléphone requise pour les clients
- 5.3 Pas de validation admin requise pour les clients
- 5.4 Le client peut accéder à toutes les fonctionnalités immédiatement

### US-6: Dashboard Admin - Gestion des Validations
**En tant qu'** administrateur  
**Je veux** voir et gérer tous les comptes en attente de validation  
**Afin de** approuver ou rejeter les demandes

**Critères d'acceptation:**
- 6.1 Page dédiée listant tous les comptes "pending_admin_approval"
- 6.2 Filtres par type (fournisseur, marketiste)
- 6.3 Affichage des informations: nom, email, téléphone, date d'inscription
- 6.4 Boutons "Approuver" et "Rejeter" pour chaque compte
- 6.5 Champ optionnel pour raison de rejet
- 6.6 Historique des validations (qui a validé, quand)
- 6.7 Statistiques: nombre en attente, approuvés aujourd'hui, rejetés

### US-7: Notifications et Emails
**En tant qu'** utilisateur  
**Je veux** recevoir des notifications claires à chaque étape  
**Afin de** savoir où j'en suis dans le processus de validation

**Critères d'acceptation:**
- 7.1 Email de bienvenue avec code de vérification
- 7.2 SMS avec code OTP (fournisseurs/marketistes)
- 7.3 Email de confirmation après vérification email
- 7.4 Email de notification après validation admin (approbation/rejet)
- 7.5 Notification in-app pour changement de statut
- 7.6 Tous les emails sont en français

## Statuts de Compte

### Flux Client
```
registered → email_unverified → active
```

### Flux Fournisseur/Marketiste
```
registered → email_unverified → phone_unverified → pending_admin_approval → active/rejected
```

## Modèle de Données

### User (extension)
```typescript
interface User {
  // ... champs existants
  
  // Nouveaux champs
  accountStatus: 'email_unverified' | 'phone_unverified' | 'pending_admin_approval' | 'active' | 'rejected' | 'suspended';
  emailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiry?: Date;
  emailVerificationAttempts: number;
  
  phoneNumber?: string;
  phoneVerified: boolean;
  phoneVerificationAttempts: number;
  
  adminApproval?: {
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string; // Admin user ID
    reviewedAt?: Date;
    rejectionReason?: string;
  };
  
  verificationHistory: Array<{
    type: 'email' | 'phone' | 'admin_approval';
    status: 'success' | 'failed';
    timestamp: Date;
    details?: string;
  }>;
}
```

### EmailVerification Collection
```typescript
interface EmailVerification {
  id: string;
  userId: string;
  email: string;
  code: string; // 6 chiffres
  createdAt: Date;
  expiresAt: Date; // createdAt + 4 minutes
  attempts: number;
  verified: boolean;
  verifiedAt?: Date;
}
```

### PhoneVerification Collection
```typescript
interface PhoneVerification {
  id: string;
  userId: string;
  phoneNumber: string;
  verificationId: string; // Firebase Auth verification ID
  createdAt: Date;
  expiresAt: Date; // createdAt + 2 minutes
  attempts: number;
  verified: boolean;
  verifiedAt?: Date;
}
```

### AdminApprovalQueue Collection
```typescript
interface AdminApprovalRequest {
  id: string;
  userId: string;
  userRole: 'fournisseur' | 'marketiste';
  userName: string;
  userEmail: string;
  userPhone: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  notes?: string;
}
```

## Règles de Sécurité

### Limitations
- Maximum 3 tentatives de vérification email par compte
- Maximum 3 tentatives de vérification téléphone par compte
- Délai de 1 minute entre chaque demande de nouveau code
- Blocage automatique après 5 tentatives échouées (statut "suspended")

### Firestore Rules
```javascript
// Users peuvent lire leur propre profil
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow update: if request.auth.uid == userId 
    && !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(['role', 'accountStatus', 'adminApproval']);
}

// Seuls les admins peuvent modifier accountStatus et adminApproval
match /users/{userId} {
  allow update: if request.auth.token.role == 'admin'
    && request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['accountStatus', 'adminApproval']);
}

// AdminApprovalQueue accessible uniquement aux admins
match /adminApprovalQueue/{requestId} {
  allow read, write: if request.auth.token.role == 'admin';
}
```

## Contraintes Techniques

### Firebase Authentication
- Utiliser Firebase Phone Authentication pour les OTP SMS
- Configurer reCAPTCHA pour la vérification téléphone
- Limiter les coûts SMS avec quotas

### Email Service
- Utiliser un service d'email (SendGrid, Mailgun, ou Firebase Extensions)
- Templates d'email professionnels
- Tracking des emails envoyés/ouverts

### Performance
- Index Firestore pour les requêtes de statut
- Cache des vérifications en cours
- Rate limiting sur les endpoints de vérification

## Dépendances

### NPM Packages
```json
{
  "firebase": "^10.x", // Phone Auth
  "nodemailer": "^6.x", // Email sending (ou SendGrid)
  "@sendgrid/mail": "^7.x", // Alternative email
  "libphonenumber-js": "^1.x" // Validation numéro téléphone
}
```

### Firebase Extensions (Optionnel)
- Trigger Email (pour automatiser les emails)
- Delete User Data (pour RGPD)

## Priorités

### Phase 1 (MVP)
1. Vérification email pour tous
2. Statuts de compte de base
3. Blocage accès dashboard sans vérification

### Phase 2
1. Vérification téléphone (fournisseurs/marketistes)
2. File d'attente validation admin
3. Dashboard admin pour validations

### Phase 3
1. Notifications avancées
2. Historique de vérification
3. Analytics et reporting

## Risques et Mitigations

### Risque 1: Coûts SMS élevés
**Mitigation:** Limiter à 3 tentatives, ajouter délai entre tentatives

### Risque 2: Spam de codes email
**Mitigation:** Rate limiting, CAPTCHA, blocage IP suspects

### Risque 3: Faux comptes fournisseurs
**Mitigation:** Validation admin stricte, vérification documents (future)

### Risque 4: Délai validation admin trop long
**Mitigation:** Notifications push aux admins, SLA de 24h

## Questions Ouvertes

1. Faut-il demander des documents justificatifs aux fournisseurs (SIRET, etc.)?
2. Quel service d'email utiliser (coût vs fonctionnalités)?
3. Faut-il un système de vérification en deux étapes (2FA) optionnel?
4. Que faire des comptes rejetés? Suppression automatique après X jours?

## Métriques de Succès

- Taux de vérification email > 90%
- Taux de vérification téléphone > 85%
- Délai moyen validation admin < 24h
- Taux de faux comptes < 1%
- Satisfaction utilisateurs > 4/5

## Date de Création
13 février 2026
