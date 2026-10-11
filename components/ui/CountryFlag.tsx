'use client';

import { getCountryCode } from '@/lib/data/countryFlags';

interface CountryFlagProps {
  country?: string | null;
  /** Largeur affichée en pixels (hauteur calculée automatiquement). */
  width?: number;
  className?: string;
}

/**
 * Affiche le drapeau d'un pays sous forme d'image.
 * On utilise des images plutôt que des emojis car Windows n'affiche pas
 * les emojis drapeaux (ils apparaissent comme les deux lettres du code pays).
 */
export function CountryFlag({ country, width = 18, className = '' }: CountryFlagProps) {
  const code = getCountryCode(country);
  if (!code) return null;

  const lower = code.toLowerCase();

  return (
    <img
      src={`https://flagcdn.com/w40/${lower}.png`}
      srcSet={`https://flagcdn.com/w80/${lower}.png 2x`}
      width={width}
      height={Math.round((width * 3) / 4)}
      alt={country ? `Drapeau ${country}` : ''}
      loading="lazy"
      className={`inline-block align-middle rounded-[2px] object-cover ${className}`}
      style={{ width, height: Math.round((width * 3) / 4) }}
    />
  );
}

export default CountryFlag;
