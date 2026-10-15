import { CountryFlag } from '@/components/ui/CountryFlag';
import { getCountryCode } from '@/lib/data/countryFlags';

interface ProductOriginProps {
  country?: string;
  city?: string;
  width?: number;
  className?: string;
}

/**
 * Affiche l'origine d'un produit : drapeau + abréviation du pays / ville.
 * Exemple : 🇨🇩 CD / Kinshasa
 */
export default function ProductOrigin({
  country,
  city,
  width = 14,
  className = '',
}: ProductOriginProps) {
  const code = getCountryCode(country) || country || '';
  const cityName = city?.trim() ?? '';

  if (!code && !cityName) return null;

  return (
    <span className={`inline-flex items-center gap-1 min-w-0 ${className}`}>
      {country && <CountryFlag country={country} width={width} className="shrink-0" />}
      <span className="truncate">
        {code}
        {code && cityName ? ' / ' : ''}
        {cityName}
      </span>
    </span>
  );
}
