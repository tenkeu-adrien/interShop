'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import EmailVerification from '@/components/auth/EmailVerification';
import { getUserData } from '@/lib/firebase/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Rediriger si pas d'utilisateur
    if (!user) {
      router.push('/login');
      return;
    }

    // Rediriger si email déjà vérifié
    if (user.emailVerified) {
      if (user.role === 'client') {
        router.push('/dashboard');
      } else {
        router.push('/verify-phone');
      }
    }
  }, [user, router]);

  const handleSuccess = async () => {
    if (!user) return;

    // Recharger les données utilisateur
    const updatedUser = await getUserData(user.id);
    if (updatedUser) {
      setUser(updatedUser);
    }

    // Rediriger selon le rôle
    if (user.role === 'client') {
      router.push('/dashboard');
    } else {
      router.push('/verify-phone');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4">
      <EmailVerification
        userId={user.id}
        email={user.email}
        displayName={user.displayName}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
