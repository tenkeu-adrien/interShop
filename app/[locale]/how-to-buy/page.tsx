'use client';

import { useTranslations } from 'next-intl';
import { Search, ShoppingCart, CreditCard, Package, CheckCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function HowToBuyPage() {
  const t = useTranslations('howToBuy');

  const steps = [
    {
      icon: Search,
      title: t('step1_title'),
      description: t('step1_desc'),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: ShoppingCart,
      title: t('step2_title'),
      description: t('step2_desc'),
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: CreditCard,
      title: t('step3_title'),
      description: t('step3_desc'),
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Package,
      title: t('step4_title'),
      description: t('step4_desc'),
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: CheckCircle,
      title: t('step5_title'),
      description: t('step5_desc'),
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-gray-900">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl md:text-2xl">{t('subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className={`w-16 h-16 ${step.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-gray-300">0{index + 1}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-green-50 rounded-xl border-2 border-green-200">
            <h3 className="text-xl font-bold text-green-900 mb-3">{t('tips_title')}</h3>
            <ul className="space-y-2 text-green-800">
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
