'use client';

import { useTranslations } from 'next-intl';
import { Truck, Package, MapPin, Clock } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function ShippingPage() {
  const t = useTranslations('shipping');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-center text-gray-900">
          <Truck className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl md:text-2xl">{t('subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">{t('method1_title')}</h3>
              <p className="text-gray-600 mb-3">{t('method1_desc')}</p>
              <p className="text-2xl font-bold text-green-600">{t('method1_time')}</p>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-xl">
              <Truck className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">{t('method2_title')}</h3>
              <p className="text-gray-600 mb-3">{t('method2_desc')}</p>
              <p className="text-2xl font-bold text-yellow-600">{t('method2_time')}</p>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">{t('method3_title')}</h3>
              <p className="text-gray-600 mb-3">{t('method3_desc')}</p>
              <p className="text-2xl font-bold text-orange-600">{t('method3_time')}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mb-8">
            <div className="flex items-start gap-4">
              <Clock className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{t('tracking_title')}</h3>
                <p className="text-blue-800">{t('tracking_desc')}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('faq_title')}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">{t('faq1_q')}</h4>
                <p className="text-gray-600">{t('faq1_a')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{t('faq2_q')}</h4>
                <p className="text-gray-600">{t('faq2_a')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{t('faq3_q')}</h4>
                <p className="text-gray-600">{t('faq3_a')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
