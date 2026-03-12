// Utilitaires pour déterminer les champs nécessaires selon le type de moyen de paiement

export type PaymentMethodCategory = 
  | 'mobile_money' 
  | 'crypto' 
  | 'bank_transfer' 
  | 'money_transfer'
  | 'card'
  | 'other';

export interface PaymentFieldConfig {
  category: PaymentMethodCategory;
  fields: {
    phoneNumber?: boolean;
    walletAddress?: boolean;
    network?: boolean;
    iban?: boolean;
    bankName?: boolean;
    swiftCode?: boolean;
    recipientName?: boolean;
    country?: boolean;
    city?: boolean;
  };
  networkOptions?: string[];
}

export function getPaymentMethodCategory(method: string): PaymentFieldConfig {
  const methodLower = method.toLowerCase();

  // Mobile Money
  if (
    methodLower.includes('mobile money') ||
    methodLower.includes('orange money') ||
    methodLower.includes('mtn money') ||
    methodLower.includes('moov money') ||
    methodLower.includes('wave')
  ) {
    return {
      category: 'mobile_money',
      fields: {
        phoneNumber: true
      }
    };
  }

  // Crypto
  if (
    methodLower.includes('crypto') ||
    methodLower.includes('bitcoin') ||
    methodLower.includes('ethereum') ||
    methodLower.includes('usdt')
  ) {
    return {
      category: 'crypto',
      fields: {
        walletAddress: true,
        network: true
      },
      networkOptions: [
        'Bitcoin (BTC)',
        'Ethereum (ETH)',
        'USDT - TRC20 (Tron)',
        'USDT - ERC20 (Ethereum)',
        'USDT - BEP20 (BSC)',
        'Binance Coin (BNB)',
        'Litecoin (LTC)',
        'Dogecoin (DOGE)'
      ]
    };
  }

  // Virement bancaire
  if (methodLower.includes('virement') || methodLower.includes('bancaire')) {
    return {
      category: 'bank_transfer',
      fields: {
        iban: true,
        bankName: true,
        swiftCode: true
      }
    };
  }

  // Western Union / MoneyGram
  if (methodLower.includes('western union') || methodLower.includes('moneygram')) {
    return {
      category: 'money_transfer',
      fields: {
        recipientName: true,
        country: true,
        city: true
      }
    };
  }

  // Cartes / Stripe / PayPal (pas de config nécessaire)
  if (
    methodLower.includes('stripe') ||
    methodLower.includes('visa') ||
    methodLower.includes('mastercard') ||
    methodLower.includes('paypal')
  ) {
    return {
      category: 'card',
      fields: {}
    };
  }

  // Autre (champs génériques)
  return {
    category: 'other',
    fields: {}
  };
}

export function getPaymentMethodLabel(method: string): string {
  const config = getPaymentMethodCategory(method);
  
  switch (config.category) {
    case 'mobile_money':
      return 'Mobile Money';
    case 'crypto':
      return 'Cryptomonnaie';
    case 'bank_transfer':
      return 'Virement bancaire';
    case 'money_transfer':
      return 'Transfert d\'argent';
    case 'card':
      return 'Carte bancaire / Paiement en ligne';
    default:
      return 'Autre';
  }
}

export function getPaymentMethodInstructions(method: string): string {
  const config = getPaymentMethodCategory(method);
  
  switch (config.category) {
    case 'mobile_money':
      return 'Entrez le numéro de téléphone associé à votre compte Mobile Money.';
    case 'crypto':
      return 'Entrez l\'adresse de votre wallet crypto et sélectionnez le réseau.';
    case 'bank_transfer':
      return 'Entrez vos coordonnées bancaires pour recevoir les virements.';
    case 'money_transfer':
      return 'Entrez vos informations pour recevoir les transferts.';
    case 'card':
      return 'Ce moyen de paiement est géré automatiquement par la plateforme. Aucune configuration nécessaire.';
    default:
      return 'Configurez les informations nécessaires pour ce moyen de paiement.';
  }
}
