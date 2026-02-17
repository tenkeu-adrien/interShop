'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  requireVerification?: boolean; // Nouvelle option
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
  requireVerification = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Vérifier le rôle
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
      return;
    }

    // Vérifier le statut du compte si requis
    if (requireVerification) {
      switch (user.accountStatus) {
        case 'email_unverified':
          router.push('/verify-email');
          return;
        case 'phone_unverified':
          router.push('/verify-phone');
          return;
        case 'pending_admin_approval':
          router.push('/pending-approval');
          return;
        case 'rejected':
        case 'suspended':
          router.push('/account-blocked');
          return;
      }
    }
  }, [user, loading, allowedRoles, redirectTo, requireVerification, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  // Bloquer l'accès si le compte n'est pas actif et que la vérification est requise
  if (requireVerification && user.accountStatus !== 'active') {
    return null;
  }

  return <>{children}</>;
}
