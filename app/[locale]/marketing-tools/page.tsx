'use client';

import { useTranslations } from 'next-intl';
import { Link as LinkIcon, BarChart, Share2, Code } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function MarketingToolsPage() {
  const t = useTranslations('marketingTools');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600 mb-12">{t('subtitle')}</p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <LinkIcon className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('tool1_title')}</h3>
              <p className="text-gray-600 mb-4">{t('tool1_desc')}</p>
              <div className="bg-white p-3 rounded border border-green-300 font-mono text-sm">
                https://intershop.com/ref/YOUR_CODE
              </div>
            </div>

            <div className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <BarChart className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('tool2_title')}</h3>
              <p className="text-gray-600">{t('tool2_desc')}</p>
            </div>

            <div className="p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
              <Share2 className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('tool3_title')}</h3>
              <p className="text-gray-600">{t('tool3_desc')}</p>
            </div>

            <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
              <Code className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">{t('tool4_title')}</h3>
              <p className="text-gray-600">{t('tool4_desc')}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">{t('tips_title')}</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• {t('tip1')}</li>
              <li>• {t('tip2')}</li>
              <li>• {t('tip3')}</li>
              <li>• {t('tip4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
