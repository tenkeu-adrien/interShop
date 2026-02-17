'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { PaymentMethod, FlexibleDepositData } from '@/types';

interface FlexibleDepositFormProps {
  paymentMethod: PaymentMethod;
  onSubmit: (data: FlexibleDepositData) => Promise<void>;
  onCancel: () => void;
}

export default function FlexibleDepositForm({
  paymentMethod,
  onSubmit,
  onCancel
}: FlexibleDepositFormProps) {
  const { user } = useAuthStore();
  
  // État du formulaire
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pré-remplir le nom avec le displayName de l'utilisateur
  useEffect(() => {
    if (user?.displayName) {
      setClientName(user.displayName);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!clientName.trim()) {
      setError('Le nom est obligatoire');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Le montant doit être un nombre positif');
      return;
    }
    
    setLoading(true);
    
    try {
      const data: FlexibleDepositData = {
        paymentMethodId: paymentMethod.id,
        clientName: clientName.trim(),
        amount: amountNum
      };
      
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Dépôt via {paymentMethod.name}
      </h2>
      
      {/* Instructions de paiement */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          📋 Instructions de paiement
        </h3>
        <div 
          className="text-sm text-blue-800 prose prose-sm"
          dangerouslySetInnerHTML={{ __html: paymentMethod.instructions }}
        />
        
        {/* Détails du compte */}
        {paymentMethod.accountDetails && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              Détails du compte
            </h4>
            <div className="space-y-1 text-sm">
              {paymentMethod.accountDetails.accountNumber && (
                <p>
                  <span className="font-medium">Numéro:</span>{' '}
                  <span className="font-mono bg-white px-2 py-1 rounded">
                    {paymentMethod.accountDetails.accountNumber}
                  </span>
                </p>
              )}
              {paymentMethod.accountDetails.accountName && (
                <p>
                  <span className="font-medium">Nom:</span>{' '}
                  {paymentMethod.accountDetails.accountName}
                </p>
              )}
              {paymentMethod.accountDetails.bankName && (
                <p>
                  <span className="font-medium">Banque:</span>{' '}
                  {paymentMethod.accountDetails.bankName}
                </p>
              )}
              {paymentMethod.accountDetails.walletAddress && (
                <p>
                  <span className="font-medium">Adresse:</span>{' '}
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded break-all">
                    {paymentMethod.accountDetails.walletAddress}
                  </span>
                </p>
              )}
              {paymentMethod.accountDetails.network && (
                <p>
                  <span className="font-medium">Réseau:</span>{' '}
                  {paymentMethod.accountDetails.network}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom du client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Entrez votre nom"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Ce nom sera utilisé pour identifier votre paiement
          </p>
        </div>
        
        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Montant (FCFA) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 10000"
            min="1"
            step="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
        
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Avertissement */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Important:</strong> Effectuez d'abord le paiement selon les instructions ci-dessus, 
            puis revenez ici pour confirmer votre dépôt. L'administrateur vérifiera manuellement 
            la réception du paiement avant de créditer votre portefeuille.
          </p>
        </div>
        
        {/* Boutons */}
        <div className="flex gap-4 pt-4">
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
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Confirmer le dépôt'}
          </button>
        </div>
      </form>
    </div>
  );
}
