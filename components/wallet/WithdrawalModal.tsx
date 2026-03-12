'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { getActivePaymentMethods } from '@/lib/firebase/paymentMethods';
import type { PaymentMethod } from '@/types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function WithdrawalModal({ isOpen, onClose, userId }: WithdrawalModalProps) {
  const { wallet, initiateFlexibleWithdrawal, calculateWithdrawalFees, loading } = useWalletStore();
  
  const [step, setStep] = useState<'amount' | 'provider' | 'confirm'>('amount');
  const [amount, setAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [fees, setFees] = useState(0);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);


  useEffect(() => {
  if (isOpen) {
    setPin('');
  }
}, [isOpen]);
  // Charger les méthodes de paiement depuis Firebase
  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

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
        calculateWithdrawalFees(numAmount).then(setFees);
      }
    }
  }, [amount]);

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 1000) {
      setError('Montant minimum: 1,000 FCFA');
      return;
    }

    if (numAmount > 500000) {
      setError('Montant maximum: 500,000 FCFA par jour');
      return;
    }

    if (!wallet || numAmount > wallet.balance) {
      setError('Solde insuffisant');
      return;
    }

    setError('');
    setStep('provider');
  };

  const handleProviderSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!selectedMethod || !accountName.trim() || !accountNumber.trim() || !pin) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('Code PIN invalide (4-6 chiffres)');
      return;
    }

    setError('');
    try {
      const transaction = await initiateFlexibleWithdrawal(userId, {
        paymentMethodId: selectedMethod.id,
        amount: parseFloat(amount),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim()
      });
      
      setReference(transaction.reference || transaction.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setStep('amount');
    setAmount('');
    setSelectedMethod(null);
    setAccountName('');
    setAccountNumber('');
    setPin('');
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
          <h2 className="text-2xl font-bold text-gray-900">Retirer de l'argent</h2>
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
                Retrait en cours !
              </h3>
              <p className="text-gray-600 mb-6">
                Votre demande de retrait est en cours de traitement. Vous recevrez l'argent dans les 24 heures.
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 font-medium mb-1">Solde disponible</p>
                <p className="text-2xl font-bold text-blue-900">
                  {wallet?.balance.toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à retirer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="1000"
                    max="500000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    FCFA
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Min: 1,000 FCFA • Max: 500,000 FCFA/jour
                </p>
              </div>

              {amount && parseFloat(amount) >= 1000 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Montant</span>
                    <span className="font-semibold">{parseFloat(amount).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Frais (0.5%)</span>
                    <span className="font-semibold text-red-600">
                      -{fees.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Vous recevrez</span>
                      <span className="font-bold text-lg text-green-600">
                        {(parseFloat(amount) - fees).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total débité</span>
                      <span className="font-semibold">
                        {parseFloat(amount).toLocaleString('fr-FR')} FCFA
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
                disabled={!amount || parseFloat(amount) < 1000}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            </>
          ) : step === 'provider' ? (
            /* Step 2: Provider Selection */
            <>
              <p className="text-gray-600 mb-6">
                Sélectionnez votre méthode de retrait
              </p>
              
              {loadingMethods ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Aucune méthode de retrait disponible</p>
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
            /* Step 3: Confirmation */
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-orange-900 mb-2">⚠️ Important</p>
                <p className="text-sm text-orange-800">
                  Le montant sera débité immédiatement de votre portefeuille. 
                  Vous recevrez l'argent sur votre compte dans les 24 heures.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{selectedMethod?.name}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Montant</span>
                  <span className="font-semibold">{parseFloat(amount).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Frais</span>
                  <span className="font-semibold text-red-600">-{fees.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Vous recevrez</span>
                    <span className="font-bold text-lg text-green-600">
                      {(parseFloat(amount) - fees).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du compte
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de compte / Téléphone
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="+237 6XX XX XX XX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code PIN (sécurité)
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Entrez votre code PIN pour confirmer le retrait (4-6 chiffres)
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !accountName.trim() || !accountNumber.trim() || !pin}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  'Confirmer le retrait'
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
