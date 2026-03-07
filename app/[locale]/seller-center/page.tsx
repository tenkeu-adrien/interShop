'use client';

import { useTranslations } from 'next-intl';
import { Store, BarChart, Users, Settings } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import Link from 'next/link';

export default function SellerCenterPage() {
  const t = useTranslations('sellerCenter');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600 mb-12">{t('subtitle')}</p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <Store className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('tool1_title')}</h3>
              <p className="text-gray-600 mb-4">{t('tool1_desc')}</p>
              <Link href="/dashboard/fournisseur/products" className="text-green-600 font-semibold hover:underline">
                {t('learn_more')} →
              </Link>
            </div>

            <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <BarChart className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('tool2_title')}</h3>
              <p className="text-gray-600 mb-4">{t('tool2_desc')}</p>
              <Link href="/dashboard/fournisseur" className="text-yellow-600 font-semibold hover:underline">
                {t('learn_more')} →
              </Link>
            </div>

            <div className="p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
              <Users className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('tool3_title')}</h3>
              <p className="text-gray-600 mb-4">{t('tool3_desc')}</p>
              <Link href="/chat" className="text-orange-600 font-semibold hover:underline">
                {t('learn_more')} →
              </Link>
            </div>

            <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
              <Settings className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('tool4_title')}</h3>
              <p className="text-gray-600 mb-4">{t('tool4_desc')}</p>
              <Link href="/pricing" className="text-purple-600 font-semibold hover:underline">
                {t('learn_more')} →
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-yellow-500 rounded-xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">{t('cta_title')}</h2>
            <p className="text-lg mb-6">{t('cta_subtitle')}</p>
            <Link 
              href="/register"
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('cta_button')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
