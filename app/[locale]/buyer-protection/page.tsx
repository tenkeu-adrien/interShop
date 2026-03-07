'use client';

import { useTranslations } from 'next-intl';
import { Shield, Lock, RefreshCw, CheckCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function BuyerProtectionPage() {
  const t = useTranslations('buyerProtection');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-12">
            <Shield className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
            <p className="text-xl text-gray-600">{t('subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 border-2 border-green-200 rounded-xl">
              <Lock className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('feature1_title')}</h3>
              <p className="text-gray-600">{t('feature1_desc')}</p>
            </div>

            <div className="p-6 border-2 border-yellow-200 rounded-xl">
              <RefreshCw className="w-10 h-10 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('feature2_title')}</h3>
              <p className="text-gray-600">{t('feature2_desc')}</p>
            </div>

            <div className="p-6 border-2 border-orange-200 rounded-xl">
              <CheckCircle className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('feature3_title')}</h3>
              <p className="text-gray-600">{t('feature3_desc')}</p>
            </div>

            <div className="p-6 border-2 border-purple-200 rounded-xl">
              <Shield className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('feature4_title')}</h3>
              <p className="text-gray-600">{t('feature4_desc')}</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <h3 className="text-2xl font-bold text-green-900 mb-4">{t('how_it_works')}</h3>
            <ol className="space-y-3 text-green-800">
              <li className="flex gap-3">
                <span className="font-bold">1.</span>
                <span>{t('step1')}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">2.</span>
                <span>{t('step2')}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">3.</span>
                <span>{t('step3')}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">4.</span>
                <span>{t('step4')}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
