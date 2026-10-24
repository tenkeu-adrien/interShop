# 🎨 Guide Gestion des Slides - Admin

## 📍 Accès à la page de gestion

1. Se connecter en tant qu'**Admin**
2. Aller dans le menu > **Dashboard Admin**
3. Cliquer sur **"Gestion des Slides"** ou aller sur `/dashboard/admin/slides`

---

## ✨ Créer un nouveau slide

### Étape 1 : Cliquer sur "Nouveau Slide"

### Étape 2 : Remplir les informations

#### **Titre** (obligatoire)
- Texte principal du slide
- Exemple : "Découvrez nos nouveautés"
- Affiché en gros à gauche du slide

#### **Description** (obligatoire)
- Texte descriptif sous le titre
- Exemple : "Des produits de qualité à prix imbattables"
- 2-3 lignes maximum recommandé

#### **Couleur de fond**
- Cliquer sur le sélecteur de couleur
- Choisir la couleur de fond du slide
- Exemple : `#F5F5F5` (gris clair)

#### **Couleur du bouton**
- Cliquer sur le sélecteur de couleur
- Choisir la couleur du bouton d'action
- Exemple : `#FF5722` (orange)

#### **Texte du bouton**
- Texte affiché sur le bouton
- Exemple : "Découvrir", "En savoir plus", "Voir les produits"

#### **Lien du bouton**
- URL vers laquelle le bouton redirige
- Exemples :
  - `/products` - Liste des produits
  - `/products?category=Electronics` - Catégorie spécifique
  - `/deals` - Promotions
  - `/boutiques` - Liste des boutiques

#### **Image d'illustration** (obligatoire)
- Cliquer sur "Choisir un fichier"
- Sélectionner une image (JPG, PNG, etc.)
- **Recommandations :**
  - Format : **carré ou paysage**
  - Taille : **800x800px minimum**
  - Poids : **< 500KB** pour un chargement rapide
- L'image s'affichera **à droite** du slide

#### **Slide actif**
- ☑️ Coché = Le slide s'affiche sur la page d'accueil
- ☐ Décoché = Le slide est masqué (brouillon)

### Étape 3 : Cliquer sur "Créer"

Le slide est créé et ajouté à la fin de la liste.

---

## ✏️ Modifier un slide existant

1. Dans la liste des slides, cliquer sur l'icône **✏️ Modifier**
2. Modifier les informations souhaitées
3. Pour changer l'image : sélectionner une nouvelle image
4. Cliquer sur **"Mettre à jour"**

---

## 🔄 Gérer l'ordre des slides

Les slides s'affichent dans l'ordre défini dans la liste.

### Monter un slide
- Cliquer sur **⬆️ Flèche haut** pour faire monter le slide dans la liste

### Descendre un slide
- Cliquer sur **⬇️ Flèche bas** pour faire descendre le slide dans la liste

**Note :** L'ordre dans la liste = l'ordre d'affichage sur la page d'accueil

---

## 👁️ Activer/Désactiver un slide

- **👁️ Œil ouvert** (vert) = Slide actif (visible)
- **👁️ Œil barré** (gris) = Slide inactif (masqué)

Cliquer sur l'icône pour basculer entre actif/inactif.

**Astuce :** Désactiver un slide permet de le garder en brouillon sans le supprimer.

---

## 🗑️ Supprimer un slide

1. Cliquer sur l'icône **🗑️ Poubelle**
2. Confirmer la suppression
3. Le slide est supprimé définitivement

**⚠️ Attention :** La suppression est irréversible !

---

## 🎨 Exemples de slides

### Slide 1 : Promotions
```
Titre: Soldes d'été jusqu'à -50%
Description: Profitez de réductions exceptionnelles sur une sélection de produits
Couleur fond: #FFF3E0 (orange clair)
Couleur bouton: #FF5722 (orange vif)
Texte bouton: Voir les promotions
Lien: /deals
Image: slide1.jpeg (image de produits en promotion)
```

### Slide 2 : Nouveautés
```
Titre: Découvrez nos nouveautés
Description: Les derniers produits ajoutés par nos fournisseurs de confiance
Couleur fond: #E8F5E9 (vert clair)
Couleur bouton: #4CAF50 (vert)
Texte bouton: Explorer
Lien: /products?sort=newest
Image: slide2.jpeg (nouveaux produits)
```

### Slide 3 : Catégorie mise en avant
```
Titre: High-Tech & Électronique
Description: Smartphones, ordinateurs, accessoires et bien plus encore
Couleur fond: #E3F2FD (bleu clair)
Couleur bouton: #2196F3 (bleu)
Texte bouton: Voir la catégorie
Lien: /products?category=Electronics
Image: slide3.jpeg (produits électroniques)
```

---

## 🖼️ Prévisualisation en temps réel

### Sur la page de gestion
Chaque slide affiche :
- Aperçu de l'image (miniature)
- Titre et description
- Indicateurs de couleurs (fond + bouton)
- Prévisualisation du bouton avec sa couleur

### Sur la page d'accueil
Le slider affiche :
- **Auto-play** : Change automatiquement toutes les **5 secondes**
- **Navigation manuelle** : Flèches gauche/droite pour changer de slide
- **Indicateurs** : Points en bas pour voir le slide actif et naviguer
- **Responsive** : S'adapte à tous les écrans

---

## 📊 Bonnes pratiques

### Design
- ✅ Utiliser des couleurs contrastées (fond clair + bouton foncé ou inverse)
- ✅ Titre court et percutant (5-8 mots maximum)
- ✅ Description claire (1-2 phrases)
- ✅ Images de haute qualité et bien cadrées

### Contenu
- ✅ Mettre en avant les promotions, nouveautés, catégories populaires
- ✅ Changer régulièrement les slides pour garder le site dynamique
- ✅ Tester les liens avant de publier un slide
- ✅ Désactiver les slides obsolètes au lieu de les supprimer

### Performance
- ✅ Optimiser les images (compression)
- ✅ Limiter à **3-5 slides actifs** maximum
- ✅ Éviter les images trop lourdes (> 1MB)

### Organisation
- ✅ Nommer les slides de façon claire
- ✅ Garder les slides saisonniers (Noël, etc.) inactifs hors saison
- ✅ Vérifier régulièrement les liens des boutons

---

## 🔍 Ordre d'affichage recommandé

1. **Slide principal** : Promotion/nouveauté du moment
2. **Slide secondaire** : Catégorie populaire ou collection
3. **Slide tertiaire** : Message général ou valeur ajoutée

---

## 🚀 Workflow recommandé

### Nouveau slide
1. Créer le slide en mode **inactif** (brouillon)
2. Vérifier les couleurs et l'image
3. Tester le lien du bouton
4. Activer le slide une fois validé

### Mise à jour saisonnière
1. Désactiver les anciens slides
2. Créer/activer les nouveaux slides
3. Ajuster l'ordre si nécessaire

### Maintenance régulière
- Vérifier les liens une fois par mois
- Renouveler le contenu tous les 2-3 mois
- Supprimer les slides obsolètes

---

## ❓ FAQ

### Combien de slides peut-on créer ?
Autant que vous voulez ! Seuls les slides **actifs** s'affichent sur la page d'accueil.

### Les slides s'affichent dans quel ordre ?
Dans l'ordre de la liste. Utilisez les flèches ⬆️⬇️ pour réorganiser.

### Peut-on avoir un slide sans bouton ?
Non, le bouton est obligatoire. Mais vous pouvez mettre un texte neutre comme "En savoir plus" et un lien vers `/products`.

### Comment masquer temporairement un slide ?
Cliquez sur l'icône 👁️ pour le désactiver. Il restera dans la liste mais ne s'affichera pas.

### Que se passe-t-il si aucun slide n'est actif ?
Le slider ne s'affiche pas sur la page d'accueil. La liste des produits commence directement.

### Les slides sont-ils visibles par tous les visiteurs ?
Oui, tous les slides **actifs** sont visibles sur la page d'accueil, même pour les visiteurs non connectés.

---

## 🎓 Tutoriel pas à pas (première utilisation)

### Créer votre premier slide en 3 minutes

1. **Connexion**
   - Connectez-vous en tant qu'admin
   - Allez sur `/fr/dashboard/admin/slides`

2. **Préparation de l'image**
   - Préparez 1 image (ex: produit phare, promotion)
   - Format recommandé : 800x800px
   - Sauvegardez-la sur votre ordinateur

3. **Création du slide**
   - Cliquez sur "Nouveau Slide"
   - Titre : "Bienvenue sur InterShop"
   - Description : "Découvrez des milliers de produits de qualité"
   - Couleur fond : `#F5F5F5` (gris clair)
   - Couleur bouton : `#FF5722` (orange)
   - Texte bouton : "Découvrir"
   - Lien : `/products`
   - Sélectionnez votre image
   - Cochez "Slide actif"
   - Cliquez sur "Créer"

4. **Vérification**
   - Allez sur la page d'accueil (`/fr`)
   - Votre slide devrait s'afficher en haut de la page !

5. **Ajout d'autres slides** (optionnel)
   - Répétez le processus pour créer 2-3 slides supplémentaires
   - Utilisez les flèches pour ajuster l'ordre
   - Regardez l'auto-play en action sur la page d'accueil

---

**Bravo ! Vous maîtrisez maintenant la gestion des slides.** 🎉

Pour toute question, consultez la documentation technique dans le projet.
