'use client';

import { useTranslations } from 'next-intl';
import { Briefcase, Users, TrendingUp, Heart } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import Link from 'next/link';

export default function CareersPage() {
  const t = useTranslations('careers');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600 mb-12">{t('subtitle')}</p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-green-50 rounded-xl">
              <Briefcase className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('benefit1_title')}</h3>
              <p className="text-gray-600">{t('benefit1_desc')}</p>
            </div>

            <div className="p-6 bg-yellow-50 rounded-xl">
              <Users className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('benefit2_title')}</h3>
              <p className="text-gray-600">{t('benefit2_desc')}</p>
            </div>

            <div className="p-6 bg-orange-50 rounded-xl">
              <TrendingUp className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('benefit3_title')}</h3>
              <p className="text-gray-600">{t('benefit3_desc')}</p>
            </div>

            <div className="p-6 bg-purple-50 rounded-xl">
              <Heart className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('benefit4_title')}</h3>
              <p className="text-gray-600">{t('benefit4_desc')}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-yellow-500 rounded-xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">{t('cta_title')}</h2>
            <p className="text-lg mb-6">{t('cta_subtitle')}</p>
            <Link 
              href="/contact"
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
