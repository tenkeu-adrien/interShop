'use client';

import { useTranslations } from 'next-intl';
import { Building2, Users, Globe, Award, Target, Heart } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600 mb-8">{t('subtitle')}</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              {t('intro')}
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-12">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <Building2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">{t('mission_title')}</h3>
                <p className="text-gray-600">{t('mission_text')}</p>
              </div>

              <div className="text-center p-6 bg-yellow-50 rounded-xl">
                <Target className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">{t('vision_title')}</h3>
                <p className="text-gray-600">{t('vision_text')}</p>
              </div>

              <div className="text-center p-6 bg-orange-50 rounded-xl">
                <Heart className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">{t('values_title')}</h3>
                <p className="text-gray-600">{t('values_text')}</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-12">{t('why_choose_title')}</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('community_title')}</h3>
                  <p className="text-gray-600">{t('community_text')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Globe className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('global_title')}</h3>
                  <p className="text-gray-600">{t('global_text')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('quality_title')}</h3>
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
