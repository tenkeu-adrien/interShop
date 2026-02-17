import { create } from 'zustand';
import { PaymentMethod, CreatePaymentMethodData } from '@/types';
import {
  getAllPaymentMethods,
  getActivePaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodStatus
} from '@/lib/firebase/paymentMethods';

interface PaymentMethodsState {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchPaymentMethods: (forceRefresh?: boolean) => Promise<void>;
  fetchActivePaymentMethods: () => Promise<void>;
  getPaymentMethodById: (id: string) => Promise<PaymentMethod>;
  createMethod: (data: CreatePaymentMethodData, adminId: string) => Promise<PaymentMethod>;
  updateMethod: (id: string, data: Partial<PaymentMethod>, adminId: string) => Promise<void>;
  toggleMethodStatus: (id: string, adminId: string) => Promise<void>;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const usePaymentMethodsStore = create<PaymentMethodsState>((set, get) => ({
  paymentMethods: [],
  loading: false,
  error: null,
  lastFetch: null,

  fetchPaymentMethods: async (forceRefresh = false) => {
    const { lastFetch, paymentMethods } = get();
    const now = Date.now();

    // Utiliser le cache si disponible et pas expiré
    if (!forceRefresh && lastFetch && paymentMethods.length > 0 && (now - lastFetch) < CACHE_DURATION) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const methods = await getAllPaymentMethods();
      set({ 
        paymentMethods: methods, 
        loading: false,
        lastFetch: now
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchActivePaymentMethods: async () => {
    set({ loading: true, error: null });
    try {
      const methods = await getActivePaymentMethods();
      set({ 
        paymentMethods: methods, 
        loading: false,
        lastFetch: Date.now()
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getPaymentMethodById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const method = await getPaymentMethod(id);
      set({ loading: false });
      return method;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createMethod: async (data: CreatePaymentMethodData, adminId: string) => {
    set({ loading: true, error: null });
    try {
      const method = await createPaymentMethod(data, adminId);
      
      // Ajouter au store
      set((state) => ({
        paymentMethods: [method, ...state.paymentMethods],
        loading: false
      }));
      
      return method;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateMethod: async (id: string, data: Partial<PaymentMethod>, adminId: string) => {
    set({ loading: true, error: null });
    try {
      await updatePaymentMethod(id, data, adminId);
      
      // Mettre à jour dans le store
      set((state) => ({
        paymentMethods: state.paymentMethods.map(m =>
          m.id === id ? { ...m, ...data } : m
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  toggleMethodStatus: async (id: string, adminId: string) => {
    const { paymentMethods } = get();
    const method = paymentMethods.find(m => m.id === id);
    
    if (!method) {
      throw new Error('Méthode de paiement non trouvée');
    }

    set({ loading: true, error: null });
    try {
      await togglePaymentMethodStatus(id, adminId);
      
      // Mettre à jour dans le store
      set((state) => ({
        paymentMethods: state.paymentMethods.map(m =>
          m.id === id ? { ...m, isActive: !m.isActive } : m
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      paymentMethods: [],
      loading: false,
      error: null,
      lastFetch: null
    });
  }
}));
