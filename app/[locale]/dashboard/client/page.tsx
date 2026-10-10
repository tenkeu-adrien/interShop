'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  ChevronDown,
  ChevronRight,
  Headset,
  Settings,
  WalletCards,
  Package,
  Ship,
  Undo2,
  MessageSquareText,
  TicketPercent,
  Receipt,
  CreditCard,
  Landmark,
  MapPin,
  FileText,
  MessageCircleQuestion,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import { OrderStatus } from '@/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import WalletCard from '@/components/wallet/WalletCard';

type Tile = { icon: LucideIcon; label: string; href?: string; count?: number };

function TileGrid({ tiles, columns, onComingSoon }: { tiles: Tile[]; columns: string; onComingSoon: () => void }) {
  return (
    <div className={`grid ${columns} gap-1`}>
      {tiles.map(({ icon: Icon, label, href, count }) => {
        const content = (
          <>
            <span className="relative">
              <Icon size={26} strokeWidth={1.6} className="text-gray-900" />
              {count ? (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </span>
            <span className="text-xs text-gray-700 text-center leading-tight break-words">{label}</span>
          </>
        );
        const className = 'flex flex-col items-center gap-2 py-2 px-0.5 rounded-lg hover:bg-gray-50 transition-colors min-w-0';
        return href ? (
          <Link key={label} href={href} className={className}>
            {content}
          </Link>
        ) : (
          <button key={label} type="button" onClick={onComingSoon} className={className}>
            {content}
          </button>
        );
      })}
    </div>
  );
}

function ClientDashboardContent() {
  const user = useAuthStore((s) => s.user);
  const t = useTranslations('client');
  const tCommon = useTranslations('common');
  const [counts, setCounts] = useState<Partial<Record<OrderStatus, number>>>({});

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, 'orders'), where('clientId', '==', user.id)))
      .then((snapshot) => {
        const next: Partial<Record<OrderStatus, number>> = {};
        snapshot.docs.forEach((doc) => {
          const status = doc.data().status as OrderStatus;
          next[status] = (next[status] ?? 0) + 1;
        });
        setCounts(next);
      })
      .catch((error) => console.error('Erreur de chargement des commandes:', error));
  }, [user?.id]);

  const comingSoon = () => toast(t('coming_soon'));

  const orderTiles: Tile[] = [
    { icon: WalletCards, label: t('orders_pending_payment'), href: '/orders', count: counts.pending },
    { icon: Package, label: t('orders_pending_shipment'), href: '/orders', count: (counts.paid ?? 0) + (counts.processing ?? 0) },
    { icon: Ship, label: t('orders_pending_receipt'), href: '/orders', count: counts.shipped },
    { icon: Undo2, label: t('orders_refunds'), href: '/orders', count: counts.refunded },
    { icon: MessageSquareText, label: t('orders_pending_review'), href: '/orders', count: counts.delivered },
  ];

  const financeTiles: Tile[] = [
    { icon: TicketPercent, label: t('coupons_credits') },
    { icon: Receipt, label: t('invoices_receipts'), href: '/wallet/history' },
    { icon: CreditCard, label: t('cards_accounts'), href: '/wallet/settings' },
    { icon: Landmark, label: t('bank_transfer'), href: '/wallet/transfer' },
  ];

  const moreTiles: Tile[] = [
    { icon: MapPin, label: t('shipping_address') },
    { icon: FileText, label: t('tax_information') },
    { icon: MessageCircleQuestion, label: t('inquiries'), href: '/chat' },
    { icon: Sparkles, label: t('subscription'), href: '/pricing' },
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
        <section className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t('my_orders')}</h2>
            <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-600">
              {tCommon('view_all')} <ChevronRight size={18} className="rtl:rotate-180" />
            </Link>
          </div>
          <TileGrid tiles={orderTiles} columns="grid-cols-5" onComingSoon={comingSoon} />
        </section>

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
