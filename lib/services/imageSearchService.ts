import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';

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

/**
 * Analyser une image avec Google Cloud Vision API
 */
export async function analyzeImage(imageUrl: string): Promise<{
  labels: string[];
  colors: string[];
}> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Cloud Vision API key not configured');
  }

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
              { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }

  const data: VisionAPIResponse = await response.json();
  const result = data.responses[0];

  // Extraire les labels (avec score > 0.7 pour plus de précision)
  const labels = result.labelAnnotations
    ?.filter(label => label.score > 0.7)
    .map(label => label.description.toLowerCase()) || [];

  // Extraire les couleurs dominantes (top 3)
  const colors = result.imagePropertiesAnnotation?.dominantColors.colors
    .slice(0, 3)
    .map(c => rgbToHex(c.color.red, c.color.green, c.color.blue)) || [];

  return { labels, colors };
}

/**
 * Convertir RGB en HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Rechercher des produits par labels et couleurs
 */
export async function searchProductsByImage(
  labels: string[],
  colors: string[]
): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const productsMap = new Map<string, Product & { relevanceScore: number }>();

  // Recherche par tags d'image
  if (labels.length > 0) {
    for (const label of labels.slice(0, 3)) {
      const q = query(
        productsRef,
        where('imageTags', 'array-contains', label),
        where('isActive', '==', true),
        limit(20)
      );

      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const product = { id: doc.id, ...doc.data() } as Product;
        
        // Calculer le score de pertinence
        const matchingLabels = labels.filter(l =>
          product.imageTags?.includes(l) ||
          product.tags?.includes(l) ||
          product.name.toLowerCase().includes(l) ||
          product.description.toLowerCase().includes(l)
        ).length;

        const matchingColors = colors.filter(color =>
          (product as any).dominantColors?.includes(color)
        ).length;

        const relevanceScore = matchingLabels * 3 + matchingColors;

        if (!productsMap.has(product.id)) {
          productsMap.set(product.id, { ...product, relevanceScore });
        } else {
          const existing = productsMap.get(product.id)!;
          if (relevanceScore > existing.relevanceScore) {
            productsMap.set(product.id, { ...product, relevanceScore });
          }
        }
      });
    }
  }

  // Si pas assez de résultats, recherche par tags normaux
  if (productsMap.size < 5 && labels.length > 0) {
    for (const label of labels.slice(0, 3)) {
      const q = query(
        productsRef,
        where('tags', 'array-contains', label),
        where('isActive', '==', true),
        limit(10)
      );

      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const product = { id: doc.id, ...doc.data() } as Product;
        
        if (!productsMap.has(product.id)) {
          const matchingLabels = labels.filter(l =>
            product.tags?.includes(l) ||
            product.name.toLowerCase().includes(l)
          ).length;

          productsMap.set(product.id, {
            ...product,
            relevanceScore: matchingLabels * 2,
          });
        }
      });
    }
  }

  // Trier par pertinence et retourner top 20
  return Array.from(productsMap.values())
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20)
    .map(({ relevanceScore, ...product }) => product);
}

/**
 * Analyser et indexer l'image d'un produit
 * À appeler lors de la création/modification d'un produit
 */
export async function indexProductImage(productId: string, imageUrl: string): Promise<void> {
  try {
    const { labels, colors } = await analyzeImage(imageUrl);
    
    // Mettre à jour le produit avec les tags
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'products', productId), {
      imageTags: labels,
      dominantColors: colors,
      lastIndexed: new Date(),
    });
  } catch (error) {
    console.error('Error indexing product image:', error);
    // Ne pas bloquer la création du produit si l'indexation échoue
  }
}
