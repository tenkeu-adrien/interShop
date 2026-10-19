'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ChevronRight, Clock, Boxes, PackageCheck, RefreshCcw, Star } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';
import { OrderStatus } from '@/types';
import TileGrid, { type Tile } from '@/components/dashboard/TileGrid';

/**
 * Section « Mes commandes » : achats de l'utilisateur (peu importe son rôle).
 * Rendu identique dans tous les tableaux de bord (client, fournisseur,
 * marketiste, admin) : chaque utilisateur peut commander comme un client.
 */
export default function MyOrdersSection() {
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
    { icon: Clock, label: t('orders_pending_payment'), href: '/orders', count: counts.pending },
    { icon: Boxes, label: t('orders_pending_shipment'), href: '/orders', count: (counts.paid ?? 0) + (counts.processing ?? 0) },
    { icon: PackageCheck, label: t('orders_pending_receipt'), href: '/orders', count: counts.shipped },
    { icon: RefreshCcw, label: t('orders_refunds'), href: '/orders', count: counts.refunded },
    { icon: Star, label: t('orders_pending_review'), href: '/orders', count: counts.delivered },
  ];

  return (
    <section className="bg-white rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{t('my_orders')}</h2>
        <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-600">
          {tCommon('view_all')} <ChevronRight size={18} className="rtl:rotate-180" />
        </Link>
      </div>
      <TileGrid tiles={orderTiles} columns="grid-cols-5" onComingSoon={comingSoon} />
    </section>
  );
}
