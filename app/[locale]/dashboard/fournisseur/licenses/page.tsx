'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Calendar, TrendingUp, Check, Clock,
  RefreshCw, ArrowLeft, AlertCircle, Zap, Star, Infinity
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLicenseStore } from '@/store/licenseStore';
import { ProductQuotaDisplay } from '@/components/ProductQuotaDisplay';
import { LicenseUpgradeModal } from '@/components/LicenseUpgradeModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LicenseConfig } from '@/types';

const toDate = (ts: any): Date => {
  if (ts instanceof Date) return ts;
  if (ts?.toDate) return ts.toDate();
  if (ts) return new Date(ts);
  return new Date();
};

// Tier color mapping
const tierStyle: Record<string, { bg: string; border: string; badge: string; icon: string }> = {
  free:       { bg: 'bg-gray-50',    border: 'border-gray-200',   badge: 'bg-gray-100 text-gray-700',    icon: 'text-gray-500' },
  starter:    { bg: 'bg-yellow-50',  border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-800', icon: 'text-yellow-500' },
  pro:        { bg: 'bg-green-50',   border: 'border-green-400',  badge: 'bg-green-100 text-green-800',   icon: 'text-green-600' },
  enterprise: { bg: 'bg-gradient-to-br from-yellow-50 to-green-50', border: 'border-green-500', badge: 'bg-gradient-to-r from-yellow-400 to-green-500 text-white', icon: 'text-green-700' },
};

function getTierStyle(tier: string) {
  return tierStyle[tier] ?? tierStyle.free;
}

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
    if (currentSubscription) setAutoRenew(currentSubscription.autoRenew ?? false);
  }, [currentSubscription]);

  const isLoading = loadingLicenses || loadingSubscription;
  const currentLicense = licenses.find(l => l.tier === currentSubscription?.licenseTier);
  const daysLeft = currentSubscription
    ? Math.ceil((toDate(currentSubscription.endDate).getTime() - Date.now()) / 86400000)
    : 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;
  const isExpired = daysLeft <= 0 && !!currentSubscription;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-green-400 border-t-yellow-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chargement des licences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 py-8 px-4 shadow-md">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-800 hover:text-gray-900 mb-4 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-30 p-3 rounded-xl">
              <Shield className="text-gray-900" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des licences</h1>
              <p className="text-gray-800 text-sm mt-1">Gérez votre abonnement et votre quota de produits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Active subscription card ── */}
        {currentLicense && currentSubscription && !isExpired ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 p-1"
          >
            <div className="bg-white rounded-xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-green-500 p-3 rounded-xl shadow">
                    <Shield className="text-white" size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl font-bold text-gray-900">Licence {currentLicense.name}</h2>
                      <span className="bg-gradient-to-r from-yellow-400 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ACTIF
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {currentLicense.productQuota === -1
                        ? 'Produits illimités'
                        : `${currentLicense.productQuota} produits maximum`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">${currentLicense.priceUSD}</p>
                  <p className="text-gray-400 text-sm">par an</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-700">
                  <Calendar size={15} className="text-green-500" />
                  Expire le {toDate(currentSubscription.endDate).toLocaleDateString('fr-FR')}
                </div>
                {isExpiringSoon && (
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-2 text-sm text-yellow-800 font-medium">
                    <Clock size={15} />
                    Expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                  </div>
                )}
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-green-500 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity ml-auto"
                >
                  <TrendingUp size={15} />
                  Mettre à niveau
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── No active subscription ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-dashed border-yellow-400 bg-yellow-50 p-6"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="bg-yellow-100 p-4 rounded-xl flex-shrink-0">
                <AlertCircle className="text-yellow-600" size={36} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {isExpired ? 'Licence expirée' : 'Aucune licence active'}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {isExpired
                    ? 'Votre licence a expiré. Renouvelez-la pour continuer à publier des produits.'
                    : 'Vous utilisez le plan gratuit (5 produits max). Choisissez une licence pour débloquer plus de fonctionnalités.'}
                </p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md flex-shrink-0"
              >
                <Zap size={18} />
                {isExpired ? 'Renouveler' : 'Choisir une licence'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Product Quota ── */}
        {user && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <ProductQuotaDisplay fournisseurId={user.id} />
          </motion.div>
        )}

        {/* ── Auto-Renew ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <RefreshCw className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Renouvellement automatique</p>
                <p className="text-sm text-gray-500">Votre licence sera renouvelée automatiquement à l'expiration</p>
              </div>
            </div>
            <button
              onClick={() => {
                setAutoRenew(p => !p);
                toast.success(!autoRenew ? 'Auto-renouvellement activé' : 'Auto-renouvellement désactivé');
              }}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors ${autoRenew ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${autoRenew ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </motion.div>

        {/* ── License Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="text-yellow-500 fill-yellow-400" size={22} />
              Nos licences
            </h2>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <TrendingUp size={16} />
              Comparer
            </button>
          </div>

          {licenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-gray-300" size={40} />
              </div>
              <p className="text-gray-500 font-medium text-lg">Aucune licence disponible</p>
              <p className="text-gray-400 text-sm mt-1">Les licences seront disponibles prochainement</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {licenses.map((license: LicenseConfig, i: number) => {
                const isCurrent = currentSubscription?.licenseTier === license.tier && !isExpired;
                const style = getTierStyle(license.tier);
                return (
                  <motion.div
                    key={license.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className={`relative rounded-xl border-2 p-5 flex flex-col ${style.bg} ${isCurrent ? 'border-green-500 shadow-lg' : style.border}`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-yellow-400 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                          Plan actuel
                        </span>
                      </div>
                    )}

                    <div className="mb-3">
                      <p className="font-bold text-gray-900 text-lg">{license.name}</p>
                      <p className="text-2xl font-extrabold text-gray-900 mt-1">
                        ${license.priceUSD}
                        <span className="text-sm font-normal text-gray-500">/an</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-4 bg-white bg-opacity-60 rounded-lg px-3 py-2">
                      {license.productQuota === -1
                        ? <Infinity className="text-green-600 flex-shrink-0" size={18} />
                        : <Shield className={`flex-shrink-0 ${style.icon}`} size={18} />}
                      <span className="text-sm font-semibold text-gray-700">
                        {license.productQuota === -1 ? 'Illimité' : `${license.productQuota} produits`}
                      </span>
                    </div>

                    <ul className="space-y-2 flex-1 mb-4">
                      {(license.features ?? []).slice(0, 4).map((f: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className="text-green-500 flex-shrink-0 mt-0.5" size={14} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {!isCurrent && (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 text-gray-900 font-bold py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                      >
                        Choisir
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Subscription History ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-green-500" size={22} />
            Historique des abonnements
          </h2>

          {currentSubscription ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-400 to-green-500 p-2 rounded-lg">
                  <Shield className="text-white" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Licence {currentLicense?.name ?? currentSubscription.licenseTier}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Du {toDate(currentSubscription.startDate).toLocaleDateString('fr-FR')} au{' '}
                    {toDate(currentSubscription.endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${currentLicense?.priceUSD ?? '—'}</p>
                <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 font-medium ${
                  currentSubscription.status === 'active' && !isExpired
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {currentSubscription.status === 'active' && !isExpired ? 'Actif' : 'Expiré'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Shield className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-500">Aucun historique d'abonnement</p>
            </div>
          )}
        </motion.div>

      </div>

      <LicenseUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
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
