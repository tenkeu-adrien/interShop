'use client';

import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { useCurrencyStore } from '@/store/currencyStore';
import { SUPPORTED_CURRENCIES } from '@/lib/constants/currencies';
import { SupportedCurrency } from '@/types';

interface CurrencyConverterProps {
  amount?: number; // montant pré-rempli depuis le formulaire
  baseCurrency: SupportedCurrency; // devise du portefeuille de l'utilisateur
}

const flagEmoji = (countryCode: string) =>
  String.fromCodePoint(...countryCode.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)));

const formatConverted = (value: number) =>
  value < 0.01
    ? value.toFixed(6)
    : value < 1
    ? value.toFixed(4)
    : value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

// Plus le montant est long (millions, milliards), plus les chiffres sont petits.
const sizeClass = (text: string) =>
  text.length > 17 ? 'text-[9px]' : text.length > 13 ? 'text-[10px]' : text.length > 9 ? 'text-xs' : 'text-sm';

export default function CurrencyConverter({ amount: initialAmount, baseCurrency }: CurrencyConverterProps) {
  const exchangeRates = useCurrencyStore((s) => s.exchangeRates);
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '');

  useEffect(() => {
    if (initialAmount) setAmount(String(initialAmount));
  }, [initialAmount]);

  const numAmount = parseFloat(amount) || 0;
  // Taux exprimés pour 1 USD.
  const rateOf = (currency: SupportedCurrency) => (currency === 'USD' ? 1 : exchangeRates.get(currency));
  const baseRate = rateOf(baseCurrency);
  const targets = Object.values(SUPPORTED_CURRENCIES).filter((c) => c.code !== baseCurrency && rateOf(c.code));

  return (
    <div className="mt-6 rounded-xl overflow-hidden border border-green-200 shadow-sm">
      <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 px-4 py-3 flex items-center gap-2">
        <TrendingUp size={18} className="text-gray-900" />
        <span className="font-bold text-gray-900 text-sm">Convertisseur {baseCurrency}</span>
      </div>

      <div className="bg-white p-4">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Montant
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 100000"
              className="w-full px-4 py-2.5 pr-16 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-500 text-lg font-semibold outline-none transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
              {baseCurrency}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {baseRate &&
            targets.map((currency) => {
              const formatted = formatConverted((numAmount / baseRate) * rateOf(currency.code)!);

              return (
                <div
                  key={currency.code}
                  className="bg-gradient-to-r from-yellow-50 to-green-50 border border-green-100 rounded-lg px-3 py-2 hover:border-green-300 transition min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0">{flagEmoji(currency.flag)}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-700">{currency.code}</p>
                      <p className="text-xs text-gray-500 leading-tight">{currency.name}</p>
                    </div>
                  </div>
                  <p className={`${sizeClass(formatted)} font-bold text-green-700 text-right mt-1 whitespace-nowrap overflow-hidden`}>
                    {numAmount > 0 ? formatted : '—'}
                  </p>
                </div>
              );
            })}
        </div>

        <p className="mt-3 text-xs text-gray-400 text-center">
          ⚠️ Taux indicatifs — Pour information uniquement
        </p>
      </div>
    </div>
  );
}
