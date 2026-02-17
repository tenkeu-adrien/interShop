'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { updateExchangeRates } = useCurrencyStore();

  useEffect(() => {
    // Initialize exchange rates on app load
    updateExchangeRates().catch((error) => {
      console.error('Échec de l\'initialisation des taux de change:', error);
    });
  }, [updateExchangeRates]);

  return <>{children}</>;
}
