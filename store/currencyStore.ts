import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SupportedCurrency } from '@/types';
import { ExchangeRateService } from '@/lib/services/exchangeRateService';

interface CurrencyState {
  selectedCurrency: SupportedCurrency;
  exchangeRates: Map<SupportedCurrency, number>;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  /** true si l'utilisateur a choisi une devise manuellement (ne plus surcharger) */
  manualPreference: boolean;

  // Actions
  setCurrency: (currency: SupportedCurrency) => void;
  setShopDefaultCurrency: (currency: SupportedCurrency) => void;
  updateExchangeRates: () => Promise<void>;
  convertPrice: (amountUSD: number) => Promise<number>;
  formatPrice: (amount: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: 'USD',
      exchangeRates: new Map(),
      loading: false,
      error: null,
      lastUpdate: null,
      manualPreference: false,

      setCurrency: (currency: SupportedCurrency) => {
        set({ selectedCurrency: currency, manualPreference: true });
      },

      // Applique la devise de la boutique sans marquer de préférence manuelle,
      // pour ne pas empêcher une surcharge automatique ultérieure.
      setShopDefaultCurrency: (currency: SupportedCurrency) => {
        set({ selectedCurrency: currency });
      },

      updateExchangeRates: async () => {
        set({ loading: true, error: null });
        try {
          await ExchangeRateService.updateRates();
          const rates = ExchangeRateService.getAllRates();
          const ratesMap = new Map<SupportedCurrency, number>();
          rates.forEach((rate, currency) => {
            ratesMap.set(currency, rate.rate);
          });
          set({ 
            exchangeRates: ratesMap, 
            loading: false,
            lastUpdate: new Date()
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Échec de la mise à jour des taux de change', 
            loading: false 
          });
        }
      },

      convertPrice: async (amountUSD: number) => {
        const { selectedCurrency } = get();
        return await ExchangeRateService.convertPrice(amountUSD, selectedCurrency);
      },

      formatPrice: (amount: number) => {
        const { selectedCurrency } = get();
        return ExchangeRateService.formatPrice(amount, selectedCurrency);
      }
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
        lastUpdate: state.lastUpdate,
        manualPreference: state.manualPreference
      })
    }
  )
);
