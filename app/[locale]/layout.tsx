import type { Metadata } from 'next';
import '../globals.css';
import AppShell from '@/components/layout/AppShell';
import AuthProvider from '@/components/providers/AuthProvider';
import { CurrencyProvider } from '@/components/providers/CurrencyProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/i18n';

export const metadata: Metadata = {
  title: 'InterAppshop - Plateforme B2B/B2C',
  description: 'Plateforme e-commerce B2B/B2C inspirée d\'Alibaba',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale;
  const children = props.children;
  // Vérifier si la locale est supportée
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Récupérer les messages pour la locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans antialiased overflow-x-hidden">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ErrorBoundary>
            <AuthProvider>
              <CurrencyProvider>
                <AppShell>{children}</AppShell>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#fff',
                      color: '#111827',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </CurrencyProvider>
            </AuthProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
