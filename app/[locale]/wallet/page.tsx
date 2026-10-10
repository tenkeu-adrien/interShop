'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { 
  Wallet as WalletIcon, 
  ArrowDownCircle, 
  ArrowUpCircle,
  History, 
  Settings,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toDate } from '@/lib/utils/date';
import { useTranslations } from 'next-intl';
import WalletCard from '@/components/wallet/WalletCard';
import { useWalletCurrency } from '@/hooks/useWalletCurrency';

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallet, transactions, loading, error, fetchWallet, fetchTransactions } = useWalletStore();
  const t = useTranslations('wallet');
  
  const walletCurrency = useWalletCurrency();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

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

        <WalletCard className="mb-8" />

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
                        {transaction.amount.toLocaleString('fr-FR')} {walletCurrency}
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
      
    </div>
  );
}
