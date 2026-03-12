'use client';

import { useTranslations } from 'next-intl';
import { Building2, Users, Globe, Award, Target, Heart } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-gray-900">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl md:text-2xl">{t('subtitle')}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-8 text-lg">
              {t('intro')}
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-12">
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-green-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow">
                <Building2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2 text-gray-900">{t('mission_title')}</h3>
                <p className="text-gray-600">{t('mission_text')}</p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-shadow">
                <Target className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2 text-gray-900">{t('vision_title')}</h3>
                <p className="text-gray-600">{t('vision_text')}</p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-green-50 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow">
                <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2 text-gray-900">{t('values_title')}</h3>
                <p className="text-gray-600">{t('values_text')}</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">{t('why_choose_title')}</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                <Users className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{t('community_title')}</h3>
                  <p className="text-gray-600">{t('community_text')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                <Globe className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{t('global_title')}</h3>
                  <p className="text-gray-600">{t('global_text')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                <Award className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{t('quality_title')}</h3>
                  <p className="text-gray-600">{t('quality_text')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
