'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import Link from 'next/link';

export default function AffiliatePage() {
  const t = useTranslations('affiliate');

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

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-green-50 rounded-xl">
              <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('benefit1_title')}</h3>
              <p className="text-gray-600">{t('benefit1_desc')}</p>
            </div>

            <div className="p-6 bg-yellow-50 rounded-xl">
              <DollarSign className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('benefit2_title')}</h3>
              <p className="text-gray-600">{t('benefit2_desc')}</p>
            </div>

            <div className="p-6 bg-orange-50 rounded-xl">
              <Users className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('benefit3_title')}</h3>
              <p className="text-gray-600">{t('benefit3_desc')}</p>
            </div>

            <div className="p-6 bg-purple-50 rounded-xl">
              <Award className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('benefit4_title')}</h3>
              <p className="text-gray-600">{t('benefit4_desc')}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">{t('how_it_works')}</h3>
            <ol className="space-y-3 text-blue-800">
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

          <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-xl p-8 text-gray-900 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('cta_title')}</h2>
            <p className="text-lg mb-6 font-medium">{t('cta_subtitle')}</p>
            <Link 
              href="/register"
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
