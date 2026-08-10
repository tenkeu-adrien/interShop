'use client';

import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';

interface PriceDisplayProps {
  priceUSD: number;
  /** Devise d'origine du produit (boutique). Si fournie, le prix est affiché sans conversion. */
  currency?: 'USD' | 'CDF';
  className?: string;
  showOriginal?: boolean; // Show USD price alongside
}

export function PriceDisplay({ priceUSD, currency, className = '', showOriginal = false }: PriceDisplayProps) {
  const { convertPrice, formatPrice, selectedCurrency } = useCurrencyStore();
  const [displayPrice, setDisplayPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function convert() {
      setLoading(true);
      try {
        // Produit vendu dans sa devise d'origine → affichage direct sans conversion
        if (currency === 'CDF') {
          setDisplayPrice(`FC ${Number(priceUSD).toLocaleString('fr-FR')}`);
        } else if (currency === 'USD') {
          setDisplayPrice(`$ ${Number(priceUSD).toFixed(2)}`);
        } else {
          const converted = await convertPrice(priceUSD);
          const formatted = formatPrice(converted);
          setDisplayPrice(formatted);
        }
      } catch (error) {
        console.error('Erreur de conversion de prix:', error);
        setDisplayPrice(`$ ${priceUSD.toFixed(2)}`);
      } finally {
        setLoading(false);
      }
    }

    convert();
  }, [priceUSD, currency, selectedCurrency, convertPrice, formatPrice]);

  if (loading) {
    return <span className={`animate-pulse ${className}`}>...</span>;
  }

  return (
    <span className={className}>
      {displayPrice}
      {showOriginal && !currency && selectedCurrency !== 'USD' && (
        <span className="text-sm text-gray-500 ml-2">
          ($ {priceUSD.toFixed(2)})
        </span>
      )}
    </span>
  );
}