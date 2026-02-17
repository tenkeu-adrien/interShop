import { SupportedCurrency, CurrencyInfo } from '@/types';

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, CurrencyInfo> = {
  USD: { 
    code: 'USD', 
    name: 'Dollar Américain', 
    symbol: '$', 
    flag: 'US', 
    decimals: 2 
  },
  XOF: { 
    code: 'XOF', 
    name: 'Franc CFA (BCEAO)', 
    symbol: 'CFA', 
    flag: 'SN', 
    decimals: 0 
  },
  XAF: { 
    code: 'XAF', 
    name: 'Franc CFA (BEAC)', 
    symbol: 'FCFA', 
    flag: 'CM', 
    decimals: 0 
  },
  GHS: { 
    code: 'GHS', 
    name: 'Cedi Ghanéen', 
    symbol: '₵', 
    flag: 'GH', 
    decimals: 2 
  },
  NGN: { 
    code: 'NGN', 
    name: 'Naira Nigérian', 
    symbol: '₦', 
    flag: 'NG', 
    decimals: 2 
  },
  KES: { 
    code: 'KES', 
    name: 'Shilling Kenyan', 
    symbol: 'KSh', 
    flag: 'KE', 
    decimals: 2 
  },
  TZS: { 
    code: 'TZS', 
    name: 'Shilling Tanzanien', 
    symbol: 'TSh', 
    flag: 'TZ', 
    decimals: 2 
  },
  UGX: { 
    code: 'UGX', 
    name: 'Shilling Ougandais', 
    symbol: 'USh', 
    flag: 'UG', 
    decimals: 0 
  },
  ZAR: { 
    code: 'ZAR', 
    name: 'Rand Sud-Africain', 
    symbol: 'R', 
    flag: 'ZA', 
    decimals: 2 
  },
  MAD: { 
    code: 'MAD', 
    name: 'Dirham Marocain', 
    symbol: 'DH', 
    flag: 'MA', 
    decimals: 2 
  },
  EGP: { 
    code: 'EGP', 
    name: 'Livre Égyptienne', 
    symbol: 'E£', 
    flag: 'EG', 
    decimals: 2 
  },
  ETB: { 
    code: 'ETB', 
    name: 'Birr Éthiopien', 
    symbol: 'Br', 
    flag: 'ET', 
    decimals: 2 
  },
  GNF: { 
    code: 'GNF', 
    name: 'Franc Guinéen', 
    symbol: 'FG', 
    flag: 'GN', 
    decimals: 0 
  },
  RWF: { 
    code: 'RWF', 
    name: 'Franc Rwandais', 
    symbol: 'RF', 
    flag: 'RW', 
    decimals: 0 
  },
  MGA: { 
    code: 'MGA', 
    name: 'Ariary Malgache', 
    symbol: 'Ar', 
    flag: 'MG', 
    decimals: 0 
  },
  MUR: { 
    code: 'MUR', 
    name: 'Roupie Mauricienne', 
    symbol: '₨', 
    flag: 'MU', 
    decimals: 2 
  }
};

export const BASE_CURRENCY: SupportedCurrency = 'USD';
