import { algoliasearch } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const searchApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';
const adminApiKey = process.env.ALGOLIA_ADMIN_KEY || '';

// Client de recherche (côté client - clé publique uniquement)
// Désactivé si les clés ne sont pas configurées
export const searchClient = appId && searchApiKey 
    ? algoliasearch(appId, searchApiKey)
    : null;

// Client admin (côté serveur uniquement - clé privée)
// Désactivé si les clés ne sont pas configurées
export const adminClient = appId && adminApiKey 
    ? algoliasearch(appId, adminApiKey)
    : null;

// Noms des index
export const ALGOLIA_INDICES = {
    PRODUCTS: 'products',
    HOTELS: 'hotels',
    RESTAURANTS: 'restaurants',
} as const;

// Dans Algolia v5, on n'utilise plus initIndex
// Les index sont accessibles directement via searchClient
export const productsIndex = searchClient || null;
export const hotelsIndex = searchClient || null;
export const restaurantsIndex = searchClient || null;

// Index admin (côté serveur, pour sync)
export const productsAdminIndex = adminClient || null;

/**
 * Recherche de produits via Algolia
 */
export async function searchProducts(query: string, options?: {
    category?: string;
    limit?: number;
    page?: number;
}) {
    // Si Algolia n'est pas configuré, retourner résultats vides
    if (!productsIndex) {
        console.warn('⚠️ Algolia not configured. Please add ALGOLIA keys to .env.local');
        return {
            hits: [],
            total: 0,
            hasMore: false,
            currentPage: 0,
            totalPages: 0,
        };
    }

    const { category, limit = 20, page = 0 } = options || {};

    const facetFilters = category && category !== 'all'
        ? [`category:${category}`]
        : [];

    try {
        const result = await productsIndex.search(query, {
            hitsPerPage: limit,
            page,
            facetFilters,
            attributesToRetrieve: [
                'objectID', 'name', 'description', 'images', 'prices',
                'category', 'moq', 'rating', 'reviewCount', 'sales',
                'stock', 'country', 'deliveryTime', 'fournisseurId',
            ],
            attributesToHighlight: ['name', 'description'],
        });

        return {
            hits: result.hits.map((hit: any) => ({ ...hit, id: hit.objectID })),
            total: result.nbHits,
            hasMore: (page + 1) * limit < result.nbHits,
            currentPage: page,
            totalPages: result.nbPages,
        };
    } catch (error) {
        console.error('❌ Algolia search error:', error);
        return {
            hits: [],
            total: 0,
            hasMore: false,
            currentPage: 0,
            totalPages: 0,
        };
    }
}

/**
 * Indexer un produit dans Algolia (côté serveur)
 */
export async function indexProduct(product: {
    id: string;
    name: string;
    description: string;
    category: string;
    images: string[];
    prices: Array<{ price: number; minQty: number }>;
    moq: number;
    rating: number;
    reviewCount: number;
    sales: number;
    stock: number;
    country: string;
    deliveryTime: string;
    fournisseurId: string;
    isActive: boolean;
}) {
    if (!productsAdminIndex) {
        console.warn('⚠️ Algolia admin not configured. Skipping indexing.');
        return;
    }

    const algoliaRecord = {
        objectID: product.id,
        ...product,
    };
    return productsAdminIndex.saveObject(algoliaRecord);
}

/**
 * Supprimer un produit de l'index Algolia
 */
export async function deleteProductFromIndex(productId: string) {
    if (!productsAdminIndex) {
        console.warn('⚠️ Algolia admin not configured. Skipping deletion.');
        return;
    }
    return productsAdminIndex.deleteObject(productId);
}

/**
 * Recherche avec filtre de catégorie
 */
export async function searchByCategory(category: string, limit = 20) {
    return searchProducts('', { category, limit });
}
