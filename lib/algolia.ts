import algoliasearch from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const searchApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';
const adminApiKey = process.env.ALGOLIA_ADMIN_KEY || '';

// Client de recherche (côté client - clé publique uniquement)
export const searchClient = algoliasearch(appId, searchApiKey);

// Client admin (côté serveur uniquement - clé privée)
export const adminClient = algoliasearch(appId, adminApiKey);

// Noms des index
export const ALGOLIA_INDICES = {
    PRODUCTS: 'products',
    HOTELS: 'hotels',
    RESTAURANTS: 'restaurants',
} as const;

// Index de recherche (côté client)
export const productsIndex = searchClient.initIndex(ALGOLIA_INDICES.PRODUCTS);
export const hotelsIndex = searchClient.initIndex(ALGOLIA_INDICES.HOTELS);
export const restaurantsIndex = searchClient.initIndex(ALGOLIA_INDICES.RESTAURANTS);

// Index admin (côté serveur, pour sync)
export const productsAdminIndex = adminClient.initIndex(ALGOLIA_INDICES.PRODUCTS);

/**
 * Recherche de produits via Algolia
 */
export async function searchProducts(query: string, options?: {
    category?: string;
    limit?: number;
    page?: number;
}) {
    const { category, limit = 20, page = 0 } = options || {};

    const facetFilters = category && category !== 'all'
        ? [`category:${category}`]
        : [];

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
    return productsAdminIndex.deleteObject(productId);
}

/**
 * Recherche avec filtre de catégorie
 */
export async function searchByCategory(category: string, limit = 20) {
    return searchProducts('', { category, limit });
}
