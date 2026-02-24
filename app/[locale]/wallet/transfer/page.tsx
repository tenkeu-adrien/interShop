'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { 
  ArrowRight, 
  Search, 
  User, 
  Check, 
  X,
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User as UserType } from '@/types';
import toast from 'react-hot-toast';
import { BackButton } from '@/components/ui/BackButton';

type Step = 'search' | 'confirm' | 'pin' | 'success';

export default function TransferPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { wallet, processPayment, verifyPIN, fetchWallet } = useWalletStore();

  // États
  const [step, setStep] = useState<Step>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchWallet(user.id);
  }, [user, router]);

  // Recherche d'utilisateurs
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Entrez un email ou numéro de téléphone');
      return;
    }

    setSearching(true);
    try {
      // Recherche par email
      const emailQuery = query(
        collection(db, 'users'),
        where('email', '==', searchQuery.trim().toLowerCase()),
        limit(5)
      );
      const emailResults = await getDocs(emailQuery);

      // Recherche par téléphone
      const phoneQuery = query(
        collection(db, 'users'),
        where('phoneNumber', '==', searchQuery.trim()),
        limit(5)
      );
      const phoneResults = await getDocs(phoneQuery);

      // Combiner les résultats
      const users: UserType[] = [];
      const seenIds = new Set();

      [...emailResults.docs, ...phoneResults.docs].forEach(doc => {
        if (!seenIds.has(doc.id) && doc.id !== user?.id) {
          seenIds.add(doc.id);
          users.push({ id: doc.id, ...doc.data() } as UserType);
        }
      });

      setSearchResults(users);

      if (users.length === 0) {
        toast.error('Aucun utilisateur trouvé');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setSearching(false);
    }
  };

  // Sélectionner un utilisateur
  const handleSelectUser = (selectedUser: UserType) => {
    setSelectedUser(selectedUser);
    setSearchResults([]);
    setSearchQuery('');
  };

  // Passer à l'étape de confirmation
  const handleContinueToConfirm = () => {
    if (!selectedUser) {
      toast.error('Sélectionnez un destinataire');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Montant invalide');
      return;
    }

    if (!wallet || amountNum > wallet.balance) {
      toast.error('Solde insuffisant');
      return;
    }

    setStep('confirm');
  };

  // Passer à l'étape du PIN
  const handleContinueToPin = () => {
    setStep('pin');
  };

  // Effectuer le transfert
  const handleTransfer = async () => {
    if (!user || !selectedUser) return;

    const amountNum = parseFloat(amount);

    setLoading(true);
    try {
      // Vérifier le PIN pour TOUS les montants
      await verifyPIN(user.id, pin);

      // Effectuer le transfert
      await processPayment(user.id, {
        toUserId: selectedUser.id,
        amount: amountNum,
        description: description || `Transfert vers ${selectedUser.displayName}`,
        pin
      });

      setStep('success');
      toast.success('Transfert effectué avec succès!');
    } catch (error: any) {
      console.error('Error transferring:', error);
      toast.error(error.message || 'Erreur lors du transfert');
    } finally {
      setLoading(false);
    }
  };

  // Nouveau transfert
  const handleNewTransfer = () => {
    setStep('search');
    setSelectedUser(null);
    setAmount('');
    setPin('');
    setDescription('');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton href="/wallet" className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ArrowRight className="w-8 h-8 text-green-600" />
            Transférer des fonds
          </h1>
          <p className="text-gray-600 mt-2">
            Envoyez de l'argent à un autre utilisateur
          </p>
        </div>

        {/* Solde disponible */}
        <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-2xl p-6 text-gray-900 mb-8 shadow-xl">
          <p className="text-sm mb-1 opacity-90">Solde disponible</p>
          <p className="text-3xl font-bold">
            {wallet?.balance.toLocaleString('fr-FR')} FCFA
          </p>
        </div>

        {/* Étapes */}
        <AnimatePresence mode="wait">
          {/* Étape 1: Recherche */}
          {step === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6 space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  1. Rechercher le destinataire
                </h2>

                {/* Barre de recherche */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Email ou numéro de téléphone"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {searching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Résultats de recherche */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectUser(result)}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {result.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {result.displayName}
                            </p>
                            <p className="text-sm text-gray-600">{result.email}</p>
                            {result.phoneNumber && (
                              <p className="text-sm text-gray-600">
                                {result.phoneNumber}
                              </p>
                            )}
                          </div>
                          <Check className="w-6 h-6 text-green-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Utilisateur sélectionné */}
                {selectedUser && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {selectedUser.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {selectedUser.displayName}
                        </p>
                        <p className="text-sm text-gray-600">{selectedUser.email}</p>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Montant */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant (FCFA)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        min="1"
                        max={wallet?.balance}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-2xl font-bold"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Maximum: {wallet?.balance.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>

                    {/* Description (optionnel) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (optionnel)
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Remboursement, Cadeau..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={handleContinueToConfirm}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Continuer
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Étape 2: Confirmation */}
          {step === 'confirm' && selectedUser && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6 space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  2. Confirmer le transfert
                </h2>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-1">
                        Vérifiez les informations
                      </p>
                      <p className="text-sm text-yellow-800">
                        Assurez-vous que toutes les informations sont correctes avant de continuer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Destinataire</span>
                    <span className="font-semibold text-gray-900">
                      {selectedUser.displayName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Email</span>
                    <span className="font-semibold text-gray-900">
                      {selectedUser.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="text-gray-600">Montant</span>
                    <span className="font-bold text-green-600 text-xl">
                      {parseFloat(amount).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {description && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Description</span>
                      <span className="font-semibold text-gray-900">
                        {description}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Nouveau solde</span>
                    <span className="font-semibold text-gray-900">
                      {((wallet?.balance || 0) - parseFloat(amount)).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('search')}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleContinueToPin}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Étape 3: PIN */}
          {step === 'pin' && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6 space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  3. Sécurité
                </h2>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">
                        Code PIN requis
                      </p>
                      <p className="text-sm text-blue-800">
                        Pour votre sécurité, veuillez entrer votre code PIN pour confirmer ce transfert.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code PIN
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('confirm')}
                    disabled={loading}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={loading || !pin}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Transfert...
                      </>
                    ) : (
                      'Transférer'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Étape 4: Succès */}
          {step === 'success' && selectedUser && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Transfert réussi!
              </h2>
              <p className="text-gray-600 mb-6">
                Votre transfert a été effectué avec succès
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Montant transféré</span>
                  <span className="font-bold text-green-600 text-xl">
                    {parseFloat(amount).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Destinataire</span>
                  <span className="font-semibold text-gray-900">
                    {selectedUser.displayName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nouveau solde</span>
                  <span className="font-semibold text-gray-900">
                    {((wallet?.balance || 0)).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleNewTransfer}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Nouveau transfert
                </button>
                <button
                  onClick={() => router.push('/wallet')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Retour au portefeuille
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
