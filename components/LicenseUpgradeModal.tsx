'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Zap } from 'lucide-react';
import { useLicenseStore } from '@/store/licenseStore';
import { LicenseTier } from '@/types';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

interface LicenseUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LicenseUpgradeModal({ isOpen, onClose }: LicenseUpgradeModalProps) {
  const { licenses, currentSubscription, upgradeLicense } = useLicenseStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const handleUpgrade = async (tier: LicenseTier) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }
    
    setLoading(true);
    try {
      await upgradeLicense(tier, user.id);
      toast.success('Licence mise à niveau avec succès !');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la mise à niveau');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Choisissez votre licence</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {licenses.map((license) => {
              const isCurrent = currentSubscription?.licenseTier === license.tier;
              
              return (
                <div
                  key={license.id}
                  className={`border-2 rounded-lg p-6 ${
                    isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  {isCurrent && (
                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full inline-block mb-3">
                      Plan actuel
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2">{license.name}</h3>
                  <div className="text-3xl font-bold text-green-600 mb-4">
                    ${license.priceUSD}
                    <span className="text-sm text-gray-600">/an</span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 font-semibold mb-2">
                      {license.productQuota === -1 ? 'Illimité' : license.productQuota} produits
                    </p>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {license.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {!isCurrent && (
                    <button
                      onClick={() => handleUpgrade(license.tier)}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
                    >
                      <Zap size={16} />
                      Mettre à niveau
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
