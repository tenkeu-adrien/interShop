import { useAuthStore } from '@/store/authStore';
import { getCountryCurrency } from '@/lib/data/phoneCountries';

/** Devise du portefeuille de l'utilisateur connecté : celle de son pays. */
export const useWalletCurrency = () =>
  getCountryCurrency(useAuthStore((s) => s.user)?.phoneCountryCode);
