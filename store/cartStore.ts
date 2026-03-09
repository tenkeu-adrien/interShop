import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MarketingCodeValidation } from '@/lib/services/marketingService';

interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  fournisseurId: string;
  moq: number;
}

interface CartState {
  items: CartItem[];
  marketingCode?: string;
  marketingValidation?: MarketingCodeValidation;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyMarketingCode: (code: string, validation: MarketingCodeValidation) => void;
  removeMarketingCode: () => void;
  getTotal: () => number;
  getTotalWithDiscount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      marketingCode: undefined,
      marketingValidation: undefined,
      
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
        
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
        
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })),
        
      clearCart: () => set({ items: [], marketingCode: undefined, marketingValidation: undefined }),
      
      applyMarketingCode: (code, validation) => 
        set({ marketingCode: code, marketingValidation: validation }),
        
      removeMarketingCode: () => 
        set({ marketingCode: undefined, marketingValidation: undefined }),
        
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getTotalWithDiscount: () => {
        const { items, marketingValidation } = get();
        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
        const discount = marketingValidation?.totalDiscount || 0;
        return subtotal - discount;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

