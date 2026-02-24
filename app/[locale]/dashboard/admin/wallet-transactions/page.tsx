'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import type { FlexibleTransaction } from '@/types';

export default function AdminWalletTransactionsPage() {
  const { user } = useAuthStore();
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
      alert('Transaction approuvée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction || !user || !rejectionReason.trim()) {
      alert('La raison du rejet est obligatoire');
      return;
    }

    try {
      if (selectedTransaction.type === 'deposit') {
        await rejectDeposit(selectedTransaction.id, user.id, rejectionReason);
      } else {
        await rejectWithdrawal(selectedTransaction.id, user.id, rejectionReason);
      }
      
      closeModal();
      alert('Transaction rejetée');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du rejet');
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions en Attente</h1>
        <p className="text-gray-600 mt-1">
          Vérifiez et validez les demandes de dépôt et retrait
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="space-y-4">
          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approuvées
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'failed'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejetées
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes
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
                Tous
              </button>
              <button
                onClick={() => setTypeFilter('deposit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  typeFilter === 'deposit'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dépôts
              </button>
              <button
                onClick={() => setTypeFilter('withdrawal')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  typeFilter === 'withdrawal'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Retraits
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des transactions */}
      {displayTransactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Aucune transaction en attente</p>
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
                      {transaction.type === 'deposit' ? '↓ Dépôt' : '↑ Retrait'}
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
                      <span className="text-gray-500">Méthode:</span>
                      <p className="font-medium">{transaction.paymentMethodName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
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
                      ✓ Approuver
                    </button>
                    <button
                      onClick={() => openModal(transaction, 'reject')}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
                    >
                      ✗ Rejeter
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
              {actionType === 'approve' ? 'Approuver' : 'Rejeter'} la transaction
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Client: {selectedTransaction.clientName}</p>
              <p className="text-sm text-gray-600">Montant: {formatAmount(selectedTransaction.amount)}</p>
              <p className="text-sm text-gray-600">Méthode: {selectedTransaction.paymentMethodName}</p>
            </div>

            {actionType === 'approve' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ajoutez des notes sur cette validation..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-green-600 mt-3">
                  ✓ Le portefeuille du client sera crédité de {formatAmount(selectedTransaction.amount)}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du rejet *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous rejetez cette transaction..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                />
                <p className="text-sm text-red-600 mt-3">
                  ✗ Le portefeuille ne sera pas crédité
                </p>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                className={`flex-1 px-6 py-3 text-white rounded-lg transition-colors ${
                  actionType === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
