'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useCurrencyStore } from '@/store/currencyStore';
import { SUPPORTED_CURRENCIES } from '@/lib/constants/currencies';
import { SupportedCurrency } from '@/types';

export function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { selectedCurrency, setCurrency } = useCurrencyStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCurrency = SUPPORTED_CURRENCIES[selectedCurrency];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <span className="text-2xl">{getFlagEmoji(currentCurrency.flag)}</span>
        <span className="font-medium">{currentCurrency.code}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
          >
            <div className="p-2">
              {Object.values(SUPPORTED_CURRENCIES).map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    setCurrency(currency.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    selectedCurrency === currency.code ? 'bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFlagEmoji(currency.flag)}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{currency.code}</div>
                      <div className="text-xs text-gray-500">{currency.name}</div>
                    </div>
                  </div>
                  {selectedCurrency === currency.code && (
                    <Check size={18} className="text-yellow-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
