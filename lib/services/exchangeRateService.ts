import { ExchangeRate, SupportedCurrency } from '@/types';
import { SUPPORTED_CURRENCIES } from '@/lib/constants/currencies';

const EXCHANGE_RATE_API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
const EXCHANGE_RATE_API_URL = 'https://v6.exchangerate-api.com/v6';

export class ExchangeRateService {
  private static cache: Map<SupportedCurrency, ExchangeRate> = new Map();
  private static lastUpdate: Date | null = null;
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  static async getExchangeRate(targetCurrency: SupportedCurrency): Promise<number> {
    if (targetCurrency === 'USD') return 1;

    // Check cache
    const cached = this.cache.get(targetCurrency);
    if (cached && this.isCacheValid()) {
      return cached.rate;
    }

    // Fetch new rates
    await this.updateRates();
    
    const rate = this.cache.get(targetCurrency);
    if (!rate) {
      throw new Error(`Taux de change non trouvé pour ${targetCurrency}`);
    }

    return rate.rate;
  }

  static async updateRates(): Promise<void> {
    if (!EXCHANGE_RATE_API_KEY) {
      console.warn('Clé API de taux de change manquante. Utilisation des taux par défaut.');
      this.setDefaultRates();
      return;
    }

    try {
      const response = await fetch(
        `${EXCHANGE_RATE_API_URL}/${EXCHANGE_RATE_API_KEY}/latest/USD`
      );

      if (!response.ok) {
        throw new Error('Échec de la récupération des taux de change');
      }

      const data = await response.json();
      
      if (data.result !== 'success') {
        throw new Error('L\'API de taux de change a retourné une erreur');
      }

      // Update cache
      Object.keys(SUPPORTED_CURRENCIES).forEach((currency) => {
        if (currency !== 'USD' && data.conversion_rates[currency]) {
          this.cache.set(currency as SupportedCurrency, {
            baseCurrency: 'USD',
            targetCurrency: currency as SupportedCurrency,
            rate: data.conversion_rates[currency],
            timestamp: new Date(),
            source: 'exchangerate-api.com'
          });
        }
      });

      this.lastUpdate = new Date();
      console.log('Taux de change mis à jour avec succès');
    } catch (error) {
      console.error('Échec de la mise à jour des taux de change:', error);
      // Use cached rates if available
      if (this.cache.size === 0) {
        console.warn('Aucun taux de change disponible. Utilisation des taux par défaut.');
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
