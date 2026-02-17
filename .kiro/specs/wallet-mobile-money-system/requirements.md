# Système de Portefeuille et Mobile Money - Exigences

## 1. Vue d'ensemble

### 1.1 Objectif
Permettre aux utilisateurs de gérer un portefeuille électronique sur la plateforme InterShop avec possibilité de:
- Déposer de l'argent depuis leur Mobile Money vers le portefeuille InterShop
- Retirer de l'argent du portefeuille InterShop vers leur Mobile Money
- Utiliser le solde du portefeuille pour payer des achats
- Consulter l'historique des transactions

### 1.2 Contexte
En Afrique, le Mobile Money (MTN Mobile Money, Orange Money, Moov Money, etc.) est le moyen de paiement le plus utilisé. L'intégration d'un portefeuille permet:
- Transactions plus rapides (pas besoin de saisir les infos à chaque achat)
- Réduction des frais de transaction
- Meilleure expérience utilisateur
- Gestion centralisée des fonds

### 1.3 Services Mobile Money supportés
- 🇨🇲 MTN Mobile Money (Cameroun, autres pays)
- 🇨🇮 Orange Money (Côte d'Ivoire, autres pays)
- 🇧🇫 Moov Money (Burkina Faso, autres pays)
- 🇸🇳 Wave (Sénégal, autres pays)
- 🇬🇭 Vodafone Cash (Ghana)
- 🇳🇬 Airtel Money (Nigeria, autres pays)

## 2. Acteurs

### 2.1 Utilisateurs (Clients, Fournisseurs, Marketistes)
- Peuvent créer un portefeuille
- Peuvent déposer de l'argent
- Peuvent retirer de l'argent
- Peuvent consulter leur solde
- Peuvent voir l'historique des transactions

### 2.2 Administrateurs InterShop
- Configurent les comptes Mobile Money de la plateforme
- Valident les dépôts manuellement (si nécessaire)
- Valident les retraits manuellement (si nécessaire)
- Gèrent les frais de transaction
- Consultent toutes les transactions
- Gèrent les litiges

### 2.3 Système
- Traite les transactions automatiquement (si API disponible)
- Envoie des notifications
- Met à jour les soldes
- Enregistre l'historique

## 3. Exigences fonctionnelles

### 3.1 Création du portefeuille

**RF-1.1**: Chaque utilisateur doit avoir un portefeuille unique créé automatiquement lors de l'inscription
- Solde initial: 0 FCFA
- Devise: FCFA (Franc CFA)
- Statut: Actif

**RF-1.2**: Le portefeuille doit afficher:
- Solde disponible
- Solde en attente (transactions en cours)
- Historique des transactions

### 3.2 Dépôt d'argent (Mobile Money → Portefeuille InterShop)

**RF-2.1**: L'utilisateur doit pouvoir initier un dépôt en:
- Sélectionnant le service Mobile Money (MTN, Orange, Moov, etc.)
- Entrant le montant à déposer (minimum: 500 FCFA)
- Entrant son numéro Mobile Money
- Confirmant la transaction

**RF-2.2**: Le système doit:
- Afficher le numéro Mobile Money de InterShop pour le service sélectionné
- Afficher les instructions de transfert
- Générer un code de référence unique
- Créer une transaction en statut "En attente"

**RF-2.3**: Deux modes de dépôt:

**Mode Manuel** (Phase 1):
1. Utilisateur transfère l'argent manuellement vers le compte InterShop
2. Utilisateur entre le code de transaction Mobile Money
3. Admin vérifie et valide le dépôt
4. Solde crédité

**Mode Automatique** (Phase 2 - avec API):
1. Utilisateur autorise le prélèvement
2. API Mobile Money traite automatiquement
3. Solde crédité instantanément

**RF-2.4**: Frais de dépôt:
- 0% pour dépôts > 5000 FCFA
- 1% pour dépôts < 5000 FCFA (minimum 50 FCFA)

### 3.3 Retrait d'argent (Portefeuille InterShop → Mobile Money)

**RF-3.1**: L'utilisateur doit pouvoir initier un retrait en:
- Sélectionnant le service Mobile Money
- Entrant le montant à retirer (minimum: 1000 FCFA)
- Entrant son numéro Mobile Money
- Confirmant avec son mot de passe ou code PIN

**RF-3.2**: Le système doit:
- Vérifier que le solde est suffisant
- Déduire les frais de retrait
- Créer une transaction en statut "En attente"
- Bloquer le montant dans le solde

**RF-3.3**: Deux modes de retrait:

**Mode Manuel** (Phase 1):
1. Utilisateur demande le retrait
2. Admin vérifie et valide
3. Admin transfère manuellement vers le Mobile Money de l'utilisateur
4. Admin confirme le retrait
5. Solde débité

**Mode Automatique** (Phase 2 - avec API):
1. Utilisateur demande le retrait
2. API Mobile Money traite automatiquement
3. Solde débité instantanément

**RF-3.4**: Frais de retrait:
- 2% du montant (minimum 100 FCFA, maximum 1000 FCFA)

**RF-3.5**: Limites de retrait:
- Minimum: 1000 FCFA
- Maximum: 500,000 FCFA par jour
- Maximum: 2,000,000 FCFA par mois

### 3.4 Paiement avec le portefeuille

**RF-4.1**: Lors du paiement d'une commande, l'utilisateur doit pouvoir:
- Choisir "Portefeuille InterShop" comme moyen de paiement
- Voir son solde disponible
- Confirmer le paiement avec mot de passe ou PIN

**RF-4.2**: Le système doit:
- Vérifier que le solde est suffisant
- Débiter le montant du portefeuille
- Créditer le portefeuille du fournisseur
- Enregistrer la transaction
- Envoyer une notification

**RF-4.3**: Frais de transaction:
- 0% pour paiements via portefeuille (gratuit)

### 3.5 Historique des transactions

**RF-5.1**: L'utilisateur doit pouvoir consulter:
- Liste de toutes les transactions
- Filtres: Type (dépôt, retrait, paiement, réception), Date, Statut
- Détails de chaque transaction:
  - Date et heure
  - Type
  - Montant
  - Frais
  - Statut
  - Référence
  - Description

**RF-5.2**: Export de l'historique:
- Format PDF
- Format Excel
- Période personnalisable

### 3.6 Configuration Admin

**RF-6.1**: Les admins doivent pouvoir configurer:
- Comptes Mobile Money de la plateforme (numéros, noms)
- Frais de dépôt et retrait
- Limites de transaction
- Activation/désactivation des services Mobile Money

**RF-6.2**: Les admins doivent pouvoir:
- Voir toutes les transactions en attente
- Valider ou rejeter les dépôts
- Valider ou rejeter les retraits
- Voir le solde total de tous les portefeuilles
- Générer des rapports financiers

### 3.7 Notifications

**RF-7.1**: L'utilisateur doit recevoir une notification pour:
- Dépôt initié
- Dépôt validé/rejeté
- Retrait initié
- Retrait validé/rejeté
- Paiement effectué
- Paiement reçu
- Solde faible (< 1000 FCFA)

**RF-7.2**: Les notifications doivent être envoyées par:
- Email
- Notification in-app
- SMS (optionnel)

## 4. Exigences non fonctionnelles

### 4.1 Sécurité

**RNF-1.1**: Toutes les transactions doivent être:
- Chiffrées (HTTPS)
- Authentifiées (mot de passe ou PIN)
- Tracées (logs complets)
- Auditables

**RNF-1.2**: Protection contre la fraude:
- Limite de tentatives (3 max)
- Vérification en deux étapes pour gros montants (> 100,000 FCFA)
- Détection d'activités suspectes
- Blocage automatique en cas d'anomalie

**RNF-1.3**: Code PIN:
- 4 à 6 chiffres
- Différent du mot de passe
- Obligatoire pour retraits et paiements > 10,000 FCFA

### 4.2 Performance

**RNF-2.1**: Temps de réponse:
- Consultation du solde: < 1 seconde
- Initiation de transaction: < 2 secondes
- Validation de transaction: < 5 secondes

**RNF-2.2**: Disponibilité:
- 99.5% de disponibilité
- Maintenance planifiée hors heures de pointe

### 4.3 Conformité

**RNF-3.1**: Conformité réglementaire:
- Respect des lois sur les transactions financières
- KYC (Know Your Customer) pour montants > 500,000 FCFA
- Déclaration des transactions suspectes

**RNF-3.2**: Conservation des données:
- Historique conservé pendant 5 ans minimum
- Logs de sécurité conservés pendant 2 ans

### 4.4 Scalabilité

**RNF-4.1**: Le système doit supporter:
- 10,000 utilisateurs actifs simultanés
- 1,000 transactions par minute
- Croissance de 50% par an

## 5. Contraintes

### 5.1 Contraintes techniques

**C-1.1**: Intégration API Mobile Money:
- Phase 1: Mode manuel (sans API)
- Phase 2: Intégration API (MTN, Orange, Moov)
- Nécessite des accords commerciaux avec les opérateurs

**C-1.2**: Devise unique:
- FCFA uniquement pour le moment
- Support multi-devises en Phase 3

### 5.2 Contraintes légales

**C-2.1**: Licence de paiement:
- Vérifier si une licence est nécessaire selon le pays
- Respecter les réglementations bancaires locales

**C-2.2**: Limites réglementaires:
- Respecter les limites imposées par les autorités
- Déclaration obligatoire pour montants > 1,000,000 FCFA

### 5.3 Contraintes opérationnelles

**C-3.1**: Support client:
- Équipe disponible pour gérer les litiges
- Temps de réponse < 24h pour les problèmes de transaction

**C-3.2**: Réconciliation:
- Vérification quotidienne des soldes
- Rapprochement avec les comptes Mobile Money

## 6. Critères d'acceptation

### 6.1 Dépôt d'argent

**CA-1.1**: Un utilisateur peut initier un dépôt et voir les instructions
**CA-1.2**: Un admin peut valider un dépôt et le solde est crédité
**CA-1.3**: L'utilisateur reçoit une notification de confirmation
**CA-1.4**: La transaction apparaît dans l'historique

### 6.2 Retrait d'argent

**CA-2.1**: Un utilisateur peut initier un retrait si le solde est suffisant
**CA-2.2**: Un admin peut valider un retrait et le solde est débité
**CA-2.3**: L'utilisateur reçoit une notification de confirmation
**CA-2.4**: Les frais sont correctement calculés et affichés

### 6.3 Paiement

**CA-3.1**: Un utilisateur peut payer une commande avec son portefeuille
**CA-3.2**: Le solde est débité et le fournisseur est crédité
**CA-3.3**: Les deux parties reçoivent une notification
**CA-3.4**: La transaction est enregistrée dans l'historique

### 6.4 Sécurité

**CA-4.1**: Un code PIN est requis pour les retraits
**CA-4.2**: Les tentatives échouées sont limitées à 3
**CA-4.3**: Toutes les transactions sont tracées dans les logs

### 6.5 Administration

**CA-5.1**: Un admin peut configurer les comptes Mobile Money
**CA-5.2**: Un admin peut voir toutes les transactions en attente
**CA-5.3**: Un admin peut générer des rapports financiers

## 7. Risques et mitigation

### 7.1 Risques techniques

**R-1.1**: Panne du système pendant une transaction
- **Mitigation**: Transactions atomiques, rollback automatique

**R-1.2**: Erreur de calcul du solde
- **Mitigation**: Double vérification, logs détaillés, tests rigoureux

### 7.2 Risques de sécurité

**R-2.1**: Fraude ou vol de compte
- **Mitigation**: Code PIN, 2FA, détection d'anomalies

**R-2.2**: Attaque par déni de service
- **Mitigation**: Rate limiting, WAF, monitoring

### 7.3 Risques opérationnels

**R-3.1**: Erreur de validation manuelle par admin
- **Mitigation**: Double validation, formation, procédures claires

**R-3.2**: Litige client
- **Mitigation**: Historique complet, support réactif, procédure de remboursement

### 7.4 Risques légaux

**R-4.1**: Non-conformité réglementaire
- **Mitigation**: Consultation juridique, veille réglementaire

**R-4.2**: Blanchiment d'argent
- **Mitigation**: KYC, limites de transaction, monitoring

## 8. Glossaire

- **Portefeuille (Wallet)**: Compte virtuel contenant le solde de l'utilisateur
- **Mobile Money**: Service de paiement mobile (MTN, Orange, Moov, etc.)
- **Dépôt**: Transfert d'argent de Mobile Money vers le portefeuille
- **Retrait**: Transfert d'argent du portefeuille vers Mobile Money
- **FCFA**: Franc CFA, devise utilisée dans plusieurs pays d'Afrique de l'Ouest et Centrale
- **KYC**: Know Your Customer, vérification d'identité
- **PIN**: Personal Identification Number, code secret à 4-6 chiffres
- **2FA**: Two-Factor Authentication, authentification à deux facteurs

## 9. Références

- Réglementations BCEAO (Banque Centrale des États de l'Afrique de l'Ouest)
- Réglementations BEAC (Banque des États de l'Afrique Centrale)
- Documentation API MTN Mobile Money
- Documentation API Orange Money
- PCI DSS (Payment Card Industry Data Security Standard)
