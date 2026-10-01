# 🖼️ Guide d'optimisation des images - InterShop

## ✅ Optimisations appliquées

### 1. **Composant LazyImage créé**
Un wrapper autour de `next/image` avec :
- ✅ Lazy loading automatique
- ✅ Placeholder animé pendant le chargement
- ✅ Gestion des erreurs (fallback)
- ✅ Transition fluide lors du chargement

### 2. **Configuration Next.js**
Les images sont optimisées automatiquement par Next.js :
- ✅ Formats modernes (WebP, AVIF)
- ✅ Responsive images avec `srcset`
- ✅ Optimisation de taille automatique

---

## 🚀 Utilisation du composant LazyImage

### Import
```typescript
import { LazyImage } from '@/components/ui/LazyImage';
```

### Exemples d'utilisation

#### Image simple
```tsx
<LazyImage
  src="/products/phone.jpg"
  alt="iPhone 15 Pro"
  width={400}
  height={400}
  className="rounded-lg"
/>
```

#### Image avec fill (container)
```tsx
<div className="relative w-full h-64">
  <LazyImage
    src={product.image}
    alt={product.name}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="object-cover rounded-lg"
  />
</div>
```

#### Image prioritaire (au-dessus de la ligne de flottaison)
```tsx
<LazyImage
  src="/hero-banner.jpg"
  alt="Bannière principale"
  width={1920}
  height={600}
  priority={true}
  className="w-full"
/>
```

---

## 🎨 Configuration next.config.js

Assurez-vous que votre `next.config.js` inclut :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Domaines autorisés pour les images externes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Formats d'image optimisés
    formats: ['image/avif', 'image/webp'],
    // Tailles d'images générées
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
```

---

## 📏 Attribut `sizes` expliqué

L'attribut `sizes` indique au navigateur quelle taille d'image charger selon la largeur de l'écran :

```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

**Signification :**
- Mobile (≤768px) : image = 100% de la largeur de l'écran
- Tablette (≤1200px) : image = 50% de la largeur de l'écran
- Desktop (>1200px) : image = 33% de la largeur de l'écran

### Exemples pour différents cas

#### Galerie de produits (grille)
```tsx
// 1 colonne mobile, 2 tablette, 4 desktop
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
```

#### Bannière pleine largeur
```tsx
sizes="100vw"
```

#### Avatar utilisateur
```tsx
sizes="(max-width: 640px) 48px, 64px"
```

#### Image de détail produit
```tsx
// 100% mobile, 60% tablette, 50% desktop
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
```

---

## 🎯 Bonnes pratiques

### 1. **Toujours spécifier width et height**
```tsx
// ✅ BON
<LazyImage src="/image.jpg" alt="..." width={400} height={300} />

// ❌ MAUVAIS (cause layout shift)
<LazyImage src="/image.jpg" alt="..." />
```

### 2. **Utiliser priority pour images au-dessus de la ligne de flottaison**
```tsx
// Hero banner, logo, première image visible
<LazyImage src="/hero.jpg" alt="..." width={1920} height={600} priority />
```

### 3. **Lazy load pour tout le reste**
```tsx
// Images en bas de page, galeries
<LazyImage src="/product.jpg" alt="..." width={400} height={400} />
// loading="lazy" est automatique
```

### 4. **Utiliser fill pour images responsive**
```tsx
<div className="relative aspect-square">
  <LazyImage
    src="/image.jpg"
    alt="..."
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover"
  />
</div>
```

### 5. **Optimiser les images avant upload**
- Réduire la résolution (max 2048px pour la plupart des cas)
- Compresser avec des outils (TinyPNG, ImageOptim)
- Utiliser des formats modernes si possible (WebP, AVIF)

---

## 🔧 Migration des anciennes images

### Avant (sans optimisation)
```tsx
<img src={product.image} alt={product.name} className="w-full" />
```

### Après (optimisé)
```tsx
<LazyImage
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  sizes="(max-width: 768px) 100vw, 50vw"
  className="w-full"
/>
```

---

## 📊 Patterns d'utilisation communs

### Grille de produits
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {products.map((product) => (
    <div key={product.id} className="relative aspect-square">
      <LazyImage
        src={product.image}
        alt={product.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover rounded-lg"
      />
    </div>
  ))}
</div>
```

### Détail produit avec zoom
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div className="relative aspect-square">
    <LazyImage
      src={product.mainImage}
      alt={product.name}
      fill
      sizes="(max-width: 1024px) 100vw, 50vw"
      className="object-contain"
      priority
    />
  </div>
  <div className="grid grid-cols-4 gap-2">
    {product.images.map((img, idx) => (
      <div key={idx} className="relative aspect-square">
        <LazyImage
          src={img}
          alt={`${product.name} ${idx + 1}`}
          fill
          sizes="15vw"
          className="object-cover rounded cursor-pointer"
        />
      </div>
    ))}
  </div>
</div>
```

### Carousel/Slider
```tsx
{slides.map((slide, idx) => (
  <div key={idx} className="relative w-full h-96">
    <LazyImage
      src={slide.image}
      alt={slide.title}
      fill
      sizes="100vw"
      priority={idx === 0} // Première image prioritaire
      className="object-cover"
    />
  </div>
))}
```

### Avatar utilisateur
```tsx
<div className="relative w-12 h-12 rounded-full overflow-hidden">
  <LazyImage
    src={user.photoURL || '/default-avatar.png'}
    alt={user.displayName}
    fill
    sizes="48px"
    className="object-cover"
  />
</div>
```

---

## ⚡ Performance attendue

### Avant optimisation
- 📦 Taille des images : 200-500 KB par image
- ⏱️ Temps de chargement : 2-5 secondes
- 🐌 Format : JPG/PNG non optimisé
- ❌ Pas de lazy loading

### Après optimisation
- 📦 Taille des images : 20-50 KB (WebP)
- ⏱️ Temps de chargement : < 500ms
- ⚡ Format : WebP/AVIF optimisé
- ✅ Lazy loading automatique

**Gain :** 80-90% de réduction de bande passante !

---

## 🛠️ Outils recommandés

### Compression d'images
- [TinyPNG](https://tinypng.com/) - Compression en ligne
- [Squoosh](https://squoosh.app/) - App Google pour optimisation
- [ImageOptim](https://imageoptim.com/) - App Mac
- [Sharp](https://sharp.pixelplumbing.com/) - CLI Node.js

### Analyse de performance
```bash
# Lighthouse dans Chrome DevTools
# Vérifier les scores:
# - Performance
# - Largest Contentful Paint (LCP)
# - Cumulative Layout Shift (CLS)
```

---

## 🚨 Erreurs courantes à éviter

### 1. Images sans dimensions
```tsx
// ❌ MAUVAIS - Cause layout shift
<LazyImage src="/image.jpg" alt="..." />

// ✅ BON
<LazyImage src="/image.jpg" alt="..." width={400} height={300} />
```

### 2. Tout marquer priority
```tsx
// ❌ MAUVAIS - Annule le lazy loading
{products.map(p => (
  <LazyImage src={p.image} priority /> // NON!
))}

// ✅ BON - Seulement première image
<LazyImage src={hero} priority />
{products.map(p => (
  <LazyImage src={p.image} /> // Lazy load
))}
```

### 3. Oublier sizes avec fill
```tsx
// ⚠️ PAS OPTIMAL
<LazyImage src="/image.jpg" fill />

// ✅ BON
<LazyImage 
  src="/image.jpg" 
  fill 
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 4. Images trop grandes
```tsx
// ❌ MAUVAIS - Upload 4K pour afficher 400px
<LazyImage src="/product-4k.jpg" width={400} height={400} />

// ✅ BON - Réduire avant upload ou laisser Next.js optimiser
```

---

## 📝 Checklist d'optimisation

- [ ] Remplacer toutes les balises `<img>` par `<LazyImage>`
- [ ] Ajouter `width` et `height` sur toutes les images
- [ ] Utiliser `priority` uniquement pour images au-dessus de la ligne de flottaison
- [ ] Définir `sizes` approprié pour images responsive
- [ ] Vérifier que les domaines externes sont dans `remotePatterns`
- [ ] Compresser les images avant upload
- [ ] Tester sur mobile avec throttling réseau
- [ ] Vérifier le score Lighthouse (>90)

---

## 🔗 Ressources utiles

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Responsive Images Guide](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

---

Date : 2024
