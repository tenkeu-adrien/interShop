# Guide d'Implémentation - Recherche par Image

## Vue d'ensemble

La recherche par image permet aux utilisateurs de télécharger une photo d'un produit pour trouver des produits similaires sur la plateforme, même sans connaître le nom du produit.

## Architecture

```
┌─────────────────┐
│   Client        │
│  (Upload Image) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Firebase Storage│ ← Upload de l'image
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cloud Vision API│ ← Analyse de l'image
│  (Google Cloud) │    (labels, couleurs, objets)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore     │ ← Recherche des produits
│   (Products)    │    avec tags similaires
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Résultats      │
│  (Produits)     │
└─────────────────┘
```

## Étapes d'Implémentation

### 1. Configuration Google Cloud Vision API

#### A. Activer l'API dans Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionner votre projet Firebase
3. Aller dans "APIs & Services" > "Library"
4. Rechercher "Cloud Vision API"
5. Cliquer sur "Enable"

#### B. Créer une clé API

1. Aller dans "APIs & Services" > "Credentials"
2. Cliquer sur "Create Credentials" > "API Key"
3. Copier la clé API
4. (Optionnel) Restreindre la clé à "Cloud Vision API" uniquement

#### C. Ajouter la clé dans `.env.local`

```env
NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY=votre_cle_api_ici
```

### 2. Structure des Données

#### A. Ajouter des champs aux produits

Modifier le type `Product` pour inclure des tags d'image:

```typescript
interface Product {
  // ... champs existants
  imageTags?: string[];        // Tags extraits des images
  dominantColors?: string[];   // Couleurs dominantes
  imageLabels?: string[];      // Labels de l'image (objet, scène, etc.)
}
```

#### B. Indexer les produits existants

Créer un script pour analyser toutes les images de produits existants et extraire leurs tags.

### 3. Flux Utilisateur

```
1. Utilisateur clique sur l'icône caméra 📷
2. Sélectionne une image depuis son appareil
3. Image uploadée sur Firebase Storage
4. Image analysée par Cloud Vision API
5. Tags extraits (ex: "smartphone", "noir", "électronique")
6. Recherche dans Firestore des produits avec tags similaires
7. Affichage des résultats triés par pertinence
```

## Implémentation du Code

### 1. Service de Recherche par Image

```typescript
// lib/services/imageSearchService.ts

interface VisionAPIResponse {
  responses: Array<{
    labelAnnotations?: Array<{
      description: string;
      score: number;
    }>;
    imagePropertiesAnnotation?: {
      dominantColors: {
        colors: Array<{
          color: { red: number; green: number; blue: number };
          score: number;
          pixelFraction: number;
        }>;
      };
    };
  }>;
}

export async function analyzeImage(imageUrl: string): Promise<{
  labels: string[];
  colors: string[];
}> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { source: { imageUri: imageUrl } },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'IMAGE_PROPERTIES', maxResults: 5 },
            ],
          },
        ],
      }),
    }
  );

  const data: VisionAPIResponse = await response.json();
  const result = data.responses[0];

  // Extraire les labels
  const labels = result.labelAnnotations
    ?.filter(label => label.score > 0.7)
    .map(label => label.description.toLowerCase()) || [];

  // Extraire les couleurs dominantes
  const colors = result.imagePropertiesAnnotation?.dominantColors.colors
    .slice(0, 3)
    .map(c => rgbToHex(c.color.red, c.color.green, c.color.blue)) || [];

  return { labels, colors };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export async function searchProductsByImage(
  labels: string[],
  colors: string[]
): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  
  // Recherche par tags
  const queries = labels.slice(0, 3).map(label =>
    query(
      productsRef,
      where('imageTags', 'array-contains', label),
      where('isActive', '==', true),
      limit(20)
    )
  );

  const results = await Promise.all(
    queries.map(q => getDocs(q))
  );

  // Fusionner et dédupliquer les résultats
  const productsMap = new Map<string, Product>();
  
  results.forEach(snapshot => {
    snapshot.docs.forEach(doc => {
      const product = { id: doc.id, ...doc.data() } as Product;
      
      // Calculer un score de pertinence
      const matchingLabels = labels.filter(label =>
        product.imageTags?.includes(label) ||
        product.tags?.includes(label) ||
        product.name.toLowerCase().includes(label)
      ).length;

      const matchingColors = colors.filter(color =>
        product.dominantColors?.includes(color)
      ).length;

      const relevanceScore = matchingLabels * 2 + matchingColors;

      if (!productsMap.has(product.id) || 
          (productsMap.get(product.id) as any).relevanceScore < relevanceScore) {
        (product as any).relevanceScore = relevanceScore;
        productsMap.set(product.id, product);
      }
    });
  });

  // Trier par pertinence
  return Array.from(productsMap.values())
    .sort((a, b) => ((b as any).relevanceScore || 0) - ((a as any).relevanceScore || 0))
    .slice(0, 20);
}
```

### 2. Composant de Recherche par Image

```typescript
// components/search/ImageSearchButton.tsx

'use client';

import { useState, useRef } from 'react';
import { Camera, X, Loader2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadImage } from '@/lib/firebase/storage';
import { analyzeImage, searchProductsByImage } from '@/lib/services/imageSearchService';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function ImageSearchButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 5MB)');
      return;
    }

    setSelectedImage(file);
    
    // Créer un aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    if (!selectedImage) return;

    setLoading(true);

    try {
      // 1. Upload l'image sur Firebase Storage
      toast.loading('Upload de l\'image...', { id: 'image-search' });
      const imageUrl = await uploadImage(
        selectedImage,
        'image-search',
        () => {} // Pas besoin de progress pour la recherche
      );

      // 2. Analyser l'image avec Cloud Vision API
      toast.loading('Analyse de l\'image...', { id: 'image-search' });
      const { labels, colors } = await analyzeImage(imageUrl);

      if (labels.length === 0) {
        toast.error('Impossible d\'analyser l\'image', { id: 'image-search' });
        return;
      }

      // 3. Rechercher les produits
      toast.loading('Recherche des produits...', { id: 'image-search' });
      const products = await searchProductsByImage(labels, colors);

      toast.success(`${products.length} produits trouvés!`, { id: 'image-search' });

      // 4. Rediriger vers la page de résultats
      const searchParams = new URLSearchParams({
        imageSearch: 'true',
        labels: labels.join(','),
        colors: colors.join(','),
      });
      
      router.push(`/products?${searchParams.toString()}`);
      setShowModal(false);
    } catch (error) {
      console.error('Error searching by image:', error);
      toast.error('Erreur lors de la recherche', { id: 'image-search' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <>
      {/* Bouton Caméra */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
        title="Rechercher par image"
      >
        <Camera size={20} />
      </button>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full"
            >
              {/* Header */}
              <div className="bg-blue-500 text-white p-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Camera size={28} />
                    <div>
                      <h2 className="text-xl font-bold">Recherche par image</h2>
                      <p className="text-sm opacity-90">
                        Trouvez des produits similaires
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 Notre IA va analyser votre image pour identifier les objets, 
                    couleurs et caractéristiques, puis rechercher des produits similaires.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={loading || !selectedImage}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Camera size={20} />
                        Rechercher
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 3. Intégration dans la Barre de Recherche

```typescript
// Dans app/page.tsx ou components/layout/Header.tsx

import { ImageSearchButton } from '@/components/search/ImageSearchButton';

// Dans le JSX de la barre de recherche:
<div className="relative flex items-center">
  <Search className="absolute left-3 text-gray-400" size={20} />
  <input
    type="text"
    placeholder="Rechercher des produits..."
    className="w-full pl-10 pr-12 py-3 border rounded-lg"
  />
  <div className="absolute right-3">
    <ImageSearchButton />
  </div>
</div>
```

### 4. Page de Résultats

```typescript
// app/products/page.tsx - Modifier pour supporter la recherche par image

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { searchProductsByImage } from '@/lib/services/imageSearchService';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const isImageSearch = searchParams.get('imageSearch') === 'true';
  const labels = searchParams.get('labels')?.split(',') || [];
  const colors = searchParams.get('colors')?.split(',') || [];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isImageSearch && labels.length > 0) {
      loadImageSearchResults();
    }
  }, [isImageSearch, labels]);

  const loadImageSearchResults = async () => {
    setLoading(true);
    try {
      const results = await searchProductsByImage(labels, colors);
      setProducts(results);
    } catch (error) {
      console.error('Error loading image search results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isImageSearch && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-blue-900 mb-2">
            📷 Résultats de la recherche par image
          </h2>
          <div className="flex flex-wrap gap-2">
            {labels.map(label => (
              <span
                key={label}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Affichage des produits */}
      {/* ... */}
    </div>
  );
}
```

## Alternative: TensorFlow.js (Gratuit)

Si vous ne voulez pas utiliser Google Cloud Vision API (payant après quota gratuit), voici une alternative avec TensorFlow.js:

```typescript
// lib/services/tensorflowImageSearch.ts

import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

let model: mobilenet.MobileNet | null = null;

export async function loadModel() {
  if (!model) {
    model = await mobilenet.load();
  }
  return model;
}

export async function analyzeImageWithTensorFlow(
  imageElement: HTMLImageElement
): Promise<string[]> {
  const model = await loadModel();
  const predictions = await model.classify(imageElement);
  
  return predictions
    .filter(p => p.probability > 0.5)
    .map(p => p.className.toLowerCase());
}
```

## Coûts et Limites

### Google Cloud Vision API
- **Gratuit**: 1000 requêtes/mois
- **Après**: $1.50 pour 1000 requêtes
- **Précision**: Excellente (90%+)

### TensorFlow.js
- **Gratuit**: Illimité
- **Précision**: Bonne (70-80%)
- **Performance**: Plus lent côté client

## Optimisations

### 1. Cache des Résultats
```typescript
// Mettre en cache les analyses d'images
const imageAnalysisCache = new Map<string, { labels: string[]; colors: string[] }>();
```

### 2. Compression d'Images
```typescript
// Compresser l'image avant l'upload
import imageCompression from 'browser-image-compression';

const compressedImage = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1024,
});
```

### 3. Indexation des Produits
```typescript
// Script pour indexer tous les produits existants
async function indexAllProducts() {
  const products = await getAllProducts();
  
  for (const product of products) {
    const { labels, colors } = await analyzeImage(product.images[0]);
    
    await updateDoc(doc(db, 'products', product.id), {
      imageTags: labels,
      dominantColors: colors,
    });
  }
}
```

## Prochaines Étapes

1. ✅ Activer Google Cloud Vision API
2. ✅ Créer le service d'analyse d'images
3. ✅ Créer le composant ImageSearchButton
4. ✅ Intégrer dans la barre de recherche
5. ✅ Modifier la page de résultats
6. ✅ Indexer les produits existants
7. ✅ Tester avec différentes images
8. ✅ Optimiser les performances

## Conclusion

La recherche par image améliore considérablement l'expérience utilisateur en permettant de trouver des produits sans connaître leur nom. L'implémentation avec Google Cloud Vision API offre la meilleure précision, tandis que TensorFlow.js est une alternative gratuite.
