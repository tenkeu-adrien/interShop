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

  // Actions
  setCurrency: (currency: SupportedCurrency) => void;
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

      setCurrency: (currency: SupportedCurrency) => {
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
        lastUpdate: state.lastUpdate
      })
    }
  )
);
