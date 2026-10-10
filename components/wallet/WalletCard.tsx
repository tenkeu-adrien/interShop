'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownCircle, ArrowUpCircle, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { useWalletCurrency } from '@/hooks/useWalletCurrency';
import { SUPPORTED_CURRENCIES } from '@/lib/constants/currencies';
import { SupportedCurrency } from '@/types';
import DepositModal from '@/components/wallet/DepositModal';
import WithdrawalModal from '@/components/wallet/WithdrawalModal';

// Réduit la police quand le montant est long pour qu'il reste dans la carte.
const amountSizeClass = (text: string) =>
  text.length > 22 ? 'text-xl' : text.length > 16 ? 'text-2xl' : text.length > 12 ? 'text-3xl' : 'text-4xl';

const ACTION_CLASS =
  'bg-white py-3 px-1 rounded-lg text-sm sm:text-base font-medium transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-md min-w-0';

export default function WalletCard({ className = '' }: { className?: string }) {
  const router = useRouter();
  const t = useTranslations('wallet');
  const user = useAuthStore((s) => s.user);
  const { wallet, fetchWallet } = useWalletStore();
  const exchangeRates = useCurrencyStore((s) => s.exchangeRates);
  // Le portefeuille est tenu dans la devise du pays de l'utilisateur ;
  // le sélecteur ne fait que convertir l'affichage, le temps de la visite.
  const walletCurrency = useWalletCurrency();
  const [chosenCurrency, setChosenCurrency] = useState<SupportedCurrency | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  useEffect(() => {
    if (user) fetchWallet(user.id).catch(() => {});
  }, [user?.id, fetchWallet]);

  // Taux exprimés pour 1 USD.
  const rateOf = (currency: SupportedCurrency) => (currency === 'USD' ? 1 : exchangeRates.get(currency));
  const displayCurrency =
    chosenCurrency && rateOf(chosenCurrency) && rateOf(walletCurrency) ? chosenCurrency : walletCurrency;

  const formatAmount = (amountInWalletCurrency: number) => {
    const converted =
      displayCurrency === walletCurrency
        ? amountInWalletCurrency
        : (amountInWalletCurrency / rateOf(walletCurrency)!) * rateOf(displayCurrency)!;
    return `${converted.toLocaleString('fr-FR', {
      maximumFractionDigits: SUPPORTED_CURRENCIES[displayCurrency].decimals,
    })} ${displayCurrency}`;
  };

  const balanceText = formatAmount(wallet?.balance ?? 0);

  return (
    <>
      <div className={`bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-2xl p-5 sm:p-8 text-gray-900 shadow-xl ${className}`}>
        <p className="text-sm mb-1 opacity-90">{t('available_balance')}</p>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="min-w-0 flex-1">
            <p className={`${amountSizeClass(balanceText)} font-bold break-words`}>{balanceText}</p>
            {displayCurrency !== walletCurrency && (
              <p className="text-sm mt-1 opacity-80">
                = {(wallet?.balance ?? 0).toLocaleString('fr-FR')} {walletCurrency}
              </p>
            )}
          </div>
          <label className="shrink-0 flex items-center gap-2 text-sm font-medium">
            <span className="hidden sm:inline">{t('convert_to')}</span>
            <select
              aria-label={t('convert_to')}
              value={displayCurrency}
              onChange={(e) => setChosenCurrency(e.target.value as SupportedCurrency)}
              disabled={!rateOf(walletCurrency)}
              className="bg-white text-gray-900 text-sm font-semibold rounded-lg px-2 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {Object.values(SUPPORTED_CURRENCIES)
                .filter((c) => c.code === walletCurrency || rateOf(c.code))
                .map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
            </select>
          </label>
        </div>

        {wallet && wallet.pendingBalance > 0 && (
          <div className="bg-white/20 rounded-lg p-4 mb-6">
            <p className="text-sm mb-1 opacity-90">{t('pending_balance')}</p>
            <p className="text-2xl font-semibold break-words">{formatAmount(wallet.pendingBalance)}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <button onClick={() => setShowDepositModal(true)} className={`${ACTION_CLASS} text-green-600 hover:bg-green-50`}>
            <ArrowDownCircle className="w-5 h-5" />
            {t('deposit')}
          </button>
          <button onClick={() => router.push('/wallet/transfer')} className={`${ACTION_CLASS} text-yellow-600 hover:bg-yellow-50`}>
            <ArrowRight className="w-5 h-5" />
            {t('transfer')}
          </button>
          <button onClick={() => setShowWithdrawalModal(true)} className={`${ACTION_CLASS} text-yellow-600 hover:bg-yellow-50`}>
            <ArrowUpCircle className="w-5 h-5" />
            {t('withdraw')}
          </button>
        </div>
      </div>

      {user && (
        <>
          <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} userId={user.id} />
          <WithdrawalModal isOpen={showWithdrawalModal} onClose={() => setShowWithdrawalModal(false)} userId={user.id} />
        </>
      )}
    </>
  );
}
