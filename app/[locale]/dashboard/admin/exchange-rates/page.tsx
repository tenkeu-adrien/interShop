'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
  DollarSign,
  Edit,
  Check,
  X,
  RefreshCw,
  TrendingUp,
  Eye,
  EyeOff,
  Loader,
  Save,
  AlertCircle
} from 'lucide-react';
import {
  getAllAdminExchangeRates,
  updateAdminExchangeRate,
  toggleAdminExchangeRateStatus,
  applyGlobalMargin,
  AdminExchangeRate
} from '@/lib/firebase/adminExchangeRates';
import { CountryFlag } from '@/components/ui/CountryFlag';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AdminExchangeRatesContent() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [rates, setRates] = useState<AdminExchangeRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal marge globale
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [marginValue, setMarginValue] = useState('');
  const [applyingMargin, setApplyingMargin] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }
    if (user && user.role === 'admin') {
      loadRates();
    }
  }, [user, loading, router]);

  const loadRates = async () => {
    setLoadingRates(true);
    try {
      const data = await getAllAdminExchangeRates();
      setRates(data);
    } catch (error) {
      console.error('Erreur chargement taux:', error);
      toast.error('Erreur lors du chargement des taux');
    } finally {
      setLoadingRates(false);
    }
  };

  const startEdit = (rate: AdminExchangeRate) => {
    setEditingId(rate.currency);
    setEditValue(rate.rateToUSD.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (currency: string) => {
    const newRate = parseFloat(editValue);

    if (isNaN(newRate) || newRate <= 0) {
      toast.error('Veuillez entrer un taux valide');
      return;
    }

    setSaving(true);
    try {
      await updateAdminExchangeRate(
        currency as any,
        newRate,
        user!.id,
        user!.displayName
      );
      toast.success('Taux mis à jour');
      setEditingId(null);
      loadRates();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (currency: string) => {
    if (currency === 'USD') {
      toast.error('USD est la devise de base et ne peut être désactivé');
      return;
    }

    try {
      await toggleAdminExchangeRateStatus(
        currency as any,
        user!.id,
        user!.displayName
      );
      toast.success('Statut modifié');
      loadRates();
    } catch (error) {
      console.error('Erreur toggle:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleApplyMargin = async () => {
    const margin = parseFloat(marginValue);

    if (isNaN(margin)) {
      toast.error('Veuillez entrer un pourcentage valide');
      return;
    }

    if (Math.abs(margin) > 50) {
      toast.error('La marge ne peut pas dépasser ±50%');
      return;
    }

    setApplyingMargin(true);
    try {
      const updated = await applyGlobalMargin(margin, user!.id, user!.displayName);
      toast.success(`${updated} taux mis à jour avec une marge de ${margin > 0 ? '+' : ''}${margin}%`);
      setShowMarginModal(false);
      setMarginValue('');
      loadRates();
    } catch (error) {
      console.error('Erreur application marge:', error);
      toast.error('Erreur lors de l\'application de la marge');
    } finally {
      setApplyingMargin(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading || loadingRates) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  const activeRates = rates.filter(r => r.isActive);
  const inactiveRates = rates.filter(r => !r.isActive);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="text-purple-600" size={36} />
              Gestion des Taux de Change
            </h1>
            <p className="text-gray-600 mt-1">Définissez manuellement les taux de conversion pour chaque devise</p>
          </div>
          <button
            onClick={() => setShowMarginModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            <TrendingUp size={20} />
            Appliquer une Marge
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">💡 Comment ça marche ?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Définissez le taux : <strong>1 USD = X unités</strong> de la devise cible</li>
              <li>Les prix des produits seront convertis en temps réel selon ces taux</li>
              <li>Le sélecteur de devise dans le header utilisera ces taux</li>
              <li>Le système de wallet utilisera ces taux pour les transactions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Devises</p>
              <p className="text-2xl font-bold text-gray-900">{rates.length}</p>
            </div>
            <DollarSign className="text-purple-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Devises Actives</p>
              <p className="text-2xl font-bold text-green-600">{activeRates.length}</p>
            </div>
            <Eye className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Devises Inactives</p>
              <p className="text-2xl font-bold text-gray-400">{inactiveRates.length}</p>
            </div>
            <EyeOff className="text-gray-400" size={32} />
          </div>
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Devise
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Taux (1 USD =)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dernière Modification
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Modifié Par
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rates.map((rate) => (
                <motion.tr
                  key={rate.currency}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-gray-50 transition-colors ${
                    !rate.isActive ? 'opacity-50' : ''
                  }`}
                >
                  {/* Devise */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        <CountryFlag country={rate.flag} width={28} />
                      </span>
                      <div>
                        <div className="font-semibold text-gray-900">{rate.currency}</div>
                        <div className="text-sm text-gray-500">{rate.currencyName}</div>
                      </div>
                    </div>
                  </td>

                  {/* Taux */}
                  <td className="px-6 py-4">
                    {editingId === rate.currency ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          step="0.01"
                          min="0"
                          className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                        <span className="text-gray-600">{rate.symbol}</span>
                      </div>
                    ) : (
                      <div className="font-mono text-lg font-semibold text-gray-900">
                        {rate.rateToUSD.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}{' '}
                        <span className="text-sm text-gray-500">{rate.symbol}</span>
                      </div>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(rate.updatedAt)}
                  </td>

                  {/* Modifié par */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rate.updatedByName || 'System'}
                  </td>

                  {/* Statut */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        rate.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rate.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      {rate.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === rate.currency ? (
                        <>
                          <button
                            onClick={() => saveEdit(rate.currency)}
                            disabled={saving}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Sauvegarder"
                          >
                            {saving ? (
                              <Loader className="animate-spin" size={18} />
                            ) : (
                              <Check size={18} />
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Annuler"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(rate)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier le taux"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => toggleStatus(rate.currency)}
                            disabled={rate.currency === 'USD'}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={rate.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {rate.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Marge Globale */}
      {showMarginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-purple-600" size={28} />
              Appliquer une Marge Globale
            </h2>

            <p className="text-gray-600 mb-6">
              Appliquez un pourcentage de marge sur tous les taux actifs. 
              <br />
              Exemple : +5% augmente tous les taux de 5%.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marge en % (-50 à +50)
              </label>
              <input
                type="number"
                value={marginValue}
                onChange={(e) => setMarginValue(e.target.value)}
                step="0.5"
                min="-50"
                max="50"
                placeholder="Ex: 5 pour +5%"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 text-lg"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Utilisez un nombre négatif pour réduire les taux (ex: -3 pour -3%)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMarginModal(false);
                  setMarginValue('');
                }}
                disabled={applyingMargin}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleApplyMargin}
                disabled={applyingMargin || !marginValue}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {applyingMargin ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Application...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Appliquer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function AdminExchangeRatesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminExchangeRatesContent />
    </ProtectedRoute>
  );
}
