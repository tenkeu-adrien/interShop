'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, TrendingUp, Settings, Save, Key } from 'lucide-react';
import { useCurrencyStore } from '@/store/currencyStore';
import { ExchangeRateService } from '@/lib/services/exchangeRateService';
import { SUPPORTED_CURRENCIES } from '@/lib/constants/currencies';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function ExchangeRatesContent() {
  const { exchangeRates, lastUpdate, updateExchangeRates, loading } = useCurrencyStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [testingApi, setTestingApi] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await updateExchangeRates();
      toast.success('Taux de change mis à jour avec succès');
    } catch (error) {
      toast.error('Échec de la mise à jour des taux');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Veuillez entrer une clé API');
      return;
    }

    setTestingApi(true);
    try {
      // Test the API key by making a request
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      );
      const data = await response.json();

      if (data.result === 'success') {
        toast.success('Clé API valide !');
        // Save to localStorage (in production, save to Firebase)
        localStorage.setItem('EXCHANGE_RATE_API_KEY', apiKey);
      } else {
        toast.error('Clé API invalide');
      }
    } catch (error) {
      toast.error('Erreur lors du test de la clé API');
    } finally {
      setTestingApi(false);
    }
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return 'Jamais';
    const now = new Date();
    const diff = now.getTime() - new Date(lastUpdate).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Il y a ${hours}h ${minutes}min`;
    }
    return `Il y a ${minutes}min`;
  };

  const isStale = () => {
    if (!lastUpdate) return true;
    const now = new Date();
    const diff = now.getTime() - new Date(lastUpdate).getTime();
    return diff > 24 * 60 * 60 * 1000; // Plus de 24h
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Taux de Change
          </h1>
          <p className="text-gray-600">
            Gérez les taux de conversion pour toutes les devises supportées
          </p>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${isStale() ? 'bg-red-100' : 'bg-green-100'}`}>
                {isStale() ? (
                  <AlertTriangle className="text-red-600" size={24} />
                ) : (
                  <CheckCircle className="text-green-600" size={24} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isStale() ? 'Taux obsolètes' : 'Taux à jour'}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock size={16} />
                  Dernière mise à jour : {getTimeSinceUpdate()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings size={18} />
                Configuration
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Mise à jour...' : 'Actualiser'}
              </button>
            </div>
          </div>

          {isStale() && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ Les taux de change n'ont pas été mis à jour depuis plus de 24 heures. 
                Veuillez actualiser pour obtenir les derniers taux.
              </p>
            </div>
          )}

          {/* API Configuration Panel */}
          {showApiConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Key size={18} />
                Configuration de l'API
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Clé API exchangerate-api.com
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Entrez votre clé API"
                      className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleTestApiKey}
                      disabled={testingApi}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {testingApi ? 'Test...' : 'Tester'}
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Obtenez une clé API gratuite sur{' '}
                    <a
                      href="https://www.exchangerate-api.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      exchangerate-api.com
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Exchange Rates Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Taux de Change (Base: USD)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {exchangeRates.size} devises configurées
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Devise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbole
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux (1 USD =)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Décimales
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(SUPPORTED_CURRENCIES).map((currency, index) => {
                  const rate = currency.code === 'USD' ? 1 : exchangeRates.get(currency.code) || 0;
                  
                  return (
                    <motion.tr
                      key={currency.code}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getFlagEmoji(currency.flag)}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {currency.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-semibold text-gray-900">
                          {currency.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">
                          {currency.symbol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TrendingUp size={16} className="text-green-500" />
                          <span className="text-sm font-mono font-semibold text-gray-900">
                            {rate.toFixed(currency.decimals || 2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-600">
                          {currency.decimals}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="font-semibold text-blue-900 mb-2">
            ℹ️ Informations sur les Taux de Change
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Les taux sont mis à jour automatiquement toutes les heures</li>
            <li>• Source : exchangerate-api.com</li>
            <li>• Les taux sont mis en cache pour optimiser les performances</li>
            <li>• En cas d'échec de l'API, des taux par défaut sont utilisés</li>
            <li>• Les commandes verrouillent le taux au moment de la création</li>
            <li>• Les remboursements utilisent le taux verrouillé de la commande</li>
          </ul>
        </motion.div>
      </div>
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

export default function ExchangeRatesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ExchangeRatesContent />
    </ProtectedRoute>
  );
}
