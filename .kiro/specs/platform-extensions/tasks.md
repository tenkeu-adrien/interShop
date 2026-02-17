# Tasks: Extensions de la Plateforme Multi-Services

## Phase 1: Types et Modèles de Données

- [x] 1.1 Étendre le type Product dans types/index.ts
  - [x] 1.1.1 Ajouter ProductCategory type ('ecommerce' | 'restaurant' | 'hotel' | 'dating')
  - [x] 1.1.2 Ajouter champ serviceCategory au Product
  - [x] 1.1.3 Ajouter interface location avec latitude, longitude, address, city, country
  - [x] 1.1.4 Ajouter interface restaurantData avec cuisineType, priceRange, openingHours, features, menuPDF
  - [x] 1.1.5 Ajouter interface hotelData avec starRating, roomTypes, checkInTime, checkOutTime, amenities
  - [x] 1.1.6 Ajouter interface datingProfile avec firstName, age, gender, height, skinColor, eyeColor, profession, interests, status, contactInfo

- [x] 1.2 Créer les types pour le système de licences
  - [x] 1.2.1 Créer LicenseTier type ('free' | 'basic' | 'premium' | 'enterprise')
  - [x] 1.2.2 Créer interface LicenseConfig avec id, tier, name, productQuota, priceUSD, features, isActive
  - [x] 1.2.3 Créer interface FournisseurSubscription avec id, fournisseurId, licenseTier, startDate, endDate, status, autoRenew
  - [x] 1.2.4 Créer interface ProductUsage avec fournisseurId, currentCount, quota, lastUpdated

- [x] 1.3 Créer le type ContactRequest
  - [x] 1.3.1 Créer interface ContactRequest avec id, profileId, clientId, intermediaryId, status, message, createdAt, updatedAt, sharedAt

## Phase 2: Zustand Stores

- [x] 2.1 Créer categoryStore (store/categoryStore.ts)
  - [x] 2.1.1 Définir CategoryState avec selectedCategory, filters, setCategory, setFilters, clearFilters
  - [x] 2.1.2 Implémenter setCategory pour changer la catégorie active
  - [x] 2.1.3 Implémenter setFilters pour mettre à jour les filtres (city, priceRange, features, distance)
  - [x] 2.1.4 Implémenter clearFilters pour réinitialiser tous les filtres

- [x] 2.2 Créer licenseStore (store/licenseStore.ts)
  - [x] 2.2.1 Définir LicenseState avec licenses, currentSubscription, productUsage, loading
  - [x] 2.2.2 Implémenter fetchLicenses pour récupérer toutes les licences depuis Firebase
  - [x] 2.2.3 Implémenter fetchSubscription pour récupérer l'abonnement actif du fournisseur
  - [x] 2.2.4 Implémenter fetchProductUsage pour récupérer le compteur de produits
  - [x] 2.2.5 Implémenter upgradeLicense pour mettre à niveau la licence
  - [x] 2.2.6 Implémenter checkQuota pour vérifier si le quota est atteint

- [x] 2.3 Créer geolocationStore (store/geolocationStore.ts)
  - [x] 2.3.1 Définir GeolocationState avec userLocation, permissionGranted, loading, error
  - [x] 2.3.2 Implémenter requestLocation pour demander la permission et capturer la position
  - [x] 2.3.3 Implémenter calculateDistance avec formule Haversine pour calculer la distance entre deux points
  - [x] 2.3.4 Gérer les erreurs de permission refusée

## Phase 3: Fonctions Firebase

- [x] 3.1 Créer lib/firebase/licenses.ts
  - [x] 3.1.1 Implémenter getAllLicenses pour récupérer toutes les configurations de licences
  - [x] 3.1.2 Implémenter getFournisseurSubscription pour récupérer l'abonnement actif
  - [x] 3.1.3 Implémenter getProductUsage pour récupérer/initialiser le compteur de produits
  - [x] 3.1.4 Implémenter updateProductUsage pour incrémenter/décrémenter le compteur
  - [x] 3.1.5 Implémenter createSubscription pour créer un nouvel abonnement annuel
  - [x] 3.1.6 Mettre à jour le quota dans productUsage lors de la création d'abonnement

- [x] 3.2 Étendre lib/firebase/products.ts
  - [x] 3.2.1 Implémenter createMultiCategoryProduct avec vérification de quota
  - [x] 3.2.2 Incrémenter productUsage après création réussie
  - [x] 3.2.3 Implémenter getProductsByCategory avec filtres (city, priceRange, features, userLocation, maxDistance)
  - [x] 3.2.4 Ajouter calcul de distance pour chaque produit si userLocation fournie
  - [x] 3.2.5 Trier les résultats par distance si géolocalisation active
  - [x] 3.2.6 Implémenter fonction calculateDistance avec formule Haversine

- [x] 3.3 Créer lib/firebase/contactRequests.ts
  - [x] 3.3.1 Implémenter createContactRequest pour créer une demande de contact
  - [x] 3.3.2 Créer notification pour l'intermédiaire lors de la demande
  - [x] 3.3.3 Implémenter getContactRequestsByIntermediary pour récupérer les demandes
  - [x] 3.3.4 Implémenter updateContactRequestStatus pour changer le statut (pending, approved, rejected, shared)

- [x] 3.4 Créer lib/firebase/storage.ts (si n'existe pas)
  - [x] 3.4.1 Implémenter uploadImages pour uploader plusieurs images
  - [x] 3.4.2 Gérer les uploads dans des dossiers par fournisseur
  - [x] 3.4.3 Retourner les URLs des images uploadées

## Phase 4: Composants UI Réutilisables

- [x] 4.1 Créer CategorySelector (components/CategorySelector.tsx)
  - [x] 4.1.1 Afficher 4 cartes de catégories (E-commerce, Restaurants, Hôtels, Rencontres)
  - [x] 4.1.2 Utiliser icônes Lucide React (ShoppingBag, UtensilsCrossed, Hotel, Heart)
  - [x] 4.1.3 Intégrer avec categoryStore pour changer la catégorie
  - [x] 4.1.4 Naviguer vers la route appropriée au clic
  - [x] 4.1.5 Ajouter animations Framer Motion

- [x] 4.2 Créer LicenseUpgradeModal (components/LicenseUpgradeModal.tsx)
  - [x] 4.2.1 Afficher grille de 4 licences (Free, Basic, Premium, Enterprise)
  - [x] 4.2.2 Afficher prix, quota, et features pour chaque licence
  - [x] 4.2.3 Marquer la licence actuelle avec badge "Plan actuel"
  - [x] 4.2.4 Bouton "Mettre à niveau" pour chaque licence non-active
  - [x] 4.2.5 Intégrer avec licenseStore.upgradeLicense
  - [x] 4.2.6 Gérer état de chargement et erreurs

- [x] 4.3 Créer RestaurantCard (components/RestaurantCard.tsx)
  - [x] 4.3.1 Afficher image, nom, rating, type de cuisine
  - [x] 4.3.2 Afficher badge de gamme de prix (€, €€, €€€, €€€€)
  - [x] 4.3.3 Calculer et afficher distance si géolocalisation active
  - [x] 4.3.4 Afficher features (WiFi, Parking, etc.) en tags
  - [x] 4.3.5 Lien vers page détail du restaurant
  - [x] 4.3.6 Animations hover et transitions

- [x] 4.4 Créer HotelCard (components/HotelCard.tsx)
  - [x] 4.4.1 Afficher image, nom, rating, étoiles
  - [x] 4.4.2 Afficher prix à partir de X par nuit
  - [x] 4.4.3 Calculer et afficher distance si géolocalisation active
  - [x] 4.4.4 Afficher amenities (Piscine, Spa, etc.) en tags
  - [x] 4.4.5 Lien vers page détail de l'hôtel
  - [x] 4.4.6 Animations hover et transitions

- [x] 4.5 Créer DatingProfileCard (components/DatingProfileCard.tsx)
  - [x] 4.5.1 Afficher photo, prénom, âge, genre
  - [x] 4.5.2 Afficher ville avec icône MapPin
  - [x] 4.5.3 Afficher description (line-clamp-2)
  - [x] 4.5.4 Afficher centres d'intérêt en tags roses
  - [x] 4.5.5 Bouton "Demander le contact" qui ouvre chat avec intermédiaire
  - [x] 4.5.6 Badge de statut (Disponible/Indisponible)
  - [x] 4.5.7 Message de confidentialité sous le bouton

- [x] 4.6 Créer GeolocationCapture (components/GeolocationCapture.tsx)
  - [x] 4.6.1 Afficher message d'avertissement personnalisable
  - [x] 4.6.2 Bouton "Capturer ma position" avec icône MapPin
  - [x] 4.6.3 Afficher loader pendant la capture
  - [x] 4.6.4 Afficher erreur si permission refusée
  - [x] 4.6.5 Afficher coordonnées capturées avec icône de succès
  - [x] 4.6.6 Callback onLocationCaptured avec lat/lng

- [x] 4.7 Créer ProductQuotaDisplay (components/ProductQuotaDisplay.tsx)
  - [x] 4.7.1 Afficher quota actuel (X / Y produits)
  - [x] 4.7.2 Barre de progression avec couleurs (bleu < 80%, jaune 80-90%, rouge > 90%)
  - [x] 4.7.3 Bouton "Mettre à niveau" si quota >= 80%
  - [x] 4.7.4 Message d'alerte si quota critique
  - [x] 4.7.5 Intégrer avec licenseStore.productUsage
  - [x] 4.7.6 Gérer cas quota illimité (∞)

## Phase 5: Pages Principales

- [x] 5.1 Créer page Restaurants (app/restaurants/page.tsx)
  - [x] 5.1.1 Header avec titre et description
  - [x] 5.1.2 Barre de recherche avec icône Search
  - [x] 5.1.3 Bouton "Près de moi" pour activer géolocalisation
  - [x] 5.1.4 Bouton "Filtres" pour afficher/masquer panneau de filtres
  - [x] 5.1.5 Panneau de filtres avec gamme de prix, distance, ville
  - [x] 5.1.6 Grille de RestaurantCard avec animations
  - [x] 5.1.7 État de chargement avec spinner
  - [x] 5.1.8 Message si aucun résultat
  - [x] 5.1.9 Intégrer avec categoryStore et geolocationStore

- [x] 5.2 Créer page Hôtels (app/hotels/page.tsx)
  - [x] 5.2.1 Header avec titre et description
  - [x] 5.2.2 Barre de recherche avec icône Search
  - [x] 5.2.3 Bouton "Près de moi" pour activer géolocalisation
  - [x] 5.2.4 Bouton "Filtres" pour afficher/masquer panneau de filtres
  - [x] 5.2.5 Panneau de filtres avec étoiles, prix, distance, ville, amenities
  - [x] 5.2.6 Grille de HotelCard avec animations
  - [x] 5.2.7 État de chargement avec spinner
  - [x] 5.2.8 Message si aucun résultat
  - [x] 5.2.9 Intégrer avec categoryStore et geolocationStore

- [x] 5.3 Créer page Rencontres (app/dating/page.tsx)
  - [x] 5.3.1 Header avec icône Heart et titre
  - [x] 5.3.2 Barre de recherche
  - [x] 5.3.3 Bouton "Filtres" pour afficher/masquer panneau
  - [x] 5.3.4 Panneau de filtres avec genre, âge (min/max), ville
  - [x] 5.3.5 Notice de confidentialité en haut (bg-blue-50)
  - [x] 5.3.6 Grille de DatingProfileCard avec animations
  - [x] 5.3.7 Filtrage côté client par âge et genre
  - [x] 5.3.8 État de chargement avec spinner
  - [x] 5.3.9 Message si aucun résultat avec icône Heart

- [x] 5.4 Créer page Ajout d'établissement (app/dashboard/fournisseur/add-listing/page.tsx)
  - [x] 5.4.1 Afficher ProductQuotaDisplay en haut
  - [x] 5.4.2 Sélecteur de type (Restaurant / Hôtel)
  - [x] 5.4.3 Composant GeolocationCapture avec message personnalisé
  - [x] 5.4.4 Formulaire informations de base (nom, description, adresse, ville, téléphone)
  - [x] 5.4.5 Upload d'images avec preview et compteur
  - [x] 5.4.6 Champs spécifiques restaurant (type cuisine, prix, horaires, features)
  - [x] 5.4.7 Champs spécifiques hôtel (étoiles, types chambres, horaires check-in/out, amenities)
  - [x] 5.4.8 Vérifier quota avant soumission
  - [x] 5.4.9 Uploader images vers Firebase Storage
  - [x] 5.4.10 Créer produit avec createMultiCategoryProduct
  - [x] 5.4.11 Rediriger vers liste produits après succès
  - [x] 5.4.12 Afficher LicenseUpgradeModal si quota atteint

- [x] 5.5 Créer page Ajout profil rencontre (app/dashboard/fournisseur/add-dating-profile/page.tsx)
  - [x] 5.5.1 Afficher ProductQuotaDisplay en haut
  - [x] 5.5.2 Formulaire informations profil (prénom, âge, genre, ville)
  - [x] 5.5.3 Champs optionnels (taille, couleur peau, yeux, profession, intérêts)
  - [x] 5.5.4 Upload photos (min 2, max 8)
  - [x] 5.5.5 Section informations de contact (téléphone, email, WhatsApp) - privées
  - [x] 5.5.6 Message d'avertissement sur confidentialité
  - [x] 5.5.7 Validation âge minimum 18 ans
  - [x] 5.5.8 Vérifier quota avant soumission
  - [x] 5.5.9 Créer profil avec createMultiCategoryProduct
  - [x] 5.5.10 Statut initial 'pending_verification' pour admin

- [ ] 5.6 Créer page Gestion licences fournisseur (app/dashboard/fournisseur/licenses/page.tsx)
  - [x] 5.6.1 Afficher licence actuelle avec détails (tier, quota, expiration)
  - [x] 5.6.2 Afficher ProductQuotaDisplay
  - [x] 5.6.3 Tableau comparatif des licences disponibles
  - [x] 5.6.4 Bouton "Mettre à niveau" pour chaque licence supérieure
  - [x] 5.6.5 Historique des abonnements
  - [x] 5.6.6 Option auto-renouvellement
  - [x] 5.6.7 Intégrer avec licenseStore

## Phase 6: Pages Admin

- [ ] 6.1 Créer page Admin Licences (app/dashboard/admin/licenses/page.tsx)
  - [ ] 6.1.1 Liste de tous les fournisseurs avec leur licence actuelle
  - [ ] 6.1.2 Filtres par tier de licence
  - [ ] 6.1.3 Afficher date d'expiration et statut
  - [ ] 6.1.4 Actions: Upgrade manuel, Extension date, Licence gratuite promo
  - [ ] 6.1.5 Statistiques de revenus par tier
  - [ ] 6.1.6 Export CSV des abonnements
  - [ ] 6.1.7 Notifications pour expirations proches

- [ ] 6.2 Créer page Admin Demandes de contact (app/dashboard/admin/contact-requests/page.tsx)
  - [ ] 6.2.1 Liste de toutes les demandes de contact
  - [ ] 6.2.2 Filtres par statut (pending, approved, rejected, shared)
  - [ ] 6.2.3 Afficher profil concerné et client demandeur
  - [ ] 6.2.4 Afficher intermédiaire responsable
  - [ ] 6.2.5 Statistiques des demandes par statut
  - [ ] 6.2.6 Graphique des demandes dans le temps

- [ ] 6.3 Créer page Admin Vérification profils (app/dashboard/admin/verify-profiles/page.tsx)
  - [ ] 6.3.1 Liste des profils de rencontres en attente de vérification
  - [ ] 6.3.2 Afficher photos et informations du profil
  - [ ] 6.3.3 Boutons Approuver / Rejeter
  - [ ] 6.3.4 Champ raison de rejet
  - [ ] 6.3.5 Notification à l'intermédiaire après décision
  - [ ] 6.3.6 Badge de vérification sur profils approuvés

## Phase 7: Intégration Homepage

- [ ] 7.1 Mettre à jour la homepage (app/page.tsx)
  - [ ] 7.1.1 Ajouter CategorySelector en haut après le hero
  - [ ] 7.1.2 Section "Restaurants populaires" avec top 6 restaurants
  - [ ] 7.1.3 Section "Hôtels recommandés" avec top 6 hôtels
  - [ ] 7.1.4 Section "Profils en vedette" avec top 6 profils (optionnel)
  - [ ] 7.1.5 Liens "Voir tout" vers chaque catégorie

- [ ] 7.2 Mettre à jour le Header (components/layout/Header.tsx)
  - [ ] 7.2.1 Ajouter menu de navigation avec les 4 catégories
  - [ ] 7.2.2 Dropdown ou mega-menu pour catégories
  - [ ] 7.2.3 Icônes pour chaque catégorie

## Phase 8: Intégration Chat

- [ ] 8.1 Étendre le système de chat existant
  - [ ] 8.1.1 Ajouter paramètre URL pour pré-remplir conversation (intermediary, profile)
  - [ ] 8.1.2 Afficher carte de profil dans la conversation
  - [ ] 8.1.3 Bouton "Marquer contact comme partagé" pour intermédiaire
  - [ ] 8.1.4 Créer ContactRequest automatiquement lors de l'ouverture du chat

## Phase 9: Firebase Configuration

- [ ] 9.1 Créer collection licenses dans Firestore
  - [ ] 9.1.1 Ajouter document pour Free tier (5 produits, $0)
  - [ ] 9.1.2 Ajouter document pour Basic tier (50 produits, $99)
  - [ ] 9.1.3 Ajouter document pour Premium tier (200 produits, $299)
  - [ ] 9.1.4 Ajouter document pour Enterprise tier (illimité, $999)

- [ ] 9.2 Créer collection subscriptions dans Firestore
  - [ ] 9.2.1 Définir structure avec index sur fournisseurId et status

- [ ] 9.3 Créer collection productUsage dans Firestore
  - [ ] 9.3.1 Définir structure avec document par fournisseurId

- [ ] 9.4 Créer collection contactRequests dans Firestore
  - [ ] 9.4.1 Définir structure avec index sur intermediaryId et status

- [ ] 9.5 Mettre à jour Firestore indexes
  - [ ] 9.5.1 Index composite: products (serviceCategory, isActive, createdAt)
  - [ ] 9.5.2 Index composite: products (serviceCategory, location.city)
  - [ ] 9.5.3 Index composite: subscriptions (fournisseurId, status)
  - [ ] 9.5.4 Index composite: contactRequests (intermediaryId, status)

- [ ] 9.6 Mettre à jour Firestore Security Rules
  - [ ] 9.6.1 Règles pour collection licenses (lecture publique, écriture admin)
  - [ ] 9.6.2 Règles pour collection subscriptions (lecture propriétaire, écriture admin)
  - [ ] 9.6.3 Règles pour collection productUsage (lecture propriétaire, écriture système)
  - [ ] 9.6.4 Règles pour collection contactRequests (lecture parties concernées, écriture client)
  - [ ] 9.6.5 Règles pour products avec serviceCategory 'dating' (masquer contactInfo)

## Phase 10: Tests et Validation

- [ ] 10.1 Tester le système de licences
  - [ ] 10.1.1 Vérifier blocage à quota atteint
  - [ ] 10.1.2 Vérifier mise à niveau de licence
  - [ ] 10.1.3 Vérifier calcul correct du quota
  - [ ] 10.1.4 Vérifier expiration annuelle

- [ ] 10.2 Tester la géolocalisation
  - [ ] 10.2.1 Vérifier capture de position
  - [ ] 10.2.2 Vérifier calcul de distance
  - [ ] 10.2.3 Vérifier tri par distance
  - [ ] 10.2.4 Vérifier filtres de distance

- [ ] 10.3 Tester la confidentialité des profils
  - [ ] 10.3.1 Vérifier que contactInfo n'est pas visible côté client
  - [ ] 10.3.2 Vérifier création de ContactRequest
  - [ ] 10.3.3 Vérifier ouverture du chat avec intermédiaire
  - [ ] 10.3.4 Vérifier notifications

- [ ] 10.4 Tester les filtres multi-catégories
  - [ ] 10.4.1 Tester filtres restaurants (cuisine, prix, features)
  - [ ] 10.4.2 Tester filtres hôtels (étoiles, amenities)
  - [ ] 10.4.3 Tester filtres rencontres (genre, âge, ville)

- [ ] 10.5 Tests d'intégration
  - [ ] 10.5.1 Parcours complet ajout restaurant avec géolocalisation
  - [ ] 10.5.2 Parcours complet ajout profil rencontre avec demande de contact
  - [ ] 10.5.3 Parcours complet upgrade de licence
  - [ ] 10.5.4 Vérifier compteurs et statistiques

## Phase 11: Documentation et Déploiement

- [ ] 11.1 Documenter les nouveaux stores Zustand
  - [ ] 11.1.1 Documentation categoryStore
  - [ ] 11.1.2 Documentation licenseStore
  - [ ] 11.1.3 Documentation geolocationStore

- [ ] 11.2 Documenter les nouvelles fonctions Firebase
  - [ ] 11.2.1 Documentation licenses.ts
  - [ ] 11.2.2 Documentation products.ts (extensions)
  - [ ] 11.2.3 Documentation contactRequests.ts

- [ ] 11.3 Créer guide utilisateur
  - [ ] 11.3.1 Guide ajout restaurant/hôtel
  - [ ] 11.3.2 Guide ajout profil rencontre
  - [ ] 11.3.3 Guide gestion licences
  - [ ] 11.3.4 Guide demande de contact

- [ ] 11.4 Déploiement
  - [ ] 11.4.1 Vérifier variables d'environnement
  - [ ] 11.4.2 Déployer Firestore indexes
  - [ ] 11.4.3 Déployer Security Rules
  - [ ] 11.4.4 Initialiser collection licenses
  - [ ] 11.4.5 Build et déploiement production

