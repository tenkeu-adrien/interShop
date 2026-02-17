# Système de Vérification de Compte - Liste des Tâches

## Phase 1: Vérification Email + Statuts de Compte (MVP)

### 1.1 Mise à jour des Types TypeScript
- [ ] **TASK-001**: Ajouter nouveaux champs à l'interface `User` dans `types/index.ts`
  - `accountStatus`
  - `emailVerified`
  - `emailVerificationCode`
  - `emailVerificationExpiry`
  - `emailVerificationAttempts`
  - `verificationHistory`
  - Durée estimée: 15 min

- [ ] **TASK-002**: Créer interface `EmailVerification` dans `types/index.ts`
  - Durée estimée: 10 min

- [ ] **TASK-003**: Créer type `AccountStatus` dans `types/index.ts`
  - Durée estimée: 5 min

### 1.2 Service de Vérification Email
- [ ] **TASK-004**: Créer fichier `lib/firebase/verification.ts`
  - Durée estimée: 10 min

- [ ] **TASK-005**: Implémenter `generateEmailVerificationCode()`
  - Génère code 6 chiffres aléatoire
  - Crée document dans collection `emailVerifications`
  - Définit expiration à +4 minutes
  - Durée estimée: 30 min

- [ ] **TASK-006**: Implémenter `verifyEmailCode()`
  - Vérifie le code
  - Vérifie l'expiration
  - Met à jour `emailVerified` dans user
  - Met à jour `accountStatus`
  - Ajoute entrée dans `verificationHistory`
  - Durée estimée: 45 min

- [ ] **TASK-007**: Implémenter `resendEmailVerificationCode()`
  - Vérifie délai de 1 minute
  - Vérifie limite de 3 tentatives
  - Génère nouveau code
  - Durée estimée: 30 min

### 1.3 Service Email
- [ ] **TASK-008**: Créer fichier `lib/services/emailService.ts`
  - Durée estimée: 10 min

- [ ] **TASK-009**: Configurer Nodemailer ou SendGrid
  - Ajouter variables d'environnement
  - Configurer transporter
  - Durée estimée: 20 min

- [ ] **TASK-010**: Créer template email de vérification
  - HTML responsive
  - Code bien visible
  - Instructions claires
  - Durée estimée: 30 min

- [ ] **TASK-011**: Implémenter `sendVerificationEmail()`
  - Envoie email avec code
  - Gestion des erreurs
  - Durée estimée: 30 min

### 1.4 Mise à jour de l'Inscription
- [ ] **TASK-012**: Modifier `lib/firebase/auth.ts` - fonction `registerUser()`
  - Ajouter nouveaux champs au document user
  - Définir `accountStatus` initial selon le rôle
  - Générer et envoyer code de vérification email
  - Durée estimée: 30 min

### 1.5 Page de Vérification Email
- [ ] **TASK-013**: Créer composant `components/auth/EmailVerification.tsx`
  - Input pour code à 6 chiffres
  - Bouton "Vérifier"
  - Bouton "Renvoyer le code" avec timer
  - Affichage temps restant
  - Messages d'erreur/succès
  - Durée estimée: 60 min

- [ ] **TASK-014**: Créer page `app/verify-email/page.tsx`
  - Utilise composant EmailVerification
  - Redirection après succès
  - Durée estimée: 30 min

### 1.6 Bannière de Statut
- [ ] **TASK-015**: Créer composant `components/auth/AccountStatusBanner.tsx`
  - Affiche message selon `accountStatus`
  - Lien vers page de vérification appropriée
  - Durée estimée: 45 min

- [ ] **TASK-016**: Intégrer bannière dans `app/layout.tsx`
  - Afficher seulement si compte non actif
  - Durée estimée: 15 min

### 1.7 Protection des Routes
- [ ] **TASK-017**: Mettre à jour `components/auth/ProtectedRoute.tsx`
  - Vérifier `accountStatus`
  - Rediriger selon le statut
  - Durée estimée: 30 min

- [ ] **TASK-018**: Mettre à jour `middleware.ts`
  - Ajouter logique de redirection selon statut
  - Durée estimée: 30 min

### 1.8 Mise à jour du Store Auth
- [ ] **TASK-019**: Mettre à jour `store/authStore.ts`
  - Ajouter champs de vérification
  - Durée estimée: 15 min

### 1.9 Règles Firestore
- [ ] **TASK-020**: Mettre à jour `firestore.rules`
  - Règles pour collection `emailVerifications`
  - Règles pour champs de vérification dans `users`
  - Durée estimée: 30 min

### 1.10 Index Firestore
- [ ] **TASK-021**: Mettre à jour `firestore.indexes.json`
  - Index pour `users` par `accountStatus`
  - Durée estimée: 10 min

### 1.11 Tests Phase 1
- [ ] **TASK-022**: Tester inscription client avec vérification email
  - Durée estimée: 30 min

- [ ] **TASK-023**: Tester renvoi de code
  - Durée estimée: 15 min

- [ ] **TASK-024**: Tester expiration du code
  - Durée estimée: 15 min

**Durée totale Phase 1: ~9 heures**

---

## Phase 2: Vérification Téléphone + Validation Admin

### 2.1 Types pour Téléphone et Admin
- [ ] **TASK-025**: Ajouter champs téléphone à l'interface `User`
  - `phoneNumber`
  - `phoneVerified`
  - `phoneVerificationAttempts`
  - Durée estimée: 10 min

- [ ] **TASK-026**: Créer interface `PhoneVerification` dans `types/index.ts`
  - Durée estimée: 10 min

- [ ] **TASK-027**: Ajouter champ `adminApproval` à l'interface `User`
  - Durée estimée: 10 min

- [ ] **TASK-028**: Créer interface `AdminApprovalRequest` dans `types/index.ts`
  - Durée estimée: 10 min

### 2.2 Configuration Firebase Phone Auth
- [ ] **TASK-029**: Activer Phone Authentication dans Firebase Console
  - Durée estimée: 10 min

- [ ] **TASK-030**: Configurer reCAPTCHA v3
  - Durée estimée: 20 min

- [ ] **TASK-031**: Définir quotas SMS pour limiter les coûts
  - Durée estimée: 10 min

### 2.3 Service de Vérification Téléphone
- [ ] **TASK-032**: Installer package `libphonenumber-js`
  - Durée estimée: 5 min

- [ ] **TASK-033**: Implémenter `sendPhoneVerificationCode()` dans `verification.ts`
  - Valider format téléphone
  - Utiliser Firebase Phone Auth
  - Créer document dans `phoneVerifications`
  - Durée estimée: 60 min

- [ ] **TASK-034**: Implémenter `verifyPhoneCode()` dans `verification.ts`
  - Vérifier code OTP
  - Mettre à jour `phoneVerified`
  - Mettre à jour `accountStatus`
  - Durée estimée: 45 min

- [ ] **TASK-035**: Implémenter `resendPhoneVerificationCode()` dans `verification.ts`
  - Vérifier délai et tentatives
  - Durée estimée: 30 min

### 2.4 Page de Vérification Téléphone
- [ ] **TASK-036**: Créer composant `components/auth/PhoneVerification.tsx`
  - Input numéro téléphone (format international)
  - Bouton "Envoyer le code"
  - Input code OTP
  - Bouton "Vérifier"
  - Timer et renvoi
  - Durée estimée: 90 min

- [ ] **TASK-037**: Créer page `app/verify-phone/page.tsx`
  - Utilise composant PhoneVerification
  - Redirection après succès
  - Durée estimée: 30 min

### 2.5 Service de Validation Admin
- [ ] **TASK-038**: Implémenter `submitForAdminApproval()` dans `verification.ts`
  - Créer document dans `adminApprovalQueue`
  - Mettre à jour `accountStatus` à `pending_admin_approval`
  - Envoyer notification aux admins
  - Durée estimée: 45 min

- [ ] **TASK-039**: Implémenter `approveUser()` dans `verification.ts`
  - Mettre à jour statut utilisateur
  - Mettre à jour queue d'approbation
  - Envoyer email de confirmation
  - Ajouter à l'historique
  - Durée estimée: 45 min

- [ ] **TASK-040**: Implémenter `rejectUser()` dans `verification.ts`
  - Mettre à jour statut utilisateur
  - Enregistrer raison du rejet
  - Envoyer email de notification
  - Durée estimée: 45 min

- [ ] **TASK-041**: Implémenter `getApprovalQueue()` dans `verification.ts`
  - Récupérer liste des comptes en attente
  - Filtrer par rôle si spécifié
  - Trier par date
  - Durée estimée: 30 min

### 2.6 Page d'Attente de Validation
- [ ] **TASK-042**: Créer page `app/pending-approval/page.tsx`
  - Message d'information
  - Affichage du statut
  - Durée estimée: 30 min

### 2.7 Dashboard Admin - Validations
- [ ] **TASK-043**: Créer composant `components/admin/ApprovalDashboard.tsx`
  - Liste des comptes en attente
  - Filtres (fournisseur/marketiste)
  - Détails utilisateur
  - Boutons Approuver/Rejeter
  - Champ raison de rejet
  - Statistiques
  - Durée estimée: 120 min

- [ ] **TASK-044**: Créer page `app/dashboard/admin/approvals/page.tsx`
  - Utilise composant ApprovalDashboard
  - Protection admin uniquement
  - Durée estimée: 30 min

### 2.8 Templates Email Supplémentaires
- [ ] **TASK-045**: Créer template email d'approbation
  - Durée estimée: 20 min

- [ ] **TASK-046**: Créer template email de rejet
  - Durée estimée: 20 min

- [ ] **TASK-047**: Implémenter `sendApprovalEmail()` dans `emailService.ts`
  - Durée estimée: 30 min

### 2.9 Notifications Admin
- [ ] **TASK-048**: Créer notification pour nouveaux comptes à valider
  - Utiliser système de notifications existant
  - Durée estimée: 30 min

### 2.10 Règles Firestore Phase 2
- [ ] **TASK-049**: Ajouter règles pour `phoneVerifications`
  - Durée estimée: 15 min

- [ ] **TASK-050**: Ajouter règles pour `adminApprovalQueue`
  - Durée estimée: 20 min

### 2.11 Index Firestore Phase 2
- [ ] **TASK-051**: Ajouter index pour `adminApprovalQueue`
  - Par statut et date
  - Par rôle, statut et date
  - Durée estimée: 10 min

### 2.12 Tests Phase 2
- [ ] **TASK-052**: Tester vérification téléphone complète
  - Durée estimée: 30 min

- [ ] **TASK-053**: Tester flux d'approbation admin
  - Durée estimée: 30 min

- [ ] **TASK-054**: Tester flux de rejet
  - Durée estimée: 20 min

**Durée totale Phase 2: ~13 heures**

---

## Phase 3: Notifications Avancées + Analytics

### 3.1 Notifications Avancées
- [ ] **TASK-055**: Créer template email de bienvenue
  - Durée estimée: 20 min

- [ ] **TASK-056**: Implémenter `sendWelcomeEmail()` dans `emailService.ts`
  - Durée estimée: 20 min

- [ ] **TASK-057**: Envoyer email de bienvenue après vérification email
  - Durée estimée: 15 min

- [ ] **TASK-058**: Créer notifications in-app pour changements de statut
  - Durée estimée: 45 min

### 3.2 Historique de Vérification
- [ ] **TASK-059**: Créer composant `components/auth/VerificationHistory.tsx`
  - Affiche historique des vérifications
  - Timeline visuelle
  - Durée estimée: 60 min

- [ ] **TASK-060**: Intégrer historique dans profil utilisateur
  - Durée estimée: 20 min

### 3.3 Analytics et Reporting
- [ ] **TASK-061**: Créer page `app/dashboard/admin/verification-analytics/page.tsx`
  - Statistiques globales
  - Taux de vérification
  - Délais moyens
  - Graphiques
  - Durée estimée: 90 min

- [ ] **TASK-062**: Implémenter fonctions de calcul des métriques
  - Taux de vérification email
  - Taux de vérification téléphone
  - Délai moyen validation admin
  - Taux d'abandon par étape
  - Durée estimée: 60 min

### 3.4 Améliorations UX
- [ ] **TASK-063**: Ajouter animations de transition entre étapes
  - Durée estimée: 30 min

- [ ] **TASK-064**: Améliorer messages d'erreur
  - Messages plus explicites
  - Suggestions de résolution
  - Durée estimée: 30 min

- [ ] **TASK-065**: Ajouter indicateur de progression
  - Affiche étapes restantes
  - Durée estimée: 30 min

### 3.5 Documentation
- [ ] **TASK-066**: Créer guide utilisateur "Comment vérifier son email"
  - Durée estimée: 20 min

- [ ] **TASK-067**: Créer guide utilisateur "Comment vérifier son téléphone"
  - Durée estimée: 20 min

- [ ] **TASK-068**: Créer FAQ pour problèmes courants
  - Durée estimée: 30 min

### 3.6 Tests Phase 3
- [ ] **TASK-069**: Tester tous les emails
  - Durée estimée: 30 min

- [ ] **TASK-070**: Tester analytics
  - Durée estimée: 20 min

**Durée totale Phase 3: ~8 heures**

---

## Migration et Déploiement

### Migration
- [ ] **TASK-071**: Créer script `scripts/migrateUsersVerification.ts`
  - Ajouter nouveaux champs aux utilisateurs existants
  - Durée estimée: 45 min

- [ ] **TASK-072**: Tester script de migration en local
  - Durée estimée: 30 min

- [ ] **TASK-073**: Exécuter migration en staging
  - Durée estimée: 20 min

### Déploiement
- [ ] **TASK-074**: Déployer règles Firestore
  - Durée estimée: 10 min

- [ ] **TASK-075**: Créer index Firestore en production
  - Durée estimée: 10 min

- [ ] **TASK-076**: Configurer variables d'environnement production
  - Durée estimée: 15 min

- [ ] **TASK-077**: Déployer application en staging
  - Durée estimée: 20 min

- [ ] **TASK-078**: Tests complets en staging
  - Durée estimée: 60 min

- [ ] **TASK-079**: Déployer en production
  - Durée estimée: 20 min

- [ ] **TASK-080**: Monitorer les premières heures
  - Durée estimée: 120 min

**Durée totale Migration/Déploiement: ~6 heures**

---

## Résumé des Durées

| Phase | Durée Estimée |
|-------|---------------|
| Phase 1: Vérification Email + Statuts | ~9 heures |
| Phase 2: Téléphone + Validation Admin | ~13 heures |
| Phase 3: Notifications + Analytics | ~8 heures |
| Migration et Déploiement | ~6 heures |
| **TOTAL** | **~36 heures** |

## Priorités

### Critique (À faire en premier)
- TASK-001 à TASK-024 (Phase 1 complète)

### Important (Fonctionnalités principales)
- TASK-025 à TASK-054 (Phase 2 complète)

### Nice to Have (Améliorations)
- TASK-055 à TASK-070 (Phase 3 complète)

## Notes

- Chaque tâche doit être testée individuellement avant de passer à la suivante
- Commiter régulièrement après chaque tâche complétée
- Documenter les décisions importantes
- Prendre des screenshots des interfaces pour la documentation

