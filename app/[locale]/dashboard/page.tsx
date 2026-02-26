'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Package, ShoppingBag, MessageSquare, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {tDashboard('welcome')}, {user.displayName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">{tDashboard('orders')}</h3>
            <ShoppingBag className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">{tDashboard('products')}</h3>
            <Package className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">{tDashboard('messages')}</h3>
            <MessageSquare className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">{tDashboard('revenue')}</h3>
            <DollarSign className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">$0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">{tDashboard('recent_activity')}</h2>
        <p className="text-gray-500">{tDashboard('no_activity')}</p>
      </div>
    </div>
  );
}
