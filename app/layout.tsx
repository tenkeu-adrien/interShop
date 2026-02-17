import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import { CurrencyProvider } from '@/components/providers/CurrencyProvider';
import AccountStatusBanner from '@/components/auth/AccountStatusBanner';
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
        <AuthProvider>
          <CurrencyProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <AccountStatusBanner />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster position="top-right" />
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
