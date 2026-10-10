'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { 
  Wallet as WalletIcon, 
  ArrowDownCircle, 
  ArrowUpCircle,
  ArrowRight,
  History, 
  Settings,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toDate } from '@/lib/utils/date';
import { useTranslations } from 'next-intl';
import DepositModal from '@/components/wallet/DepositModal';
import WithdrawalModal from '@/components/wallet/WithdrawalModal';
import { useCurrencyStore } from '@/store/currencyStore';
import { SUPPORTED_CURRENCIES } from '@/lib/constants/currencies';
import { getCountryCurrency } from '@/lib/data/phoneCountries';
import { SupportedCurrency } from '@/types';

const WALLET_CURRENCY: SupportedCurrency = 'CDF';
const DISPLAY_CURRENCY_KEY = 'wallet-display-currency';

// Réduit la police quand le montant est long pour qu'il reste dans la carte.
const amountSizeClass = (text: string) =>
  text.length > 22 ? 'text-xl' : text.length > 16 ? 'text-2xl' : text.length > 12 ? 'text-3xl' : 'text-4xl';

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallet, transactions, loading, error, fetchWallet, fetchTransactions } = useWalletStore();
  const t = useTranslations('wallet');
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const exchangeRates = useCurrencyStore((s) => s.exchangeRates);
  const [chosenCurrency, setChosenCurrency] = useState<SupportedCurrency | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(DISPLAY_CURRENCY_KEY) as SupportedCurrency | null;
    if (saved && SUPPORTED_CURRENCIES[saved]) setChosenCurrency(saved);
  }, []);

  // Les taux sont exprimés pour 1 USD ; sans taux disponible on reste dans la devise du portefeuille.
  const rateOf = (currency: SupportedCurrency) => (currency === 'USD' ? 1 : exchangeRates.get(currency));
  const preferredCurrency = chosenCurrency ?? getCountryCurrency(user?.phoneCountryCode);
  const canConvert = Boolean(rateOf(WALLET_CURRENCY) && rateOf(preferredCurrency));
  const displayCurrency = canConvert ? preferredCurrency : WALLET_CURRENCY;

  const formatAmount = (amountInWalletCurrency: number) => {
    const converted =
      displayCurrency === WALLET_CURRENCY
        ? amountInWalletCurrency
        : (amountInWalletCurrency / rateOf(WALLET_CURRENCY)!) * rateOf(displayCurrency)!;
    return `${converted.toLocaleString('fr-FR', {
      maximumFractionDigits: SUPPORTED_CURRENCIES[displayCurrency].decimals,
    })} ${displayCurrency}`;
  };

  const changeDisplayCurrency = (currency: SupportedCurrency) => {
    setChosenCurrency(currency);
    localStorage.setItem(DISPLAY_CURRENCY_KEY, currency);
  };

  const balanceText = formatAmount(wallet?.balance ?? 0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Charger le portefeuille et les transactions
    fetchWallet(user.id);
    fetchTransactions(user.id);
  }, [user, router]);

  if (loading && !wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <WalletIcon className="w-8 h-8 text-green-600" />
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{t('load_error')}</p>
          </div>
        )}

        {/* Carte du portefeuille */}
        <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-2xl p-5 sm:p-8 text-gray-900 mb-8 shadow-xl">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <p className="text-sm mb-1 opacity-90">
                {t('available_balance')}
              </p>
              <p className={`${amountSizeClass(balanceText)} font-bold break-words`}>
                {balanceText}
              </p>
              {displayCurrency !== WALLET_CURRENCY && (
                <p className="text-sm mt-1 opacity-80">
                  = {(wallet?.balance ?? 0).toLocaleString('fr-FR')} {WALLET_CURRENCY}
                </p>
              )}
            </div>
            <label className="shrink-0 text-xs font-medium">
              <span className="block mb-1 opacity-90">{t('convert_to')}</span>
              <select
                value={displayCurrency}
                onChange={(e) => changeDisplayCurrency(e.target.value as SupportedCurrency)}
                disabled={!rateOf(WALLET_CURRENCY)}
                className="bg-white text-gray-900 text-sm font-semibold rounded-lg px-2 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 max-w-[9rem]"
              >
                {Object.values(SUPPORTED_CURRENCIES)
                  .filter((c) => rateOf(c.code))
                  .map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {wallet && wallet.pendingBalance > 0 && (
            <div className="bg-white/20 rounded-lg p-4 mb-6">
              <p className="text-sm mb-1 opacity-90">
                {t('pending_balance')}
              </p>
              <p className="text-2xl font-semibold break-words">
                {formatAmount(wallet.pendingBalance)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <button
              onClick={() => setShowDepositModal(true)}
              className="bg-white text-green-600 py-3 px-1 rounded-lg text-sm sm:text-base font-medium hover:bg-green-50 transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-md min-w-0"
            >
              <ArrowDownCircle className="w-5 h-5" />
              {t('deposit')}
            </button>
            <button
              onClick={() => router.push('/wallet/transfer')}
              className="bg-white text-yellow-600 py-3 px-1 rounded-lg text-sm sm:text-base font-medium hover:bg-yellow-50 transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-md min-w-0"
            >
              <ArrowRight className="w-5 h-5" />
              {t('transfer')}
            </button>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="bg-white text-yellow-600 py-3 px-1 rounded-lg text-sm sm:text-base font-medium hover:bg-yellow-50 transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-md min-w-0"
            >
              <ArrowUpCircle className="w-5 h-5" />
              {t('withdraw')}
            </button>
          </div>
        </div>

        {/* Boutons secondaires */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push('/wallet/history')}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center gap-3"
          >
            <History className="w-6 h-6 text-gray-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">
                {t('history')}
              </p>
              <p className="text-sm text-gray-600">
                {t('view_all_transactions')}
              </p>
            </div>
          </button>
          <button
            onClick={() => router.push('/wallet/settings')}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center gap-3"
          >
            <Settings className="w-6 h-6 text-gray-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">
                {t('settings')}
              </p>
              <p className="text-sm text-gray-600">
                {t('settings_description')}
              </p>
            </div>
          </button>
        </div>

        {/* Transactions récentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('recent_transactions')}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {t('no_transactions')}
              </div>
            ) : (
              transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/wallet/transaction/${transaction.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit' ? 'bg-green-100' :
                        transaction.type === 'withdrawal' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <ArrowDownCircle className="w-5 h-5 text-green-600" />
                        ) : transaction.type === 'withdrawal' ? (
                          <ArrowUpCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <WalletIcon className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(toDate(transaction.createdAt), { 
                            addSuffix: true,
                            locale: fr 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'deposit' ? 'text-green-600' :
                        transaction.type === 'withdrawal' ? 'text-red-600' :
                        'text-gray-900'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </p>
                      <p className={`text-sm ${
                        transaction.status === 'completed' ? 'text-green-600' :
                        transaction.status === 'pending' ? 'text-orange-600' :
                        transaction.status === 'failed' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {transaction.status === 'completed'
                          ? t('status_completed')
                          : transaction.status === 'pending'
                            ? t('status_pending')
                            : transaction.status === 'failed'
                              ? t('status_failed')
                              : transaction.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {transactions.length > 5 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => router.push('/wallet/history')}
                className="w-full text-center text-orange-600 hover:text-orange-700 font-medium"
              >
                {t('view_all_transactions')}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {user && (
        <>
          <DepositModal 
            isOpen={showDepositModal} 
            onClose={() => setShowDepositModal(false)} 
            userId={user.id} 
          />
          <WithdrawalModal 
            isOpen={showWithdrawalModal} 
            onClose={() => setShowWithdrawalModal(false)} 
            userId={user.id} 
          />
        </>
      )}
    </div>
  );
}
