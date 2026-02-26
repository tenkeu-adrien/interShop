'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import type { FlexibleTransaction } from '@/types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminWalletTransactionsPage() {
  const { user } = useAuthStore();
  const tAdmin = useTranslations('admin');
  const tWallet = useTranslations('wallet');
  const tCommon = useTranslations('common');
  const { 
    pendingTransactions,
    flexibleTransactions,
    loading, 
    error,
    fetchPendingTransactions,
    fetchFlexibleTransactions,
    validateDeposit,
    validateWithdrawal,
    rejectDeposit,
    rejectWithdrawal
  } = useWalletStore();
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<FlexibleTransaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (user) {
      if (filter === 'pending') {
        const type = typeFilter === 'all' ? undefined : typeFilter;
        fetchPendingTransactions(type);
      } else {
        // Récupérer toutes les transactions avec filtre de statut
        fetchFlexibleTransactions({
          status: filter === 'all' ? undefined : filter,
          type: typeFilter === 'all' ? undefined : typeFilter
        });
      }
    }
  }, [filter, typeFilter, user]);

  const handleApprove = async () => {
    if (!selectedTransaction || !user) return;

    try {
      if (selectedTransaction.type === 'deposit') {
        await validateDeposit(selectedTransaction.id, user.id, adminNotes);
      } else {
        await validateWithdrawal(selectedTransaction.id, user.id, adminNotes);
      }
      
      closeModal();
      alert(tCommon('success'));
    } catch (error) {
      console.error('Erreur:', error);
      alert(tCommon('error'));
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction || !user || !rejectionReason.trim()) {
      alert(tCommon('error'));
      return;
    }

    try {
      if (selectedTransaction.type === 'deposit') {
        await rejectDeposit(selectedTransaction.id, user.id, rejectionReason);
      } else {
        await rejectWithdrawal(selectedTransaction.id, user.id, rejectionReason);
      }
      
      closeModal();
      alert(tCommon('success'));
    } catch (error) {
      console.error('Erreur:', error);
      alert(tCommon('error'));
    }
  };

  const openModal = (transaction: FlexibleTransaction, action: 'approve' | 'reject') => {
    setSelectedTransaction(transaction);
    setActionType(action);
    setShowModal(true);
    setRejectionReason('');
    setAdminNotes('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
    setActionType(null);
    setRejectionReason('');
    setAdminNotes('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Déterminer quelles transactions afficher
  const displayTransactions = filter === 'pending' ? pendingTransactions : flexibleTransactions;

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <Skeleton className="h-6 w-24 mb-2" />
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-32" />)}
          </div>
          <Skeleton className="h-6 w-24 mb-2" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-24" />)}
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{tAdmin('wallet_transactions')}</h1>
          <p className="text-gray-600 mt-1">
            {tWallet('transactions')}
          </p>
        </div>
        <Link
          href="/dashboard/admin"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          {tCommon('back')}
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="space-y-4">
          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tWallet('status')}</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tWallet('status_pending')}
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tWallet('status_completed')}
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'failed'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tAdmin('rejected')}
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tCommon('all')}
              </button>
            </div>
          </div>

          {/* Filtre par type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tCommon('all')}
              </button>
              <button
                onClick={() => setTypeFilter('deposit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  typeFilter === 'deposit'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tWallet('deposit')}
              </button>
              <button
                onClick={() => setTypeFilter('withdrawal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  typeFilter === 'withdrawal'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tWallet('withdraw')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des transactions */}
      {displayTransactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">{tWallet('no_transactions')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      transaction.type === 'deposit'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {transaction.type === 'deposit' ? `↓ ${tWallet('deposit')}` : `↑ ${tWallet('withdraw')}`}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatAmount(transaction.amount)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Client:</span>
                      <p className="font-medium">{transaction.clientName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{tCommon('payment_method')}:</span>
                      <p className="font-medium">{transaction.paymentMethodName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{tCommon('date')}:</span>
                      <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Référence:</span>
                      <p className="font-mono text-xs">{transaction.reference}</p>
                    </div>
                  </div>

                  {(transaction.recipientAccountName || transaction.recipientAccountNumber) && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <span className="text-gray-500 text-sm">Détails du compte destinataire:</span>
                      {transaction.recipientAccountName && (
                        <p className="font-medium">Nom: {transaction.recipientAccountName}</p>
                      )}
                      {transaction.recipientAccountNumber && (
                        <p className="font-medium">Numéro: {transaction.recipientAccountNumber}</p>
                      )}
                    </div>
                  )}
                </div>

                {transaction.status === 'pending' && (
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => openModal(transaction, 'approve')}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                    >
                      ✓ {tAdmin('approve')}
                    </button>
                    <button
                      onClick={() => openModal(transaction, 'reject')}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
                    >
                      ✗ {tAdmin('reject')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {actionType === 'approve' ? tAdmin('approve') : tAdmin('reject')}
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Client: {selectedTransaction.clientName}</p>
              <p className="text-sm text-gray-600">{tWallet('amount')}: {formatAmount(selectedTransaction.amount)}</p>
              <p className="text-sm text-gray-600">{tCommon('payment_method')}: {selectedTransaction.paymentMethodName}</p>
            </div>

            {actionType === 'approve' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-green-600 mt-3">
                  ✓ {formatAmount(selectedTransaction.amount)}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tCommon('reason')} *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                className={`flex-1 px-6 py-3 text-white rounded-lg transition-colors ${
                  actionType === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {tCommon('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
