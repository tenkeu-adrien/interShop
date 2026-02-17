import { create } from 'zustand';
import { Product } from '@/types';
import { getFournisseurProducts, updateProduct, deleteProduct } from '@/lib/firebase/products';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  fetchProducts: (fournisseurId: string, forceRefresh?: boolean) => Promise<void>;
  addProduct: (product: Product) => void;
  updateProductInStore: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
  toggleProductStatus: (productId: string) => Promise<void>;
  deleteProductFromStore: (productId: string) => Promise<void>;
  clearProducts: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  lastFetch: null,

  fetchProducts: async (fournisseurId: string, forceRefresh = false) => {
    const { lastFetch, products } = get();
    const now = Date.now();

    // Utiliser le cache si disponible et pas expiré
    if (!forceRefresh && lastFetch && products.length > 0 && (now - lastFetch) < CACHE_DURATION) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const fetchedProducts = await getFournisseurProducts(fournisseurId);
      set({ 
        products: fetchedProducts, 
        loading: false, 
        lastFetch: now 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Erreur lors du chargement des produits', 
        loading: false 
      });
    }
  },

  addProduct: (product: Product) => {
    set((state) => ({
      products: [product, ...state.products]
    }));
  },

  updateProductInStore: (productId: string, updates: Partial<Product>) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      )
    }));
  },

  removeProduct: (productId: string) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId)
    }));
  },

  toggleProductStatus: async (productId: string) => {
    const { products, updateProductInStore } = get();
    const product = products.find((p) => p.id === productId);
    
    if (!product) return;

    const newStatus = !product.isActive;
    
    try {
      await updateProduct(productId, { isActive: newStatus });
      updateProductInStore(productId, { isActive: newStatus });
    } catch (error) {
      throw error;
    }
  },

  deleteProductFromStore: async (productId: string) => {
    try {
      await deleteProduct(productId);
      get().removeProduct(productId);
    } catch (error) {
      throw error;
    }
  },

  clearProducts: () => {
    set({ products: [], lastFetch: null });
  }
}));
