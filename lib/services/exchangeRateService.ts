import { ExchangeRate, SupportedCurrency } from '@/types';
import { SUPPORTED_CURRENCIES } from '@/lib/constants/currencies';
import { getActiveAdminExchangeRates } from '@/lib/firebase/adminExchangeRates';

/**
 * Service de gestion des taux de change
 * SYSTÈME MANUEL : Lit les taux depuis Firestore (définis par l'admin)
 * Plus d'API externe !
 */
export class ExchangeRateService {
  private static cache: Map<SupportedCurrency, ExchangeRate> = new Map();
  private static lastUpdate: Date | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (cache court pour refléter les changements admin)

  static async getExchangeRate(targetCurrency: SupportedCurrency): Promise<number> {
    if (targetCurrency === 'USD') return 1;

    // Check cache
    const cached = this.cache.get(targetCurrency);
    if (cached && this.isCacheValid()) {
      return cached.rate;
    }

    // Fetch new rates from Firestore
    await this.updateRates();
    
    const rate = this.cache.get(targetCurrency);
    if (!rate) {
      throw new Error(`Taux de change non trouvé pour ${targetCurrency}`);
    }

    return rate.rate;
  }

  /**
   * Met à jour les taux depuis Firestore (définis manuellement par l'admin)
   */
  static async updateRates(): Promise<void> {
    try {
      console.log('📊 Chargement des taux de change depuis Firestore...');
      
      // Récupère les taux actifs définis par l'admin
      const adminRates = await getActiveAdminExchangeRates();
      
      if (adminRates.length === 0) {
        console.warn('⚠️ Aucun taux de change trouvé dans Firestore. Utilisation des taux par défaut.');
        this.setDefaultRates();
        return;
      }

      // Update cache avec les taux admin
      adminRates.forEach((adminRate) => {
        if (adminRate.currency !== 'USD') {
          this.cache.set(adminRate.currency, {
            baseCurrency: 'USD',
            targetCurrency: adminRate.currency,
            rate: adminRate.rateToUSD,
            timestamp: adminRate.updatedAt,
            source: 'admin-firestore'
          });
        }
      });

      this.lastUpdate = new Date();
      console.log(`✅ ${adminRates.length} taux de change chargés depuis Firestore`);
    } catch (error) {
      console.error('❌ Échec du chargement des taux depuis Firestore:', error);
      
      // Use cached rates if available
      if (this.cache.size === 0) {
        console.warn('⚠️ Aucun taux disponible. Utilisation des taux par défaut.');
        this.setDefaultRates();
      }
    }
  }

  static isCacheValid(): boolean {
    if (!this.lastUpdate) return false;
    const now = Date.now();
    const lastUpdateTime = this.lastUpdate.getTime();
    return (now - lastUpdateTime) < this.CACHE_DURATION;
  }

  static async convertPrice(
    amountUSD: number,
    targetCurrency: SupportedCurrency
  ): Promise<number> {
    if (targetCurrency === 'USD') return amountUSD;
    
    const rate = await this.getExchangeRate(targetCurrency);
    return amountUSD * rate;
  }

  static formatPrice(
    amount: number,
    currency: SupportedCurrency
  ): string {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    const formatted = amount.toFixed(currencyInfo.decimals);
    
    // Format with thousands separator
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const formattedAmount = parts.join(',');
    
    return `${currencyInfo.symbol} ${formattedAmount}`;
  }

  static getAllRates(): Map<SupportedCurrency, ExchangeRate> {
    return new Map(this.cache);
  }

  // Default rates for fallback (approximate values)
  private static setDefaultRates(): void {
    const defaultRates: Record<string, number> = {
      CDF: 2800,
      XOF: 600,
      XAF: 600,
      GHS: 12,
      NGN: 1500,
      KES: 130,
      TZS: 2500,
      UGX: 3700,
      ZAR: 18,
      MAD: 10,
      EGP: 48,
      ETB: 120,
      GNF: 8600,
      RWF: 1300,
      MGA: 4500,
      MUR: 45
    };

    Object.entries(defaultRates).forEach(([currency, rate]) => {
      this.cache.set(currency as SupportedCurrency, {
        baseCurrency: 'USD',
        targetCurrency: currency as SupportedCurrency,
        rate,
        timestamp: new Date(),
        source: 'default'
      });
    });

    this.lastUpdate = new Date();
  }
}
