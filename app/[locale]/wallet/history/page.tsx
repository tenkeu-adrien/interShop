'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { TransactionFilters } from '@/types';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet as WalletIcon,
  Filter,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function WalletHistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { transactions, loading, fetchTransactions } = useWalletStore();
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchTransactions(user.id, filters);
  }, [user, filters, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété';
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      case 'failed': return 'Échoué';
      default: return status;
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/wallet')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour au portefeuille
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Historique des transactions
          </h1>
          <p className="text-gray-600 mt-2">
            {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Filtres</span>
            </div>
            <span className="text-sm text-gray-600">
              {showFilters ? 'Masquer' : 'Afficher'}
            </span>
          </button>

          {showFilters && (
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de transaction
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => setFilters({...filters, type: e.target.value as any || undefined})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Tous les types</option>
                    <option value="deposit">Dépôts</option>
                    <option value="withdrawal">Retraits</option>
                    <option value="payment">Paiements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({...filters, status: e.target.value as any || undefined})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="processing">En cours</option>
                    <option value="completed">Complété</option>
                    <option value="failed">Échoué</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setFilters({})}
                className="mt-4 text-sm text-orange-600 hover:text-orange-700"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Liste des transactions */}
        <div className="bg-white rounded-lg shadow">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <WalletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune transaction trouvée</p>
              <p className="text-gray-400 text-sm mt-2">
                Vos transactions apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/wallet/transaction/${transaction.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        transaction.type === 'deposit' ? 'bg-green-100' :
                        transaction.type === 'withdrawal' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <ArrowDownCircle className="w-6 h-6 text-green-600" />
                        ) : transaction.type === 'withdrawal' ? (
                          <ArrowUpCircle className="w-6 h-6 text-red-600" />
                        ) : (
                          <WalletIcon className="w-6 h-6 text-blue-600" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 mb-1">
                          {transaction.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span>
                            {formatDistanceToNow(transaction.createdAt, { 
                              addSuffix: true,
                              locale: fr 
                            })}
                          </span>
                          {transaction.reference && (
                            <span className="font-mono text-xs">
                              {transaction.reference}
                            </span>
                          )}
                          {transaction.mobileMoneyProvider && (
                            <span className="uppercase">
                              {transaction.mobileMoneyProvider}
                            </span>
                          )}
                        </div>
                        {transaction.fees > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Frais: {transaction.fees.toLocaleString('fr-FR')} FCFA
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className={`font-semibold text-lg mb-1 ${
                        transaction.type === 'deposit' ? 'text-green-600' :
                        transaction.type === 'withdrawal' ? 'text-red-600' :
                        'text-gray-900'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}
                        {transaction.amount.toLocaleString('fr-FR')} FCFA
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
