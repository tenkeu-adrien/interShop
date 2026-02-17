import { create } from 'zustand';
import { ProductCategory } from '@/types';

interface CategoryState {
  selectedCategory: ProductCategory;
  setCategory: (category: ProductCategory) => void;
  filters: {
    city?: string;
    priceRange?: string;
    features?: string[];
    distance?: number;
  };
  setFilters: (filters: Partial<CategoryState['filters']>) => void;
  clearFilters: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  selectedCategory: 'ecommerce',
  setCategory: (category) => set({ selectedCategory: category }),
  filters: {},
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  clearFilters: () => set({ filters: {} }),
}));
