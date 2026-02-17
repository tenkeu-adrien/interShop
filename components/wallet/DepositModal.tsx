'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { MobileMoneyProvider } from '@/types';

interface DepositModalProps {
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

// Comptes Mobile Money de la plateforme (à configurer par admin)
const PLATFORM_ACCOUNTS: Record<MobileMoneyProvider, string> = {
  mtn: '+237 670 00 00 00',
  orange: '+225 07 00 00 00',
  moov: '+226 70 00 00 00',
  wave: '+221 77 000 00 00',
  vodafone: '+233 50 000 0000',
  airtel: '+234 802 000 0000'
};

export default function DepositModal({ isOpen, onClose, userId }: DepositModalProps) {
  const { initiateDeposit, calculateDepositFees, loading } = useWalletStore();
  
  const [step, setStep] = useState<'amount' | 'provider' | 'instructions'>('amount');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<MobileMoneyProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fees, setFees] = useState(0);
  const [reference, setReference] = useState('');
  const [mobileMoneyTransactionId, setMobileMoneyTransactionId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleProviderSelect = (selectedProvider: MobileMoneyProvider) => {
    setProvider(selectedProvider);
    setStep('instructions');
  };

  const handleSubmit = async () => {
    if (!provider || !phoneNumber || !mobileMoneyTransactionId) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setError('');
    try {
      const transaction = await initiateDeposit(userId, {
        amount: parseFloat(amount),
        provider,
        phoneNumber
      });
      
      setReference(transaction.reference);
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
    setProvider(null);
    setPhoneNumber('');
    setFees(0);
    setReference('');
    setMobileMoneyTransactionId('');
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
            /* Step 3: Instructions */
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-orange-900 mb-2">📱 Instructions</p>
                <ol className="text-sm text-orange-800 space-y-2">
                  <li>1. Ouvrez votre application {provider?.toUpperCase()} Mobile Money</li>
                  <li>2. Sélectionnez "Transfert d'argent"</li>
                  <li>3. Transférez vers le numéro ci-dessous</li>
                  <li>4. Entrez le code de transaction reçu</li>
                </ol>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Numéro InterShop {provider?.toUpperCase()}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-gray-900">
                    {provider && PLATFORM_ACCOUNTS[provider]}
                  </p>
                  <button
                    onClick={() => provider && copyToClipboard(PLATFORM_ACCOUNTS[provider])}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Montant à transférer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(parseFloat(amount) + fees).toLocaleString('fr-FR')} FCFA
                </p>
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
                  Code de transaction Mobile Money
                </label>
                <input
                  type="text"
                  value={mobileMoneyTransactionId}
                  onChange={(e) => setMobileMoneyTransactionId(e.target.value)}
                  placeholder="Ex: MP240214.1234.A12345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Code reçu par SMS après le transfert
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
                disabled={loading || !phoneNumber || !mobileMoneyTransactionId}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
