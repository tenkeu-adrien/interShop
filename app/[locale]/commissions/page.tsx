'use client';

import { useTranslations } from 'next-intl';
import { Percent, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function CommissionsPage() {
  const t = useTranslations('commissions');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        <div className="bg-white rounded-2xl shadow-