'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import { useLicenseStore } from '@/store/licenseStore';
import { LicenseUpgradeModal } from './LicenseUpgradeModal';

interface ProductQuotaDisplayProps {
  fournisseurId: string;
}

export function ProductQuotaDisplay({ fournisseurId }: ProductQuotaDisplayProps) {
  const { productUsage, fetchProductUsage } = useLicenseStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  useEffect(() => {
    if (fournisseurId) {
      fetchProductUsage(fournisseurId);
    }
  }, [fournisseurId, fetchProductUsage]);
  
  if (!productUsage) return null;
  
  const isUnlimited = productUsage.quota === -1;
  const percentage = isUnlimited ? 0 : (productUsage.currentCount / productUsage.quota) * 100;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 90;
  
  const getProgressColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-blue-500';
  };
  
  const getBackgroundColor = () => {
    if (isCritical) return 'bg-red-50 border-red-200';
    if (isWarning) return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };
  
  return (
    <>
      <div className={`border rounded-lg p-4 ${getBackgroundColor()}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Quota de produits</h3>
            {isWarning && <AlertTriangle className="text-yellow-600" size={20} />}
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {productUsage.currentCount} / {isUnlimited ? '∞' : productUsage.quota}
          </span>
        </div>
        
        {!isUnlimited && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
        
        {isCritical && (
          <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Quota critique ! Vous avez utilisé {percentage.toFixed(0)}% de votre quota.
            </p>
          </div>
        )}
        
        {isWarning && !isCritical && (
          <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-3">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Attention ! Vous avez utilisé {percentage.toFixed(0)}% de votre quota.
            </p>
          </div>
        )}
        
        {isWarning && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={16} />
            Mettre à niveau ma licence
          </button>
        )}
      </div>
      
      <LicenseUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
}
