'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import AccountStatusBanner from '@/components/auth/AccountStatusBanner';

// Pages affichées seules, sans en-tête, pied de page ni navigation mobile.
const BARE_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password-simple',
  '/verify-code',
  '/verify-email',
  '/verify-phone',
];

// Pages accessibles sans être connecté.
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password-simple', '/verify-code'];

const matches = (path: string, routes: string[]) =>
  routes.some((route) => path === route || path.startsWith(`${route}/`));

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const path = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/';
  const isBare = matches(path, BARE_ROUTES);
  const isPublic = matches(path, PUBLIC_ROUTES);
  const mustLogin = !isPublic && !loading && !user;

  useEffect(() => {
    if (mustLogin) router.replace(`/${locale}/login`);
  }, [mustLogin, locale, router]);

  if (isBare) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex justify-end px-4 pt-4">
          <LanguageSwitcher />
        </div>
        {children}
      </main>
    );
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AccountStatusBanner />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
