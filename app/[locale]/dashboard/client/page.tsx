'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ChevronRight,
  Headset,
  Settings,
  BadgePercent,
  ReceiptText,
  Wallet,
  Building2,
  MapPinned,
  FileBarChart,
  MessageCircle,
  Gem,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import WalletCard from '@/components/wallet/WalletCard';
import TileGrid, { type Tile } from '@/components/dashboard/TileGrid';
import MyOrdersSection from '@/components/dashboard/MyOrdersSection';

function ClientDashboardContent() {
  const user = useAuthStore((s) => s.user);
  const t = useTranslations('client');
  const tCommon = useTranslations('common');

  const comingSoon = () => toast(t('coming_soon'));

  const financeTiles: Tile[] = [
    { icon: BadgePercent, label: t('coupons_credits') },
    { icon: ReceiptText, label: t('invoices_receipts'), href: '/wallet/history' },
    { icon: Wallet, label: t('cards_accounts'), href: '/wallet/settings' },
    { icon: Building2, label: t('bank_transfer'), href: '/wallet/transfer' },
  ];

  const moreTiles: Tile[] = [
    { icon: MapPinned, label: t('shipping_address') },
    { icon: FileBarChart, label: t('tax_information') },
    { icon: MessageCircle, label: t('inquiries'), href: '/chat' },
    { icon: Gem, label: t('subscription'), href: '/pricing' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-3 py-4 space-y-3">
        {/* Identité */}
        <div className="flex items-center gap-3 px-1">
          <Link href="/profile" className="flex items-center gap-3 min-w-0 flex-1">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center shrink-0">
                {user?.displayName?.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-xl font-bold text-gray-900 truncate">{user?.displayName}</span>
            <ChevronDown size={20} className="text-gray-700 shrink-0" />
          </Link>
          <Link href="/contact" aria-label={t('support')} className="p-2 text-gray-900 shrink-0">
            <Headset size={24} />
          </Link>
          <Link href="/settings" aria-label={tCommon('settings')} className="p-2 text-gray-900 shrink-0">
            <Settings size={24} />
          </Link>
        </div>

        {/* Mes commandes */}
        <MyOrdersSection />

        {/* Paiement & Financement */}
        <section className="bg-white rounded-2xl p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('payment_financing')}</h2>
          <WalletCard className="mb-4" />
          <TileGrid tiles={financeTiles} columns="grid-cols-4" onComingSoon={comingSoon} />
        </section>

        {/* Plus de fonctionnalités */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t('more_features')}</h2>
            <Link href="/settings" className="flex items-center gap-1 text-sm text-gray-600 shrink-0">
              {t('all_features')} <ChevronRight size={18} className="rtl:rotate-180" />
            </Link>
          </div>
          <TileGrid tiles={moreTiles} columns="grid-cols-4" onComingSoon={comingSoon} />
        </section>
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['client', 'admin']}>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}
