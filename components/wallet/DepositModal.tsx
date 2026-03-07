'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { getActivePaymentMethods } from '@/lib/firebase/paymentMethods';
import type { PaymentMethod } from '@/types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function DepositModal({ isOpen, onClose, userId }: DepositModalProps) {
  const { initiateFlexibleDeposit, calculateDepositFees, loading } = useWalletStore();
  
  const [step, setStep] = useState<'amount' | 'provider' | 'instructions'>('amount');
  const [amount, setAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [clientName, setClientName] = useState('');
  const [fees, setFees] = useState(0);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Charger les méthodes de paiement depuis Firebase
  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    setLoadingMethods(true);
    try {
      const methods = await getActivePaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Erreur lors du chargement des méthodes de paiement');
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    if (amount) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount) && numAmount > 0) {
        calculateDepositFees(numAmount).then(setFees);
      }
    }
  }, [amount]);

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 500) {
      setError('Montant minimum: 500 FCFA');
      return;
    }
    setError('');
    setStep('provider');
  };

  const handleProviderSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('instructions');
  };

  const handleSubmit = async () => {
    if (!selectedMethod || !clientName.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setError('');
    try {
      const transaction = await initiateFlexibleDeposit(userId, {
        paymentMethodId: selectedMethod.id,
        clientName: clientName.trim(),
        amount: parseFloat(amount)
      });
      
      setReference(transaction.reference || transaction.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep('amount');
    setAmount('');
    setSelectedMethod(null);
    setClientName('');
    setFees(0);
    setReference('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Déposer de l'argent</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Demande envoyée !
              </h3>
              <p className="text-gray-600 mb-6">
                Votre demande de dépôt est en attente de validation par notre équipe.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Référence</p>
                <p className="font-mono font-semibold text-gray-900">{reference}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700"
              >
                Fermer
              </button>
            </div>
          ) : step === 'amount' ? (
            /* Step 1: Amount */
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à déposer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    FCFA
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Minimum: 500 FCFA</p>
              </div>

              {amount && parseFloat(amount) >= 500 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Montant</span>
                    <span className="font-semibold">{parseFloat(amount).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Frais</span>
                    <span className="font-semibold text-green-600">
                      {fees === 0 ? 'Gratuit' : `${fees.toLocaleString('fr-FR')} FCFA`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">
                        {(parseFloat(amount) + fees).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleAmountSubmit}
                disabled={!amount || parseFloat(amount) < 500}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            </>
          ) : step === 'provider' ? (
            /* Step 2: Provider Selection */
            <>
              <p className="text-gray-600 mb-6">
                Sélectionnez votre méthode de paiement
              </p>
              
              {loadingMethods ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Aucune méthode de paiement disponible</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleProviderSelect(method)}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition flex items-center gap-4"
                    >
                      {method.icon && (
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                          {method.icon}
                        </div>
                      )}
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setStep('amount')}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                ← Retour
              </button>
            </>
          ) : (
            /* Step 3: Instructions */
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-orange-900 mb-2">📋 Instructions</p>
                <div 
                  className="text-sm text-orange-800 prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: selectedMethod?.instructions || '' }}
                />
              </div>

              {/* Détails du compte */}
              {selectedMethod?.accountDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Détails du compte</p>
                  <div className="space-y-2 text-sm">
                    {selectedMethod.accountDetails.accountNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Numéro:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-white px-2 py-1 rounded font-semibold">
                            {selectedMethod.accountDetails.accountNumber}
                          </span>
                          <button
                            onClick={() => copyToClipboard(selectedMethod.accountDetails.accountNumber!)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedMethod.accountDetails.accountName && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-semibold">{selectedMethod.accountDetails.accountName}</span>
                      </div>
                    )}
                    {selectedMethod.accountDetails.bankName && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Banque:</span>
                        <span className="font-semibold">{selectedMethod.accountDetails.bankName}</span>
                      </div>
                    )}
                    {selectedMethod.accountDetails.walletAddress && (
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-600">Adresse:</span>
                        <span className="font-mono text-xs bg-white px-2 py-1 rounded break-all">
                          {selectedMethod.accountDetails.walletAddress}
                        </span>
                      </div>
                    )}
                    {selectedMethod.accountDetails.network && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Réseau:</span>
                        <span className="font-semibold">{selectedMethod.accountDetails.network}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Montant à transférer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(parseFloat(amount) + fees).toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre nom complet
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Ce nom sera utilisé pour identifier votre paiement
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Avertissement */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Important:</strong> Effectuez d'abord le paiement selon les instructions ci-dessus, 
                  puis revenez ici pour confirmer votre dépôt. L'administrateur vérifiera manuellement 
                  la réception du paiement avant de créditer votre portefeuille.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !clientName.trim()}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Soumettre la demande'
                )}
              </button>

              <button
                onClick={() => setStep('provider')}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                ← Retour
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
