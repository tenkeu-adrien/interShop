import { create } from 'zustand';
import { Product, SearchFilters } from '@/types';
import { searchProducts } from '@/lib/firebase/products';

interface PublicProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  lastDoc: any;
  filters: SearchFilters;
  searchQuery: string;
  
  // Actions
  setFilters: (filters: SearchFilters) => void;
  setSearchQuery: (query: string) => void;
  loadProducts: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

const PRODUCTS_PER_PAGE = 20;

export const usePublicProductsStore = create<PublicProductsState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  hasMore: true,
  lastDoc: null,
  filters: { sortBy: 'newest' },
  searchQuery: '',

  setFilters: (filters: SearchFilters) => {
    set({ filters });
    get().loadProducts(true);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().loadProducts(true);
  },

  loadProducts: async (reset = false) => {
    const { filters, lastDoc, searchQuery, loading } = get();
    
    if (loading) return;
    
    set({ loading: true, error: null });

    try {
      const { products: newProducts, lastDoc: newLastDoc } = await searchProducts(
        filters,
        PRODUCTS_PER_PAGE,
        reset ? undefined : lastDoc
      );

      // Filtrer par recherche textuelle si présent
      let filteredProducts = newProducts;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = newProducts.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }

      set(state => ({
        products: reset ? filteredProducts : [...state.products, ...filteredProducts],
        lastDoc: newLastDoc,
        hasMore: newProducts.length === PRODUCTS_PER_PAGE,
        loading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement des produits',
        loading: false 
      });
    }
  },

  loadMore: async () => {
    const { hasMore, loading } = get();
    if (!hasMore || loading) return;
    
    await get().loadProducts(false);
  },

  reset: () => {
    set({
      products: [],
      loading: false,
      error: null,
      hasMore: true,
      lastDoc: null,
      filters: { sortBy: 'newest' },
      searchQuery: '',
    });
  },
}));
