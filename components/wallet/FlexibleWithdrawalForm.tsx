'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import type { PaymentMethod, FlexibleWithdrawalData } from '@/types';

interface FlexibleWithdrawalFormProps {
  paymentMethod: PaymentMethod;
  onSubmit: (data: FlexibleWithdrawalData) => Promise<void>;
  onCancel: () => void;
}

export default function FlexibleWithdrawalForm({
  paymentMethod,
  onSubmit,
  onCancel
}: FlexibleWithdrawalFormProps) {
  const { user } = useAuthStore();
  const { wallet, fetchWallet } = useWalletStore();
  
  const [amount, setAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchWallet(user.id);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);

    // Validations
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Montant invalide');
      return;
    }

    if (!wallet) {
      setError('Portefeuille non chargé');
      return;
    }

    if (numAmount > wallet.balance) {
      setError(`Solde insuffisant. Votre solde: ${wallet.balance.toLocaleString('fr-FR')} FCFA`);
      return;
    }

    if (!accountDetails.trim()) {
      setError('Veuillez entrer vos coordonnées de réception');
      return;
    }

    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        paymentMethodId: paymentMethod.id,
        amount: numAmount,
        accountDetails: accountDetails.trim()
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la demande de retrait');
      setLoading(false);
    }
  };

  const getAccountDetailsPlaceholder = () => {
    switch (paymentMethod.type) {
      case 'mobile_money':
      case 'mpesa':
        return 'Ex: +237 6XX XX XX XX';
      case 'crypto':
        return 'Ex: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      case 'bank_transfer':
        return 'Ex: Ecobank - 1234567890 - Jean Dupont';
      default:
        return 'Entrez vos coordonnées de réception';
    }
  };

  const getAccountDetailsLabel = () => {
    switch (paymentMethod.type) {
      case 'mobile_money':
      case 'mpesa':
        return 'Votre numéro Mobile Money';
      case 'crypto':
        return 'Votre adresse wallet';
      case 'bank_transfer':
        return 'Vos coordonnées bancaires';
      default:
        return 'Vos coordonnées de réception';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Retrait via {paymentMethod.name}
        </h2>

        {/* Solde disponible */}
        {wallet && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 mb-1">Solde disponible</p>
            <p className="text-3xl font-bold text-blue-900">
              {wallet.balance.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">📋 Instructions</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {paymentMethod.instructions}
          </p>
        </div>

        {/* Informations de la méthode */}
        {paymentMethod.accountDetails && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-orange-900 mb-2">
              ℹ️ Informations importantes
            </h3>
            <div className="text-sm text-orange-800 space-y-1">
              {paymentMethod.accountDetails.accountNumber && (
                <p>• Le paiement sera effectué depuis: {paymentMethod.accountDetails.accountNumber}</p>
              )}
              {paymentMethod.accountDetails.walletAddress && (
                <p className="font-mono text-xs break-all">
                  • Adresse: {paymentMethod.accountDetails.walletAddress}
                </p>
              )}
              {paymentMethod.accountDetails.network && (
                <p>• Réseau: {paymentMethod.accountDetails.network}</p>
              )}
              {paymentMethod.accountDetails.bankName && (
                <p>• Banque: {paymentMethod.accountDetails.bankName}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à retirer *
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                min="1"
                max={wallet?.balance || 0}
                step="1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                FCFA
              </span>
            </div>
            {wallet && (
              <p className="text-sm text-gray-600 mt-1">
                Maximum: {wallet.balance.toLocaleString('fr-FR')} FCFA
              </p>
            )}
          </div>

          {/* Coordonnées de réception */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getAccountDetailsLabel()} *
            </label>
            <textarea
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              placeholder={getAccountDetailsPlaceholder()}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              Entrez les coordonnées où vous souhaitez recevoir le paiement
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Avertissement */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Vérifiez bien vos coordonnées. Une erreur peut entraîner un retard ou une perte du paiement.
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Confirmer le retrait'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
