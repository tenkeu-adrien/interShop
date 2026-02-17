# 🖼️ Comment Ajouter Votre Logo

## 📍 Emplacement Actuel

Le Header utilise actuellement un logo temporaire avec les initiales "IA":

```tsx
<div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
  <span className="text-2xl font-bold text-white">IA</span>
</div>
```

## 🎯 Étapes pour Ajouter Votre Logo

### Option 1: Logo Image (Recommandé)

#### 1. Préparer Votre Logo
- **Format**: PNG avec fond transparent (ou SVG)
- **Dimensions**: 200x50px (ou ratio similaire)
- **Poids**: < 100KB pour performance optimale
- **Nom**: `logo.png` ou `logo.svg`

#### 2. Placer le Fichier
```
alibaba-clone/
└── public/
    └── logo.png  ← Placez votre logo ici
```

#### 3. Modifier le Header
Ouvrez `components/layout/Header.tsx` et remplacez la section logo (ligne ~100):

**Avant**:
```tsx
<Link href="/">
  <Image
    src="/logo.png"
    alt="InterAppshop"
    className="object-contain h-auto"
    width={200}
    height={50}
    priority={true}
    sizes="(max-width: 768px) 200px, 300px"
  />
</Link>
```

**Après** (si votre logo a des dimensions différentes):
```tsx
<Link href="/" className="flex items-center">
  <Image
    src="/logo.png"
    alt="InterAppshop"
    width={250}  // Ajustez selon votre logo
    height={60}  // Ajustez selon votre logo
    priority
    className="object-contain"
  />
</Link>
```

### Option 2: Logo SVG (Meilleure Qualité)

#### 1. Préparer le SVG
- Exportez votre logo en SVG
- Optimisez-le avec [SVGOMG](https://jakearchibald.github.io/svgomg/)
- Placez-le dans `/public/logo.svg`

#### 2. Utiliser le SVG
```tsx
<Link href="/" className="flex items-center">
  <Image
    src="/logo.svg"
    alt="InterAppshop"
    width={200}
    height={50}
    priority
    className="object-contain"
  />
</Link>
```

### Option 3: Logo avec Texte

Si vous voulez garder le texte "InterAppshop" avec votre logo:

```tsx
<Link href="/" className="flex items-center gap-3">
  <Image
    src="/logo.png"
    alt="Logo"
    width={50}
    height={50}
    priority
    className="object-contain"
  />
  <div className="flex flex-col">
    <span className="text-xl font-bold text-gray-900">InterAppshop</span>
    <span className="text-xs text-gray-600">Marketplace B2B/B2C</span>
  </div>
</Link>
```

## 🎨 Adapter aux Couleurs (Jaune, Vert, Noir)

### Si Votre Logo est Monochrome

Vous pouvez le colorer avec CSS:

```tsx
<Image
  src="/logo.svg"
  alt="InterAppshop"
  width={200}
  height={50}
  priority
  className="object-contain brightness-0 invert"
  style={{ filter: 'hue-rotate(120deg)' }} // Ajustez pour obtenir le vert
/>
```

### Si Votre Logo a Déjà les Bonnes Couleurs

Utilisez-le tel quel:

```tsx
<Image
  src="/logo.png"
  alt="InterAppshop"
  width={200}
  height={50}
  priority
  className="object-contain"
/>
```

## 📱 Responsive Logo

Pour adapter le logo sur mobile:

```tsx
<Link href="/" className="flex items-center">
  <Image
    src="/logo.png"
    alt="InterAppshop"
    width={200}
    height={50}
    priority
    className="object-contain hidden md:block" // Desktop
  />
  <Image
    src="/logo-mobile.png"
    alt="InterAppshop"
    width={40}
    height={40}
    priority
    className="object-contain md:hidden" // Mobile
  />
</Link>
```

## 🔧 Dimensions Recommandées

### Desktop
- **Largeur**: 180-250px
- **Hauteur**: 40-60px
- **Ratio**: 4:1 ou 5:1

### Mobile
- **Largeur**: 120-150px
- **Hauteur**: 30-40px
- **Ou**: Logo carré 40x40px

## 🎯 Exemples de Code Complet

### Exemple 1: Logo Simple
```tsx
<Link href="/" className="flex items-center">
  <Image
    src="/logo.png"
    alt="InterAppshop"
    width={200}
    height={50}
    priority
  />
</Link>
```

### Exemple 2: Logo + Texte
```tsx
<Link href="/" className="flex items-center gap-3">
  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
    <Image
      src="/icon.png"
      alt="Icon"
      width={32}
      height={32}
    />
  </div>
  <div className="flex flex-col">
    <span className="text-xl font-bold text-gray-900">InterAppshop</span>
    <span className="text-xs text-gray-600">Marketplace B2B/B2C</span>
  </div>
</Link>
```

### Exemple 3: Logo Responsive
```tsx
<Link href="/" className="flex items-center">
  {/* Desktop */}
  <div className="hidden md:flex items-center gap-3">
    <Image
      src="/logo.png"
      alt="InterAppshop"
      width={200}
      height={50}
      priority
    />
  </div>
  
  {/* Mobile */}
  <div className="md:hidden">
    <Image
      src="/logo-icon.png"
      alt="InterAppshop"
      width={40}
      height={40}
      priority
    />
  </div>
</Link>
```

## 🖼️ Créer un Logo Temporaire

Si vous n'avez pas encore de logo, voici comment créer un placeholder professionnel:

### Option 1: Initiales Stylisées (Actuel)
```tsx
<div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
  <span className="text-2xl font-bold text-white">IA</span>
</div>
```

### Option 2: Icône + Texte
```tsx
<div className="flex items-center gap-2">
  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
    <Package className="text-white" size={24} />
  </div>
  <span className="text-xl font-bold text-gray-900">InterAppshop</span>
</div>
```

### Option 3: Badge Moderne
```tsx
<div className="flex items-center gap-2">
  <div className="relative">
    <div className="w-10 h-10 bg-green-500 rounded-full"></div>
    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white"></div>
  </div>
  <span className="text-xl font-bold text-gray-900">InterAppshop</span>
</div>
```

## 🎨 Outils pour Créer un Logo

### Gratuits
1. **Canva**: https://www.canva.com/
2. **Figma**: https://www.figma.com/
3. **LogoMakr**: https://logomakr.com/
4. **Hatchful**: https://www.shopify.com/tools/logo-maker

### Payants
1. **Looka**: https://looka.com/
2. **Tailor Brands**: https://www.tailorbrands.com/
3. **Fiverr**: Designers professionnels

## ✅ Checklist

Avant de déployer votre logo:

- [ ] Logo optimisé (< 100KB)
- [ ] Format PNG ou SVG
- [ ] Fond transparent
- [ ] Dimensions correctes
- [ ] Testé sur mobile
- [ ] Testé sur desktop
- [ ] Contraste suffisant
- [ ] Lisible à petite taille
- [ ] Cohérent avec la charte (jaune, vert, noir)

## 🐛 Problèmes Courants

### Le logo ne s'affiche pas
1. Vérifiez le chemin: `/public/logo.png`
2. Vérifiez le nom du fichier (sensible à la casse)
3. Redémarrez le serveur: `npm run dev`

### Le logo est flou
1. Utilisez une image haute résolution (2x)
2. Utilisez SVG pour une qualité parfaite
3. Vérifiez la compression

### Le logo est trop grand/petit
1. Ajustez `width` et `height` dans le composant Image
2. Utilisez `className="object-contain"` pour garder le ratio
3. Testez sur différentes tailles d'écran

## 📞 Besoin d'Aide?

Si vous avez des questions:
1. Vérifiez la documentation Next.js Image: https://nextjs.org/docs/api-reference/next/image
2. Consultez les exemples ci-dessus
3. Testez avec un logo temporaire d'abord

---

**Conseil**: Commencez avec un logo simple et améliorez-le progressivement!
