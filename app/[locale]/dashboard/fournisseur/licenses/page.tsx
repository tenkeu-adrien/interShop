'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Calendar, TrendingUp, Check, Clock, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLicenseStore } from '@/store/licenseStore';
import { ProductQuotaDisplay } from '@/components/ProductQuotaDisplay';
import { LicenseUpgradeModal } from '@/components/LicenseUpgradeModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const toDate = (timestamp: any): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp && typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (timestamp) return new Date(timestamp);
  return new Date();
};

function LicensesContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { licenses, currentSubscription, fetchLicenses, fetchSubscription } = useLicenseStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingLicenses(true);
    fetchLicenses().finally(() => setLoadingLicenses(false));
    setLoadingSubscription(true);
    fetchSubscription(user.id).finally(() => setLoadingSubscription(false));
  }, [user?.id]);

  useEffect(() => {
    if (currentSubscription) {
      setAutoRenew(currentSubscription.autoRenew ?? false);
    }
  }, [currentSubscription]);

  const isLoading = loadingLicenses || loadingSubscription;
  const currentLicense = licenses.find(l => l.tier === currentSubscription?.licenseTier);
  const daysUntilExpiration = currentSubscription
    ? Math.ceil((toDate(currentSubscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const isExpiringSoon = daysUntilExpiration > 0 && daysUntilExpiration <= 30;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="text-green-600" size={32} />
            Gestion des licences
          </h1>
          <p className="text-gray-600">Gérez votre abonnement et consultez votre quota de produits</p>
        </div>

        {/* Current License Card or No Subscription Banner */}
        {currentLicense && currentSubscription ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white mb-6 shadow-lg"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={24} />
                  <h2 className="text-2xl font-bold">Licence {currentLicense.name}</h2>
                </div>
                <p className="text-green-100 mb-4">
                  {currentLicense.productQuota === -1
                    ? 'Produits illimités'
                    : `${currentLicense.productQuota} produits maximum`}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Expire le {toDate(currentSubscription.endDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {isExpiringSoon && (
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock size={14} />
                      <span>Expire dans {daysUntilExpiration} jours</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">${currentLicense.priceUSD}</div>
                <div className="text-green-100 text-sm">par an</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 flex items-start gap-4"
          >
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="font-bold text-yellow-900 text-lg">Aucun abonnement actif</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Vous utilisez le plan gratuit (5 produits max). Choisissez une licence pour débloquer plus de fonctionnalités.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                Choisir une licence
              </button>
            </div>
          </motion.div>
        )}

        {/* Product Quota */}
        {user && (
          <div className="mb-6">
            <ProductQuotaDisplay fournisseurId={user.id} />
          </div>
        )}

        {/* Auto-Renew Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900">Renouvellement automatique</h3>
                <p className="text-sm text-gray-600">Votre licence sera automatiquement renouvelée à l'expiration</p>
              </div>
            </div>
            <button
              onClick={() => {
                setAutoRenew(prev => !prev);
                toast.success(!autoRenew ? 'Auto-renouvellement activé' : 'Auto-renouvellement désactivé');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRenew ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRenew ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </motion.div>

        {/* License Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Comparer les licences</h2>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            >
              <TrendingUp size={16} />
              Mettre à niveau
            </button>
          </div>

          {licenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="mx-auto mb-3 text-gray-300" size={48} />
              <p>Aucune licence disponible pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Fonctionnalité</th>
                    {licenses.map(license => (
                      <th key={license.id} className="text-center py-3 px-4">
                        <div className="font-bold text-gray-900">{license.name}</div>
                        <div className="text-sm text-gray-500">${license.priceUSD}/an</div>
                        {currentSubscription?.licenseTier === license.tier && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Actuel</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">Nombre de produits</td>
                    {licenses.map(license => (
                      <td key={license.id} className="text-center py-3 px-4">
                        <span className="font-semibold text-green-600">
                          {license.productQuota === -1 ? 'Illimité' : license.productQuota}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {['Support prioritaire', 'Analytics avancés', 'API access', 'Multi-utilisateurs'].map((feature, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">{feature}</td>
                      {licenses.map(license => {
                        const hasFeature = license.features?.some(f =>
                          f.toLowerCase().includes(feature.toLowerCase())
                        );
                        return (
                          <td key={license.id} className="text-center py-3 px-4">
                            {hasFeature
                              ? <Check className="text-green-500 mx-auto" size={20} />
                              : <span className="text-gray-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Subscription History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Historique des abonnements</h2>
          {currentSubscription ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Shield className="text-green-600" size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Licence {currentLicense?.name ?? currentSubscription.licenseTier}
                  </div>
                  <div className="text-sm text-gray-600">
                    Du {toDate(currentSubscription.startDate).toLocaleDateString('fr-FR')} au{' '}
                    {toDate(currentSubscription.endDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">${currentLicense?.priceUSD ?? '—'}</div>
                <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                  currentSubscription.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {currentSubscription.status === 'active' ? 'Actif' : 'Expiré'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="mx-auto mb-3 text-gray-300" size={48} />
              <p>Aucun historique d'abonnement</p>
            </div>
          )}
        </motion.div>

        <LicenseUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </div>
    </div>
  );
}

export default function LicensesPage() {
  return (
    <ProtectedRoute allowedRoles={['fournisseur', 'admin']}>
      <LicensesContent />
    </ProtectedRoute>
  );
}
