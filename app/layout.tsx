import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import AuthProvider from '@/components/providers/AuthProvider';
import { CurrencyProvider } from '@/components/providers/CurrencyProvider';
import AccountStatusBanner from '@/components/auth/AccountStatusBanner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InterAppshop - Plateforme B2B/B2C',
  description: 'Plateforme e-commerce B2B/B2C inspirée d\'Alibaba',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <CurrencyProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <AccountStatusBanner />
                <main className="flex-1 pb-20 md:pb-0">{children}</main>
                <Footer />
                <MobileNav />
              </div>
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
      </body>
    </html>
  );
}
