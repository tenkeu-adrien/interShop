'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ShoppingCart, Search, Package, Truck, CheckCircle, XCircle, Clock, ArrowLeft, Store } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, OrderStatus } from '@/types';
import Link from 'next/link';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { OrderStatusStepper } from '@/components/orders/OrderStatusStepper';
import { toDate } from '@/lib/utils/date';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const tTabs = useTranslations('accountTabs');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [shopNames, setShopNames] = useState<Record<string, string>>({});
  const [productMap, setProductMap] = useState<Record<string, { tags?: string[]; sku?: string }>>({});

  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam as OrderStatus | 'all');
    }
  }, [statusParam]);

  useEffect(() => {
    // Récupérer le label des boutiques liées aux commandes
    const ids = [...new Set(orders.map(o => o.fournisseurId).filter(Boolean))] as string[];
    ids.forEach(async (id) => {
      if (shopNames[id]) return;
      try {
        const snap = await getDoc(doc(db, 'users', id));
        if (snap.exists()) {
          const d = snap.data();
          setShopNames(prev => ({ ...prev, [id]: d.shopName || '' }));
        }
      } catch (err) {
        console.error('Erreur chargement boutique:', err);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  useEffect(() => {
    // Récupérer les infos produit (SKU, labels/tags)
    const ids = [...new Set(orders.flatMap(o => o.products.map(p => p.productId)))];
    ids.forEach(async (id) => {
      if (productMap[id]) return;
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          const d = snap.data();
          setProductMap(prev => ({ ...prev, [id]: { tags: d.tags || [], sku: d.sku || '' } }));
        }
      } catch (err) {
        console.error('Erreur chargement produit:', err);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'orders'),
      where('clientId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    // Écoute en temps réel pour le suivi de commande
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
      setOrders(data);
      setFiltered(data);
      setLoading(false);
    }, (e) => {
      console.error(e);
      setLoading(false);
      // Repli sur chargement statique
      getDocs(q).then(snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
        setOrders(data);
        setFiltered(data);
      }).catch(console.error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let result = [...orders];
    if (search) {
      result = result.filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    setFiltered(result);
  }, [orders, search, statusFilter]);

  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    pending:   { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
    paid:      { color: 'bg-blue-100 text-blue-800',   icon: <CheckCircle size={14} /> },
    processing:{ color: 'bg-purple-100 text-purple-800', icon: <Package size={14} /> },
    shipped:   { color: 'bg-indigo-100 text-indigo-800', icon: <Truck size={14} /> },
    delivered: { color: 'bg-green-100 text-green-800',  icon: <CheckCircle size={14} /> },
    cancelled: { color: 'bg-red-100 text-red-800',     icon: <XCircle size={14} /> },
    refunded:  { color: 'bg-red-100 text-red-800',     icon: <XCircle size={14} /> },
  };

  // Label de l'onglet actif (provenant du dashboard "Mon compte")
  const tabKeyByStatus: Record<string, string> = {
    cancelled: 'echoue',
    processing: 'emballage',
    shipped: 'expedition',
    refunded: 'rembours',
    delivered: 'recu',
  };
  const activeTabLabel = statusParam === 'all'
    ? tTabs('details')
    : statusParam && tabKeyByStatus[statusParam]
      ? tTabs(tabKeyByStatus[statusParam])
      : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 py-10">
          <div className="container mx-auto px-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-800 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              {tCommon('back')}
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart size={32} />
              {t('title')}
            </h1>
            {activeTabLabel && (
              <span className="mt-2 inline-flex items-center gap-2 bg-white/90 text-gray-900 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-600" />
                {activeTabLabel}
              </span>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">{tCommon('all')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="paid">{t('paid')}</option>
              <option value="processing">{t('processing')}</option>
              <option value="shipped">{t('shipped')}</option>
              <option value="delivered">{t('delivered')}</option>
              <option value="cancelled">{t('cancelled')}</option>
              <option value="refunded">{t('refunded')}</option>
            </select>
          </div>

          {/* Orders list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg mb-4">{t('no_orders')}</p>
              <Link
                href="/"
                className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                {t('start_shopping')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(order => {
                const sc = statusConfig[order.status] ?? { color: 'bg-gray-100 text-gray-800', icon: <Clock size={14} /> };
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {toDate(order.createdAt).toLocaleDateString(locale)} &bull; {order.products.length} {order.products.length > 1 ? t('items') : t('item')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                          {sc.icon}
                          {t(order.status as any) || order.status}
                        </span>
                        <PriceDisplay priceUSD={order.total} className="font-bold text-green-600 text-lg" />
                      </div>
                    </div>

                    {/* Suivi de commande */}
                    <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <OrderStatusStepper status={order.status} />
                    </div>

                    {/* Boutique liée (si le fournisseur en a créé une) */}
                    {order.fournisseurId && shopNames[order.fournisseurId] && (
                      <div className="mt-3">
                        <Link
                          href={`/boutiques/${order.fournisseurId}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors"
                        >
                          <Store size={12} />
                          {shopNames[order.fournisseurId]}
                        </Link>
                      </div>
                    )}

                    {/* Produits */}
                    <div className="mt-3 space-y-2">
                      {order.products.map((p) => {
                        const pinfo = productMap[p.productId];
                        return (
                          <div key={p.productId} className="flex items-start gap-3">
                            <img
                              src={p.image || '/logo.png'}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                              {pinfo?.sku && (
                                <p className="text-xs text-gray-500">{tCommon('sku')}: {pinfo.sku}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {tCommon('quantity')}: {p.quantity}
                              </p>
                              {pinfo?.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {pinfo.tags.slice(0, 4).map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <PriceDisplay
                              priceUSD={p.price * p.quantity}
                              className="text-sm font-semibold text-gray-900"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
