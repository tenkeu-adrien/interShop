'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  getWalletStatistics, 
  getPendingTransactions,
  validateDeposit,
  validateWithdrawal,
  rejectDeposit,
  rejectWithdrawal
} from '@/lib/firebase/wallet';
import { WalletStatistics, Transaction } from '@/types';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminWalletPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<WalletStatistics | null>(null);
  const [pendingDeposits, setPendingDeposits] = useState<Transaction[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Vérifier si admin
    // TODO: Ajouter vérification du rôle admin

    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, deposits, withdrawals] = await Promise.all([
        getWalletStatistics(),
        getPendingTransactions('deposit'),
        getPendingTransactions('withdrawal')
      ]);
      setStats(statsData);
      setPendingDeposits(deposits);
      setPendingWithdrawals(withdrawals);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateDeposit = async (transactionId: string) => {
    const mobileMoneyId = prompt('Entrez le code de transaction Mobile Money reçu:');
    if (!mobileMoneyId) return;

    try {
      setProcessing(transactionId);
      await validateDeposit(transactionId, user!.id, mobileMoneyId);
      await loadData();
      alert('Dépôt validé avec succès !');
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectDeposit = async (transactionId: string) => {
    const reason = prompt('Raison du rejet:');
    if (!reason) return;

    try {
      setProcessing(transactionId);
      await rejectDeposit(transactionId, user!.id, reason);
      await loadData();
      alert('Dépôt rejeté');
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleValidateWithdrawal = async (transactionId: string) => {
    const mobileMoneyId = prompt('Entrez le code de transaction Mobile Money envoyé:');
    if (!mobileMoneyId) return;

    try {
      setProcessing(transactionId);
      await validateWithdrawal(transactionId, user!.id, mobileMoneyId);
      await loadData();
      alert('Retrait validé avec succès !');
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectWithdrawal = async (transactionId: string) => {
    const reason = prompt('Raison du rejet:');
    if (!reason) return;

    try {
      setProcessing(transactionId);
      await rejectWithdrawal(transactionId, user!.id, reason);
      await loadData();
      alert('Retrait rejeté et solde recrédité');
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <WalletIcon className="w-8 h-8 text-orange-600" />
            Gestion du Portefeuille
          </h1>
          <p className="text-gray-600 mt-2">
            Validez les transactions et gérez les portefeuilles
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Portefeuilles actifs</p>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeWallets}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                sur {stats.totalWallets} total
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Solde total</p>
                <WalletIcon className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBalance.toLocaleString('fr-FR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">FCFA</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Dépôts totaux</p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                +{stats.totalDeposits.toLocaleString('fr-FR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">FCFA</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Retraits totaux</p>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                -{stats.totalWithdrawals.toLocaleString('fr-FR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">FCFA</p>
            </div>
          </div>
        )}

        {/* Transactions en attente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Transactions en attente</p>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {stats?.pendingTransactions || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Aujourd'hui</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.todayTransactions || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.todayVolume.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>

        {/* Dépôts en attente */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Dépôts en attente ({pendingDeposits.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingDeposits.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun dépôt en attente
              </div>
            ) : (
              pendingDeposits.map((transaction) => (
                <div key={transaction.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-900 mb-1">
                        {transaction.amount.toLocaleString('fr-FR')} FCFA
                      </p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Service: <span className="uppercase font-medium">{transaction.mobileMoneyProvider}</span></p>
                        <p>Numéro: <span className="font-medium">{transaction.mobileMoneyNumber}</span></p>
                        <p>Référence: <span className="font-mono text-xs">{transaction.reference}</span></p>
                        {transaction.fees > 0 && (
                          <p>Frais: <span className="font-medium">{transaction.fees.toLocaleString('fr-FR')} FCFA</span></p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidateDeposit(transaction.id)}
                        disabled={processing === transaction.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {processing === transaction.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Valider
                      </button>
                      <button
                        onClick={() => handleRejectDeposit(transaction.id)}
                        disabled={processing === transaction.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Retraits en attente */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
              Retraits en attente ({pendingWithdrawals.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingWithdrawals.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun retrait en attente
              </div>
            ) : (
              pendingWithdrawals.map((transaction) => (
                <div key={transaction.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-900 mb-1">
                        {transaction.amount.toLocaleString('fr-FR')} FCFA
                      </p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Service: <span className="uppercase font-medium">{transaction.mobileMoneyProvider}</span></p>
                        <p>Numéro: <span className="font-medium">{transaction.mobileMoneyNumber}</span></p>
                        <p>Référence: <span className="font-mono text-xs">{transaction.reference}</span></p>
                        {transaction.fees > 0 && (
                          <p>Frais: <span className="font-medium">{transaction.fees.toLocaleString('fr-FR')} FCFA</span></p>
                        )}
                        <p className="text-orange-600 font-medium">
                          ⚠️ Solde déjà débité du portefeuille
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValidateWithdrawal(transaction.id)}
                        disabled={processing === transaction.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {processing === transaction.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Valider
                      </button>
                      <button
                        onClick={() => handleRejectWithdrawal(transaction.id)}
                        disabled={processing === transaction.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
