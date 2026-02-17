'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { MobileMoneyProvider } from '@/types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const MOBILE_MONEY_PROVIDERS = [
  { id: 'mtn' as MobileMoneyProvider, name: 'MTN Mobile Money', flag: '🇨🇲', color: 'bg-yellow-500' },
  { id: 'orange' as MobileMoneyProvider, name: 'Orange Money', flag: '🇨🇮', color: 'bg-orange-500' },
  { id: 'moov' as MobileMoneyProvider, name: 'Moov Money', flag: '🇧🇫', color: 'bg-blue-500' },
  { id: 'wave' as MobileMoneyProvider, name: 'Wave', flag: '🇸🇳', color: 'bg-pink-500' },
];

export default function WithdrawalModal({ isOpen, onClose, userId }: WithdrawalModalProps) {
  const { wallet, initiateWithdrawal, calculateWithdrawalFees, loading } = useWalletStore();
  
  const [step, setStep] = useState<'amount' | 'provider' | 'confirm'>('amount');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<MobileMoneyProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [fees, setFees] = useState(0);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

    if (!wallet || numAmount + fees > wallet.balance) {
      setError('Solde insuffisant');
      return;
    }

    setError('');
    setStep('provider');
  };

  const handleProviderSelect = (selectedProvider: MobileMoneyProvider) => {
    setProvider(selectedProvider);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!provider || !phoneNumber || !pin) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('Code PIN invalide (4-6 chiffres)');
      return;
    }

    setError('');
    try {
      const transaction = await initiateWithdrawal(userId, {
        amount: parseFloat(amount),
        provider,
        phoneNumber,
        pin
      });
      
      setReference(transaction.reference);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setStep('amount');
    setAmount('');
    setProvider(null);
    setPhoneNumber('');
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
                    <span className="text-gray-600">Frais (2%)</span>
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
                Sélectionnez votre service Mobile Money
              </p>
              <div className="space-y-3 mb-6">
                {MOBILE_MONEY_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProviderSelect(p.id)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 ${p.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {p.flag}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-600">Disponible</p>
                    </div>
                  </button>
                ))}
              </div>
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
                  Vous recevrez l'argent sur votre Mobile Money dans les 24 heures.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{provider?.toUpperCase()} Mobile Money</span>
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
                  Votre numéro Mobile Money
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+237 6XX XX XX XX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••"
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
                  4 à 6 chiffres
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
                disabled={loading || !phoneNumber || !pin}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="w-full text-gray-600 hover:text-gray-800 mt-4"
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
