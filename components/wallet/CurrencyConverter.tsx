'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface Rate {
  code: string;
  name: string;
  flag: string;
  rate: number; // 1 CDF = X devise
}

// Taux approximatifs (1 CDF en autres devises)
// CDF = Franc Congolais
const BASE_RATES: Rate[] = [
  { code: 'USD', name: 'Dollar US',        flag: '🇺🇸', rate: 0.000357  },
  { code: 'EUR', name: 'Euro',             flag: '🇪🇺', rate: 0.000328  },
  { code: 'XAF', name: 'Franc CFA (BEAC)', flag: '🇨🇲', rate: 0.215     },
  { code: 'XOF', name: 'Franc CFA (BCEAO)',flag: '🇨🇮', rate: 0.215     },
  { code: 'GBP', name: 'Livre Sterling',   flag: '🇬🇧', rate: 0.000281  },
  { code: 'CAD', name: 'Dollar Canadien',  flag: '🇨🇦', rate: 0.000485  },
  { code: 'NGN', name: 'Naira Nigérian',   flag: '🇳🇬', rate: 0.540     },
  { code: 'ZAR', name: 'Rand Sud-Africain',flag: '🇿🇦', rate: 0.00655   },
  { code: 'MAD', name: 'Dirham Marocain',  flag: '🇲🇦', rate: 0.00357   },
  { code: 'GHS', name: 'Cedi Ghanéen',     flag: '🇬🇭', rate: 0.00535   },
];

interface CurrencyConverterProps {
  amountCDF?: number; // montant pré-rempli depuis le modal
}

export default function CurrencyConverter({ amountCDF }: CurrencyConverterProps) {
  const [amount, setAmount] = useState(amountCDF ? String(amountCDF) : '');
  const [lastUpdated] = useState(new Date().toLocaleDateString('fr-FR'));

  const numAmount = parseFloat(amount) || 0;

  useEffect(() => {
    if (amountCDF) setAmount(String(amountCDF));
  }, [amountCDF]);

  return (
    <div className="mt-6 rounded-xl overflow-hidden border border-green-200 shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-gray-900" />
          <span className="font-bold text-gray-900 text-sm">Convertisseur CDF</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-800">
          <RefreshCw size={12} />
          <span>Mis à jour: {lastUpdated}</span>
        </div>
      </div>

      <div className="bg-white p-4">
        {/* Input CDF */}
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
              CDF
            </span>
          </div>
        </div>

        {/* Grille de conversions */}
        <div className="grid grid-cols-2 gap-2">
          {BASE_RATES.map((rate) => {
            const converted = numAmount * rate.rate;
            const formatted = converted < 0.01
              ? converted.toFixed(6)
              : converted < 1
              ? converted.toFixed(4)
              : converted >= 1000
              ? converted.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
              : converted.toFixed(2);

            return (
              <div
                key={rate.code}
                className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-green-50 border border-green-100 rounded-lg px-3 py-2 hover:border-green-300 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{rate.flag}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-700">{rate.code}</p>
                    <p className="text-xs text-gray-500 leading-none">{rate.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-700">
                    {numAmount > 0 ? formatted : '—'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p className="mt-3 text-xs text-gray-400 text-center">
          ⚠️ Taux indicatifs — Pour information uniquement
        </p>
      </div>
    </div>
  );
}
