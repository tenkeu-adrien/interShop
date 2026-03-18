'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    switch (user.role) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'fournisseur':
        router.push('/dashboard/fournisseur');
        break;
      case 'marketiste':
        router.push('/dashboard/marketiste');
        break;
      case 'client':
      default:
        router.push('/dashboard/client');
        break;
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">{tCommon('loading')}</div>
    </div>
  );
}
