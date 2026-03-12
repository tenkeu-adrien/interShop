'use client';

import { useTranslations } from 'next-intl';
import { DollarSign, Percent, CreditCard } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import Link from 'next/link';

export default function SellerFeesPage() {
  const t = useTranslations('sellerFees');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-gray-900">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl md:text-2xl">{t('subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-green-50 rounded-xl text-center">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('fee1_title')}</h3>
              <p className="text-4xl font-bold text-green-600 mb-3">{t('fee1_amount')}</p>
              <p className="text-gray-600">{t('fee1_desc')}</p>
            </div>

            <div className="p-6 bg-yellow-50 rounded-xl text-center">
              <Percent className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('fee2_title')}</h3>
              <p className="text-4xl font-bold text-yellow-600 mb-3">{t('fee2_amount')}</p>
              <p className="text-gray-600">{t('fee2_desc')}</p>
            </div>

            <div className="p-6 bg-orange-50 rounded-xl text-center">
              <CreditCard className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('fee3_title')}</h3>
              <p className="text-4xl font-bold text-orange-600 mb-3">{t('fee3_amount')}</p>
              <p className="text-gray-600">{t('fee3_desc')}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">{t('example_title')}</h3>
            <div className="space-y-2 text-blue-800">
              <p>{t('example_sale')}: 100,000 FCFA</p>
              <p>{t('example_commission')}: 5,000 FCFA (5%)</p>
              <p className="font-bold text-lg">{t('example_receive')}: 95,000 FCFA</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-xl p-8 text-gray-900 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('cta_title')}</h2>
            <Link 
              href="/pricing"
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              {t('cta_button')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
