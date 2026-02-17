'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { 
  ChevronLeft, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function WalletSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallet, setPIN, loading, fetchWallet } = useWalletStore();
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchWallet(user.uid);
  }, [user, router]);

  const handleSetPIN = async () => {
    setError('');
    setSuccess(false);

    // Validation
    if (!newPin || newPin.length < 4 || newPin.length > 6) {
      setError('Le code PIN doit contenir entre 4 et 6 chiffres');
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setError('Le code PIN ne doit contenir que des chiffres');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Les codes PIN ne correspondent pas');
      return;
    }

    // Si un PIN existe déjà, vérifier l'ancien
    if (wallet?.pin && !currentPin) {
      setError('Veuillez entrer votre code PIN actuel');
      return;
    }

    try {
      if (user) {
        await setPIN(user.uid, newPin);
        setSuccess(true);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        
        // Rafraîchir le portefeuille
        await fetchWallet(user.uid);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    }
  };

  if (loading && !wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Paramètres du portefeuille
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez la sécurité de votre portefeuille
          </p>
        </div>

        {/* Statut du PIN */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Code PIN</h2>
          </div>

          {wallet?.pin ? (
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Code PIN configuré</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Aucun code PIN configuré</span>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            Le code PIN est requis pour effectuer des retraits et des paiements importants. 
            Il doit contenir entre 4 et 6 chiffres.
          </p>

          {/* Formulaire */}
          <div className="space-y-4">
            {/* PIN actuel (si existe) */}
            {wallet?.pin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code PIN actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPin ? 'text' : 'password'}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Nouveau PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {wallet?.pin ? 'Nouveau code PIN' : 'Code PIN'} (4-6 chiffres)
              </label>
              <div className="relative">
                <input
                  type={showNewPin ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {newPin && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        newPin.length < 4 ? 'bg-red-500 w-1/3' :
                        newPin.length === 4 ? 'bg-orange-500 w-2/3' :
                        'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {newPin.length}/6
                  </span>
                </div>
              )}
            </div>

            {/* Confirmer PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le code PIN
              </label>
              <div className="relative">
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPin && newPin && (
                <p className={`text-sm mt-2 ${
                  confirmPin === newPin ? 'text-green-600' : 'text-red-600'
                }`}>
                  {confirmPin === newPin ? '✓ Les codes PIN correspondent' : '✗ Les codes PIN ne correspondent pas'}
                </p>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  Code PIN {wallet?.pin ? 'modifié' : 'configuré'} avec succès !
                </p>
              </div>
            )}

            {/* Bouton */}
            <button
              onClick={handleSetPIN}
              disabled={loading || !newPin || newPin.length < 4 || newPin !== confirmPin}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                wallet?.pin ? 'Modifier le code PIN' : 'Définir le code PIN'
              )}
            </button>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            🔒 Conseils de sécurité
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Ne partagez jamais votre code PIN avec qui que ce soit</li>
            <li>• Utilisez un code PIN unique que vous seul connaissez</li>
            <li>• Évitez les codes PIN évidents (1234, 0000, etc.)</li>
            <li>• Après 3 tentatives incorrectes, votre compte sera bloqué pendant 30 minutes</li>
            <li>• Changez régulièrement votre code PIN pour plus de sécurité</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
