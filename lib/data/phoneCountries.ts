import { SupportedCurrency } from '@/types';

export interface PhoneCountry {
  code: string;
  flag: string;
  name: string;
  /** Nombre exact de chiffres du numéro mobile, sans l'indicatif pays. */
  length: number;
  example: string;
  /** Vrai si le 0 initial est un préfixe national à retirer (ex: 0812345678 -> 812345678). */
  trunkZero: boolean;
}

// Longueurs selon les plans de numérotation nationaux (UIT-T E.164).
// Côte d'Ivoire (2021) et Bénin (2024) sont passés à 10 chiffres, 0 initial inclus.
// Au Congo-Brazzaville le 0 initial fait partie du numéro (06/05/04).
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: '+243', flag: '🇨🇩', name: 'RDC', length: 9, example: '812345678', trunkZero: true },
  { code: '+242', flag: '🇨🇬', name: 'Congo', length: 9, example: '061234567', trunkZero: false },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun', length: 9, example: '671234567', trunkZero: false },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", length: 10, example: '0712345678', trunkZero: false },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal', length: 9, example: '771234567', trunkZero: false },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso', length: 8, example: '70123456', trunkZero: false },
  { code: '+223', flag: '🇲🇱', name: 'Mali', length: 8, example: '65123456', trunkZero: false },
  { code: '+227', flag: '🇳🇪', name: 'Niger', length: 8, example: '93123456', trunkZero: false },
  { code: '+228', flag: '🇹🇬', name: 'Togo', length: 8, example: '90123456', trunkZero: false },
  { code: '+229', flag: '🇧🇯', name: 'Bénin', length: 10, example: '0197123456', trunkZero: false },
  { code: '+233', flag: '🇬🇭', name: 'Ghana', length: 9, example: '241234567', trunkZero: true },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria', length: 10, example: '8031234567', trunkZero: true },
  { code: '+254', flag: '🇰🇪', name: 'Kenya', length: 9, example: '712345678', trunkZero: true },
  { code: '+255', flag: '🇹🇿', name: 'Tanzanie', length: 9, example: '712345678', trunkZero: true },
  { code: '+256', flag: '🇺🇬', name: 'Ouganda', length: 9, example: '712345678', trunkZero: true },
  { code: '+27', flag: '🇿🇦', name: 'Afrique du Sud', length: 9, example: '821234567', trunkZero: true },
  { code: '+212', flag: '🇲🇦', name: 'Maroc', length: 9, example: '612345678', trunkZero: true },
  { code: '+213', flag: '🇩🇿', name: 'Algérie', length: 9, example: '551234567', trunkZero: true },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie', length: 8, example: '20123456', trunkZero: false },
  { code: '+20', flag: '🇪🇬', name: 'Égypte', length: 10, example: '1001234567', trunkZero: true },
  { code: '+241', flag: '🇬🇦', name: 'Gabon', length: 8, example: '74123456', trunkZero: true },
  { code: '+236', flag: '🇨🇫', name: 'Centrafrique', length: 8, example: '70012345', trunkZero: false },
  { code: '+235', flag: '🇹🇩', name: 'Tchad', length: 8, example: '63012345', trunkZero: false },
  { code: '+240', flag: '🇬🇶', name: 'Guinée Équatoriale', length: 9, example: '222123456', trunkZero: false },
  { code: '+220', flag: '🇬🇲', name: 'Gambie', length: 7, example: '3012345', trunkZero: false },
  { code: '+224', flag: '🇬🇳', name: 'Guinée', length: 9, example: '621234567', trunkZero: false },
  { code: '+245', flag: '🇬🇼', name: 'Guinée-Bissau', length: 9, example: '955012345', trunkZero: false },
  { code: '+231', flag: '🇱🇷', name: 'Liberia', length: 9, example: '770123456', trunkZero: true },
];

// Devise du pays par indicatif ; les pays dont la devise n'est pas gérée retombent sur USD.
const COUNTRY_CURRENCIES: Record<string, SupportedCurrency> = {
  '+243': 'CDF',
  '+242': 'XAF', '+237': 'XAF', '+241': 'XAF', '+236': 'XAF', '+235': 'XAF', '+240': 'XAF',
  '+225': 'XOF', '+221': 'XOF', '+226': 'XOF', '+223': 'XOF', '+227': 'XOF', '+228': 'XOF', '+229': 'XOF', '+245': 'XOF',
  '+233': 'GHS', '+234': 'NGN', '+254': 'KES', '+255': 'TZS', '+256': 'UGX',
  '+27': 'ZAR', '+212': 'MAD', '+20': 'EGP', '+224': 'GNF',
};

export const getCountryCurrency = (code?: string | null): SupportedCurrency =>
  (code && COUNTRY_CURRENCIES[code]) || 'USD';

export const getPhoneCountry = (code: string): PhoneCountry =>
  PHONE_COUNTRIES.find((c) => c.code === code) ?? PHONE_COUNTRIES[0];

/** Ne garde que les chiffres, retire le 0 national si besoin et coupe à la longueur du pays. */
export const sanitizePhoneNumber = (input: string, code: string): string => {
  const country = getPhoneCountry(code);
  let digits = input.replace(/\D/g, '');
  if (country.trunkZero) digits = digits.replace(/^0+/, '');
  return digits.slice(0, country.length);
};

export const isValidPhoneNumber = (phoneNumber: string, code: string): boolean =>
  /^\d+$/.test(phoneNumber) && phoneNumber.length === getPhoneCountry(code).length;
