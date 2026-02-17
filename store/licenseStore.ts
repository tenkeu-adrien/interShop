import { create } from 'zustand';
import { LicenseConfig, FournisseurSubscription, ProductUsage, LicenseTier } from '@/types';
import { 
  getAllLicenses, 
  getFournisseurSubscription, 
  getProductUsage,
  createSubscription 
} from '@/lib/firebase/licenses';

interface LicenseState {
  licenses: LicenseConfig[];
  currentSubscription: FournisseurSubscription | null;
  productUsage: ProductUsage | null;
  loading: boolean;
  
  fetchLicenses: () => Promise<void>;
  fetchSubscription: (fournisseurId: string) => Promise<void>;
  fetchProductUsage: (fournisseurId: string) => Promise<void>;
  upgradeLicense: (tier: LicenseTier, fournisseurId: string) => Promise<void>;
  checkQuota: () => boolean;
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
  licenses: [],
  currentSubscription: null,
  productUsage: null,
  loading: false,
  
  fetchLicenses: async () => {
    set({ loading: true });
    try {
      const licenses = await getAllLicenses();
      set({ licenses, loading: false });
    } catch (error) {
      console.error('Error fetching licenses:', error);
      set({ loading: false });
    }
  },
  
  fetchSubscription: async (fournisseurId: string) => {
    set({ loading: true });
    try {
      const subscription = await getFournisseurSubscription(fournisseurId);
      set({ currentSubscription: subscription, loading: false });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      set({ loading: false });
    }
  },
  
  fetchProductUsage: async (fournisseurId: string) => {
    set({ loading: true });
    try {
      const usage = await getProductUsage(fournisseurId);
      set({ productUsage: usage, loading: false });
    } catch (error) {
      console.error('Error fetching product usage:', error);
      set({ loading: false });
    }
  },
  
  upgradeLicense: async (tier: LicenseTier, fournisseurId: string) => {
    set({ loading: true });
    try {
      const { licenses } = get();
      const license = licenses.find(l => l.tier === tier);
      
      if (!license) {
        throw new Error('Licence non trouvée');
      }
      
      await createSubscription(fournisseurId, tier, license.priceUSD);
      
      // Refresh subscription and usage
      await get().fetchSubscription(fournisseurId);
      await get().fetchProductUsage(fournisseurId);
      
      set({ loading: false });
    } catch (error) {
      console.error('Error upgrading license:', error);
      set({ loading: false });
      throw error;
    }
  },
  
  checkQuota: () => {
    const { productUsage } = get();
    if (!productUsage) return false;
    return productUsage.currentCount < productUsage.quota || productUsage.quota === -1;
  },
}));
