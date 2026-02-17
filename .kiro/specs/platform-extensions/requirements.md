# Requirements Document: Extensions de la Plateforme Multi-Services

## Introduction

Ce document spécifie les extensions de la plateforme InterAppshop pour inclure de nouvelles catégories de services (Restaurants, Hôtels, Rencontres) et un système de licences pour les fournisseurs. Ces extensions transforment la plateforme e-commerce en une plateforme multi-services complète.

## Glossary

- **Service_Category**: Type de service offert (E-commerce, Restaurant, Hôtel, Rencontre)
- **Profile_Listing**: Profil de personne ajouté pour le service de rencontres
- **License_Tier**: Niveau d'abonnement du fournisseur (Free, Basic, Premium, Enterprise)
- **Product_Quota**: Nombre maximum de produits/profils autorisés par licence
- **Intermediary**: Personne (fournisseur/marketiste/admin) qui gère le contact entre client et profil
- **Contact_Request**: Demande d'un client pour obtenir les coordonnées d'un profil
- **Restaurant_Listing**: Établissement de restauration avec menu et horaires
- **Hotel_Listing**: Établissement hôtelier avec chambres et tarifs

## Requirements

### Requirement 1: Catégories de Services Multiples

**User Story:** En tant qu'utilisateur, je veux accéder à différents types de services sur une seule plateforme, afin de trouver des produits, restaurants, hôtels et rencontres.

#### Acceptance Criteria

1. THE System SHALL support four main service categories: 'ecommerce', 'restaurant', 'hotel', 'dating'
2. THE System SHALL display category selector on homepage with icons for each service type
3. WHEN a user selects a category, THE System SHALL filter listings to show only items from that category
4. THE System SHALL maintain separate navigation and filtering for each category
5. THE Product type SHALL include a 'category' field to distinguish service types

### Requirement 2: Restaurant Listings Management

**User Story:** En tant que fournisseur, je veux ajouter des restaurants à la plateforme, afin que les clients puissent les découvrir.

#### Acceptance Criteria

1. WHEN a fournisseur adds a restaurant, THE System SHALL require name, description, address, phone, cuisine type, and opening hours
2. THE System SHALL capture the fournisseur's current geolocation (latitude, longitude) when adding a restaurant
3. THE System SHALL display a warning message: "Votre position actuelle sera utilisée comme localisation du restaurant"
4. THE System SHALL allow manual adjustment of location on map if needed
5. THE System SHALL allow upload of restaurant photos (minimum 3, maximum 10)
6. THE System SHALL support menu upload as PDF or image gallery
7. THE System SHALL allow setting price range (€, €€, €€€, €€€€)
8. THE System SHALL support restaurant features tags (WiFi, Parking, Terrasse, Livraison, etc.)
9. THE Restaurant listing SHALL count toward the fournisseur's product quota

### Requirement 3: Hotel Listings Management

**User Story:** En tant que fournisseur, je veux ajouter des hôtels à la plateforme, afin que les clients puissent les trouver.

#### Acceptance Criteria

1. WHEN a fournisseur adds a hotel, THE System SHALL require name, description, address, phone, star rating, and amenities
2. THE System SHALL capture the fournisseur's current geolocation (latitude, longitude) when adding a hotel
3. THE System SHALL display a warning message: "Votre position actuelle sera utilisée comme localisation de l'hôtel"
4. THE System SHALL allow manual adjustment of location on map if needed
5. THE System SHALL allow upload of hotel photos (minimum 5, maximum 20)
6. THE System SHALL support room types with individual pricing (Single, Double, Suite, etc.)
7. THE System SHALL allow setting check-in/check-out times
8. THE System SHALL support hotel amenities tags (Piscine, Spa, Restaurant, Gym, etc.)
9. THE Hotel listing SHALL count toward the fournisseur's product quota

### Requirement 4: Dating Profile Listings

**User Story:** En tant que fournisseur/marketiste/admin, je veux ajouter des profils de personnes pour le service de rencontres, afin de faciliter les mises en relation.

#### Acceptance Criteria

1. WHEN adding a dating profile, THE System SHALL require: prénom, âge, genre, ville, description
2. THE System SHALL allow optional fields: taille, couleur de peau, couleur des yeux, profession, centres d'intérêt
3. THE System SHALL require minimum 2 and maximum 8 photos per profile
4. THE System SHALL validate age (minimum 18 ans)
5. THE System SHALL NOT display contact information (phone, email, social media) to clients
6. THE System SHALL store contact information only accessible to the profile creator
7. THE Dating profile SHALL count toward the fournisseur's product quota
8. THE System SHALL allow profile status: 'available', 'unavailable', 'archived'

### Requirement 5: Dating Profile Privacy Protection

**User Story:** En tant que client, je ne peux pas contacter directement les profils de rencontres, afin de protéger leur vie privée.

#### Acceptance Criteria

1. WHEN a client views a dating profile, THE System SHALL NOT display any contact information
2. WHEN a client views a dating profile, THE System SHALL display only the intermediary's information (fournisseur/marketiste/admin who added the profile)
3. THE System SHALL provide a "Demander le contact" button on each profile
4. WHEN a client clicks "Demander le contact", THE System SHALL open a chat with the intermediary
5. THE System SHALL NOT allow direct messaging between client and profile person
6. THE intermediary SHALL manually share contact information via chat if they choose

### Requirement 6: Contact Request Management

**User Story:** En tant qu'intermédiaire, je veux gérer les demandes de contact pour les profils que j'ai ajoutés, afin de contrôler les mises en relation.

#### Acceptance Criteria

1. WHEN a client requests contact for a profile, THE System SHALL create a ContactRequest document
2. THE System SHALL notify the intermediary of new contact requests
3. WHEN an intermediary views contact requests, THE System SHALL display client information and profile requested
4. THE intermediary SHALL be able to approve or reject contact requests
5. WHEN an intermediary approves a request, THE System SHALL allow sharing contact details via chat
6. THE System SHALL track contact request status: 'pending', 'approved', 'rejected', 'shared'
7. THE System SHALL display contact request statistics on intermediary dashboard

### Requirement 7: License Tier System

**User Story:** En tant qu'admin, je veux définir des niveaux de licence avec quotas de produits, afin de monétiser la plateforme.

#### Acceptance Criteria

1. THE System SHALL support four license tiers: 'free', 'basic', 'premium', 'enterprise'
2. EACH license tier SHALL have a defined product quota:
   - Free: 5 produits/profils
   - Basic: 50 produits/profils
   - Premium: 200 produits/profils
   - Enterprise: Illimité
3. EACH license tier SHALL have an annual price in USD
4. THE System SHALL display license tier information on admin dashboard
5. THE Admin SHALL be able to create, update, and deactivate license tiers
6. THE System SHALL prevent deletion of license tiers with active subscriptions

### Requirement 8: Fournisseur License Subscription

**User Story:** En tant que fournisseur, je veux souscrire à une licence pour augmenter mon quota de produits, afin de développer mon activité.

#### Acceptance Criteria

1. WHEN a fournisseur registers, THE System SHALL assign 'free' license tier by default
2. THE System SHALL display current license tier and product quota on fournisseur dashboard
3. THE System SHALL display product usage counter (X/Y produits utilisés)
4. WHEN a fournisseur reaches their quota, THE System SHALL prevent adding new products
5. THE System SHALL display upgrade options when quota is reached
6. THE Fournisseur SHALL be able to view available license tiers with features comparison
7. THE System SHALL allow fournisseur to purchase license upgrade
8. A fournisseur SHALL have only ONE active license at a time

### Requirement 9: License Subscription Management

**User Story:** En tant que fournisseur, je veux gérer mon abonnement de licence, afin de contrôler mes coûts.

#### Acceptance Criteria

1. WHEN a fournisseur purchases a license, THE System SHALL create a Subscription document
2. THE Subscription SHALL have: startDate, endDate (1 year), status, tier, price
3. THE System SHALL calculate endDate as startDate + 365 days
4. THE System SHALL send notification 30 days before license expiration
5. THE System SHALL send notification 7 days before license expiration
6. WHEN a license expires, THE System SHALL downgrade to 'free' tier automatically
7. THE System SHALL allow license renewal before expiration
8. THE System SHALL allow license upgrade (prorated refund for remaining time)
9. THE System SHALL NOT allow license downgrade if current product count exceeds new quota

### Requirement 10: Product Quota Enforcement

**User Story:** En tant que système, je dois respecter les quotas de produits par licence, afin de garantir l'équité.

#### Acceptance Criteria

1. WHEN a fournisseur adds a product/restaurant/hotel/profile, THE System SHALL check current product count
2. IF product count >= quota, THE System SHALL prevent addition and display upgrade message
3. THE System SHALL count ALL items (products, restaurants, hotels, dating profiles) toward quota
4. WHEN a fournisseur deletes a product, THE System SHALL decrement product count
5. WHEN a fournisseur upgrades license, THE System SHALL immediately apply new quota
6. THE System SHALL display quota warning at 80% usage
7. THE System SHALL display quota warning at 90% usage

### Requirement 11: Admin License Management

**User Story:** En tant qu'admin, je veux gérer les licences des fournisseurs, afin de contrôler les abonnements.

#### Acceptance Criteria

1. THE Admin SHALL view all fournisseur subscriptions with status and expiration dates
2. THE Admin SHALL be able to manually upgrade/downgrade fournisseur licenses
3. THE Admin SHALL be able to extend license expiration dates
4. THE Admin SHALL be able to grant free premium licenses (promotional)
5. THE System SHALL display subscription revenue statistics on admin dashboard
6. THE Admin SHALL be able to export subscription data to CSV
7. THE System SHALL send admin notification when subscriptions expire

### Requirement 12: Restaurant Search and Filtering

**User Story:** En tant que client, je veux rechercher des restaurants par critères, afin de trouver ce qui me convient.

#### Acceptance Criteria

1. THE System SHALL allow filtering restaurants by cuisine type
2. THE System SHALL allow filtering restaurants by price range
3. THE System SHALL allow filtering restaurants by features (WiFi, Parking, etc.)
4. THE System SHALL allow filtering restaurants by city/location
5. THE System SHALL allow sorting by rating, price, distance
6. THE System SHALL display restaurant cards with photo, name, cuisine, price range, rating
7. THE System SHALL display map view option for restaurant locations

### Requirement 13: Hotel Search and Filtering

**User Story:** En tant que client, je veux rechercher des hôtels par critères, afin de trouver un hébergement.

#### Acceptance Criteria

1. THE System SHALL allow filtering hotels by star rating
2. THE System SHALL allow filtering hotels by price range
3. THE System SHALL allow filtering hotels by amenities (Piscine, Spa, etc.)
4. THE System SHALL allow filtering hotels by city/location
5. THE System SHALL allow sorting by rating, price, distance
6. THE System SHALL display hotel cards with photo, name, stars, price, rating
7. THE System SHALL display map view option for hotel locations

### Requirement 14: Dating Profile Search and Filtering

**User Story:** En tant que client, je veux rechercher des profils de rencontres par critères, afin de trouver des personnes compatibles.

#### Acceptance Criteria

1. THE System SHALL allow filtering profiles by genre (Homme, Femme, Autre)
2. THE System SHALL allow filtering profiles by age range
3. THE System SHALL allow filtering profiles by ville/région
4. THE System SHALL allow filtering profiles by taille range
5. THE System SHALL allow filtering profiles by couleur de peau
6. THE System SHALL allow filtering profiles by centres d'intérêt
7. THE System SHALL display profile cards with photo, prénom, âge, ville, description preview
8. THE System SHALL blur or hide explicit content

### Requirement 15: Multi-Category Homepage

**User Story:** En tant qu'utilisateur, je veux naviguer facilement entre les catégories de services, afin d'accéder rapidement à ce que je cherche.

#### Acceptance Criteria

1. THE Homepage SHALL display 4 main category cards: E-commerce, Restaurants, Hôtels, Rencontres
2. EACH category card SHALL have icon, title, description, and item count
3. WHEN a user clicks a category, THE System SHALL navigate to category-specific page
4. THE System SHALL maintain category selection in URL (/restaurants, /hotels, /dating)
5. THE Header SHALL display category navigation menu
6. THE System SHALL display category-specific featured items on homepage

### Requirement 16: License Payment Integration

**User Story:** En tant que fournisseur, je veux payer ma licence en ligne, afin d'activer mon abonnement immédiatement.

#### Acceptance Criteria

1. THE System SHALL integrate payment gateway (Stripe, PayPal, or Mobile Money)
2. WHEN a fournisseur selects a license tier, THE System SHALL display payment form
3. THE System SHALL support payment in multiple currencies
4. WHEN payment is successful, THE System SHALL activate license immediately
5. THE System SHALL send payment confirmation email with invoice
6. THE System SHALL store payment transaction history
7. THE System SHALL handle payment failures gracefully with retry option

### Requirement 17: Geolocation-Based Search

**User Story:** En tant que client, je veux rechercher des restaurants et hôtels près de ma position, afin de trouver des établissements à proximité.

#### Acceptance Criteria

1. THE System SHALL request user's geolocation permission when accessing restaurant/hotel categories
2. THE System SHALL display restaurants/hotels sorted by distance from user's location
3. THE System SHALL show distance in kilometers for each listing
4. THE System SHALL allow manual city/location search if geolocation is denied
5. THE System SHALL display "Near Me" filter option
6. THE System SHALL show map view with pins for all nearby establishments
7. THE System SHALL allow filtering by distance radius (1km, 5km, 10km, 25km, 50km+)

### Requirement 18: Dating Profile Verification

**User Story:** En tant qu'admin, je veux vérifier les profils de rencontres, afin d'assurer la qualité et la sécurité.

#### Acceptance Criteria

1. WHEN a dating profile is created, THE System SHALL set status to 'pending_verification'
2. THE Admin SHALL review profile photos and information
3. THE Admin SHALL be able to approve or reject profiles
4. THE System SHALL notify intermediary when profile is approved or rejected
5. ONLY approved profiles SHALL be visible to clients
6. THE Admin SHALL be able to flag inappropriate profiles
7. THE System SHALL display verification badge on approved profiles

### Requirement 19: License Tier Features Comparison

**User Story:** En tant que fournisseur, je veux comparer les fonctionnalités des licences, afin de choisir la meilleure option.

#### Acceptance Criteria

1. THE System SHALL display license comparison table with all tiers
2. THE Comparison SHALL show: product quota, price, support level, features
3. THE System SHALL highlight recommended tier based on fournisseur's current usage
4. THE System SHALL display "Current Plan" badge on active tier
5. THE System SHALL show savings percentage for annual vs monthly pricing
6. THE System SHALL display testimonials from users of each tier

### Requirement 20: Contact Request Chat Integration

**User Story:** En tant que client, je veux discuter avec l'intermédiaire via le chat existant, afin de demander un contact.

#### Acceptance Criteria

1. WHEN a client clicks "Demander le contact", THE System SHALL open existing chat interface
2. THE System SHALL pre-fill chat with profile link and contact request message
3. THE Intermediary SHALL receive notification of contact request in chat
4. THE Chat SHALL display profile preview card in conversation
5. THE System SHALL track if contact was shared via chat message analysis (optional)
6. THE System SHALL allow intermediary to mark contact as "shared" manually

### Requirement 21: Multi-Category Dashboard for Fournisseurs

**User Story:** En tant que fournisseur, je veux gérer tous mes listings (produits, restaurants, hôtels, profils) depuis un seul dashboard.

#### Acceptance Criteria

1. THE Fournisseur dashboard SHALL display tabs for each category
2. THE System SHALL show product count per category
3. THE System SHALL display total quota usage across all categories
4. THE Fournisseur SHALL be able to switch between category views
5. THE System SHALL provide category-specific analytics
6. THE System SHALL allow bulk actions per category

### Requirement 22: License Auto-Renewal

**User Story:** En tant que fournisseur, je veux activer le renouvellement automatique de ma licence, afin d'éviter les interruptions.

#### Acceptance Criteria

1. THE System SHALL offer auto-renewal option during license purchase
2. THE System SHALL store payment method securely for auto-renewal
3. THE System SHALL attempt auto-renewal 7 days before expiration
4. THE System SHALL send notification when auto-renewal succeeds
5. THE System SHALL send notification when auto-renewal fails with retry instructions
6. THE Fournisseur SHALL be able to disable auto-renewal anytime
7. THE System SHALL send reminder before auto-renewal charge

### Requirement 23: Dating Profile Analytics

**User Story:** En tant qu'intermédiaire, je veux voir les statistiques de mes profils de rencontres, afin d'optimiser mes listings.

#### Acceptance Criteria

1. THE System SHALL track profile views per dating profile
2. THE System SHALL track contact requests per profile
3. THE System SHALL display top performing profiles
4. THE System SHALL show conversion rate (views to contact requests)
5. THE System SHALL display analytics charts on intermediary dashboard
6. THE System SHALL allow filtering analytics by date range

### Requirement 24: Restaurant/Hotel Contact Information

**User Story:** En tant que client, je veux voir les coordonnées des restaurants et hôtels, afin de les contacter directement.

#### Acceptance Criteria

1. THE System SHALL display phone number on restaurant/hotel detail pages
2. THE System SHALL display email address on restaurant/hotel detail pages
3. THE System SHALL display physical address with map on detail pages
4. THE System SHALL provide "Call Now" button with tel: link
5. THE System SHALL provide "Email" button with mailto: link
6. THE System SHALL provide "Get Directions" button with map integration
7. THE System SHALL track contact clicks for analytics

