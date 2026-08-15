'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';
import { useAuthStore } from '@/store/authStore';
import { SupportedCurrency } from '@/types';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const {
    updateExchangeRates,
    selectedCurrency,
    setShopDefaultCurrency,
    manualPreference,
  } = useCurrencyStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Initialize exchange rates on app load
    updateExchangeRates().catch((error) => {
      console.error('Échec de l\'initialisation des taux de change:', error);
    });
  }, [updateExchangeRates]);

  // Devise affichée par défaut = devise choisie par le fournisseur
  // lors de la création de sa boutique (tant qu'il ne choisit pas manuellement).
  useEffect(() => {
    if (!manualPreference && user?.role === 'fournisseur' && user.shopCurrency) {
      const shopCurrency = user.shopCurrency as SupportedCurrency;
      if (shopCurrency !== selectedCurrency) {
        setShopDefaultCurrency(shopCurrency);
      }
    }
  }, [
    manualPreference,
    user?.id,
    user?.role,
    user?.shopCurrency,
    selectedCurrency,
    setShopDefaultCurrency,
  ]);

  return <>{children}</>;
}
