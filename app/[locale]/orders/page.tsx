'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Search, Package, Truck, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, OrderStatus } from '@/types';
import Link from 'next/link';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('clientId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
        setOrders(data);
        setFiltered(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
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
  };

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
              Retour
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart size={32} />
              {t('title')}
            </h1>
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
              <option value="shipped">{t('shipped')}</option>
              <option value="delivered">{t('delivered')}</option>
              <option value="cancelled">{t('cancelled')}</option>
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
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')} &bull; {order.products.length} {order.products.length > 1 ? 'articles' : 'article'}
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

                    {/* Products preview */}
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {order.products.slice(0, 4).map((p, i) => (
                        <img
                          key={i}
                          src={p.image || '/placeholder.png'}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                      ))}
                      {order.products.length > 4 && (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500 flex-shrink-0">
                          +{order.products.length - 4}
                        </div>
                      )}
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
