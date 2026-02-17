'use client';

import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';

interface PriceDisplayProps {
  priceUSD: number;
  className?: string;
  showOriginal?: boolean; // Show USD price alongside
}

export function PriceDisplay({ priceUSD, className = '', showOriginal = false }: PriceDisplayProps) {
  const { convertPrice, formatPrice, selectedCurrency } = useCurrencyStore();
  const [displayPrice, setDisplayPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function convert() {
      setLoading(true);
      try {
        const converted = await convertPrice(priceUSD);
        const formatted = formatPrice(converted);
        setDisplayPrice(formatted);
      } catch (error) {
        console.error('Erreur de conversion de prix:', error);
        setDisplayPrice(`$ ${priceUSD.toFixed(2)}`);
      } finally {
        setLoading(false);
      }
    }

    convert();
  }, [priceUSD, selectedCurrency, convertPrice, formatPrice]);

  if (loading) {
    return <span className={`animate-pulse ${className}`}>...</span>;
  }

  return (
    <span className={className}>
      {displayPrice}
      {showOriginal && selectedCurrency !== 'USD' && (
        <span className="text-sm text-gray-500 ml-2">
          ($ {priceUSD.toFixed(2)})
        </span>
      )}
    </span>
  );
}
