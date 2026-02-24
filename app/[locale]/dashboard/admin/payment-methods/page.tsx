'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePaymentMethodsStore } from '@/store/paymentMethodsStore';
import type { CreatePaymentMethodData, PaymentMethodType } from '@/types';

export default function AdminPaymentMethodsPage() {
  const { user } = useAuthStore();
  const { 
    paymentMethods, 
    loading, 
    error,
    fetchPaymentMethods,
    createMethod,
    toggleMethodStatus
  } = usePaymentMethodsStore();
  
  const [showForm, setShowForm] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState<CreatePaymentMethodData>({
    name: '',
    type: 'mobile_money',
    instructions: '',
    accountDetails: {
      accountNumber: '',
      accountName: '',
      bankName: '',
      walletAddress: '',
      network: '',
      additionalInfo: ''
    },
    icon: '',
    displayOrder: 0
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }
    
    try {
      await createMethod(formData, user.id);
      setShowForm(false);
      resetForm();
      alert('Méthode créée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création');
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }
    
    try {
      await toggleMethodStatus(id, user.id);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'mobile_money',
      instructions: '',
      accountDetails: {
        accountNumber: '',
        accountName: '',
        bankName: '',
        walletAddress: '',
        network: '',
        additionalInfo: ''
      },
      icon: '',
      displayOrder: 0
    });
  };

  const [editingMethod, setEditingMethod] = useState(null);

  const getTypeLabel = (type: PaymentMethodType) => {
    const labels = {
      mobile_money: 'Mobile Money',
      mpesa: 'M-Pesa',
      crypto: 'Cryptomonnaie',
      bank_transfer: 'Virement Bancaire',
      other: 'Autre'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: PaymentMethodType) => {
    const icons = {
      mobile_money: '📱',
      mpesa: '💳',
      crypto: '₿',
      bank_transfer: '🏦',
      other: '💰'
    };
    return icons[type] || '💰';
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    return getTypeIcon(type);
  };

  const getInstructionsPlaceholder = (type: PaymentMethodType) => {
    const placeholders = {
      mobile_money: 'Ex: Envoyez le montant au numéro ci-dessous via votre application Mobile Money...',
      mpesa: 'Ex: Allez dans M-Pesa, sélectionnez "Envoyer de l\'argent", entrez le numéro...',
      crypto: 'Ex: Envoyez le montant en USDT sur le réseau BEP20 à l\'adresse ci-dessous...',
      bank_transfer: 'Ex: Effectuez un virement bancaire vers le compte ci-dessous...',
      other: 'Ex: Contactez-nous pour obtenir les instructions de paiement...'
    };
    return placeholders[type] || 'Expliquez comment effectuer le paiement...';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Méthodes de Paiement</h1>
          <p className="text-gray-600 mt-1">
            Gérez les canaux de dépôt et retrait disponibles pour les clients
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {showForm ? 'Annuler' : '+ Ajouter une méthode'}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            Nouvelle méthode de paiement
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom et Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la méthode *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: MTN Mobile Money"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de méthode *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as PaymentMethodType})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="mobile_money">📱 Mobile Money</option>
                  <option value="mpesa">💳 M-Pesa</option>
                  <option value="crypto">₿ Cryptomonnaie</option>
                  <option value="bank_transfer">🏦 Virement Bancaire</option>
                  <option value="other">💰 Autre</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions de paiement *
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                placeholder={getInstructionsPlaceholder(formData.type)}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ces instructions seront affichées aux clients lors du paiement
              </p>
            </div>

            {/* Champs dynamiques selon le type */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-2xl">{getMethodIcon(formData.type)}</span>
                Informations de réception {getTypeLabel(formData.type)}
              </h3>
              
              {/* Mobile Money / M-Pesa */}
              {(formData.type === 'mobile_money' || formData.type === 'mpesa') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de téléphone *
                      </label>
                      <input
                        type="tel"
                        value={formData.accountDetails.accountNumber}
                        onChange={(e) => setFormData({
                          ...formData,
                          accountDetails: {...formData.accountDetails, accountNumber: e.target.value}
                        })}
                        placeholder="+237 6XX XX XX XX"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Numéro où les clients enverront l'argent
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du compte
                      </label>
                      <input
                        type="text"
                        value={formData.accountDetails.accountName}
                        onChange={(e) => setFormData({
                          ...formData,
                          accountDetails: {...formData.accountDetails, accountName: e.target.value}
                        })}
                        placeholder="Ex: InterShop"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Crypto */}
              {formData.type === 'crypto' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse du wallet *
                    </label>
                    <input
                      type="text"
                      value={formData.accountDetails.walletAddress}
                      onChange={(e) => setFormData({
                        ...formData,
                        accountDetails: {...formData.accountDetails, walletAddress: e.target.value}
                      })}
                      placeholder="0x..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Adresse où les clients enverront les cryptomonnaies
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Réseau / Blockchain *
                    </label>
                    <select
                      value={formData.accountDetails.network}
                      onChange={(e) => setFormData({
                        ...formData,
                        accountDetails: {...formData.accountDetails, network: e.target.value}
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Sélectionnez un réseau</option>
                      <option value="BEP20">BEP20 (Binance Smart Chain)</option>
                      <option value="TRC20">TRC20 (Tron)</option>
                      <option value="ERC20">ERC20 (Ethereum)</option>
                      <option value="Bitcoin">Bitcoin</option>
                      <option value="Polygon">Polygon</option>
                      <option value="Solana">Solana</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Important: Les clients doivent utiliser le bon réseau
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Vérifiez bien l'adresse et le réseau. Une erreur peut entraîner une perte de fonds.
                    </p>
                  </div>
                </div>
              )}

              {/* Virement Bancaire */}
              {formData.type === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la banque *
                      </label>
                      <input
                        type="text"
                        value={formData.accountDetails.bankName}
                        onChange={(e) => setFormData({
                          ...formData,
                          accountDetails: {...formData.accountDetails, bankName: e.target.value}
                        })}
                        placeholder="Ex: Ecobank"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de compte *
                      </label>
                      <input
                        type="text"
                        value={formData.accountDetails.accountNumber}
                        onChange={(e) => setFormData({
                          ...formData,
                          accountDetails: {...formData.accountDetails, accountNumber: e.target.value}
                        })}
                        placeholder="Ex: 1234567890"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du titulaire du compte *
                    </label>
                    <input
                      type="text"
                      value={formData.accountDetails.accountName}
                      onChange={(e) => setFormData({
                        ...formData,
                        accountDetails: {...formData.accountDetails, accountName: e.target.value}
                      })}
                      placeholder="Ex: InterShop SARL"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Autre */}
              {formData.type === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Informations de paiement *
                  </label>
                  <textarea
                    value={formData.accountDetails.additionalInfo}
                    onChange={(e) => setFormData({
                      ...formData,
                      accountDetails: {...formData.accountDetails, additionalInfo: e.target.value}
                    })}
                    placeholder="Entrez toutes les informations nécessaires pour recevoir le paiement..."
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer la méthode'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des méthodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`bg-white rounded-lg shadow-lg p-6 border-2 ${
              method.isActive ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getTypeIcon(method.type)}</span>
                <div>
                  <h3 className="font-bold text-lg">{method.name}</h3>
                  <span className="text-sm text-gray-500">{getTypeLabel(method.type)}</span>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(method.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  method.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {method.isActive ? 'Actif' : 'Inactif'}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              {method.accountDetails.accountNumber && (
                <div>
                  <span className="font-medium">Numéro:</span>
                  <p className="font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                    {method.accountDetails.accountNumber}
                  </p>
                </div>
              )}
              {method.accountDetails.walletAddress && (
                <div>
                  <span className="font-medium">Adresse:</span>
                  <p className="font-mono text-xs bg-gray-50 px-2 py-1 rounded mt-1 break-all">
                    {method.accountDetails.walletAddress}
                  </p>
                </div>
              )}
              {method.accountDetails.network && (
                <div>
                  <span className="font-medium">Réseau:</span> {method.accountDetails.network}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 line-clamp-3">
                {method.instructions}
              </p>
            </div>
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Aucune méthode de paiement configurée</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Ajouter la première méthode
          </button>
        </div>
      )}
    </div>
  );
}
