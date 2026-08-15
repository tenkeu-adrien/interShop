'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { OrderStatusStepper } from '@/components/orders/OrderStatusStepper';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { getFournisseurOrders, updateOrderStatus } from '@/lib/firebase/orders';
import { toDate } from '@/lib/utils/date';
import { Order, OrderStatus } from '@/types';
import { ShoppingBag, Search, Package, Loader, Play, Truck, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import toast from 'react-hot-toast';

type StatusFilter = OrderStatus | 'all';

function FournisseurOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const { user } = useAuthStore();
  const tOrders = useTranslations('orders');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const tTabs = useTranslations('accountTabs');

  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam as StatusFilter);
    }
  }, [statusParam]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getFournisseurOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    let result = [...orders];
    if (search) {
      result = result.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.clientId?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    setFiltered(result);
  }, [orders, search, statusFilter]);

  const advanceStatus = async (order: Order) => {
    let next: OrderStatus | null = null;
    if (order.status === 'pending' || order.status === 'paid') next = 'processing';
    else if (order.status === 'processing') next = 'shipped';
    else if (order.status === 'shipped') next = 'delivered';

    if (!next || !order.id) return;

    setUpdating(order.id);
    try {
      await updateOrderStatus(order.id, next);
      toast.success(tCommon('success'));
      // Mise à jour locale immédiate
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next! } : o));
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error(tCommon('error'));
    } finally {
      setUpdating(null);
    }
  };

  const statusConfig: Record<string, { color: string }> = {
    pending:    { color: 'bg-yellow-100 text-yellow-800' },
    paid:       { color: 'bg-blue-100 text-blue-800' },
    processing: { color: 'bg-purple-100 text-purple-800' },
    shipped:    { color: 'bg-indigo-100 text-indigo-800' },
    delivered:  { color: 'bg-green-100 text-green-800' },
    cancelled:  { color: 'bg-red-100 text-red-800' },
    refunded:   { color: 'bg-red-100 text-red-800' },
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-2"
          >
            <ArrowLeft size={18} />
            {tCommon('back')}
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag size={28} className="text-green-600" />
            {tOrders('title')}
          </h1>
          {activeTabLabel && (
            <span className="mt-2 inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              {activeTabLabel}
            </span>
          )}
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          {tCommon('refresh')}
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={tOrders('search_orders')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="all">{tCommon('all')}</option>
          <option value="pending">{tOrders('pending')}</option>
          <option value="paid">{tOrders('paid')}</option>
          <option value="processing">{tOrders('processing')}</option>
          <option value="shipped">{tOrders('shipped')}</option>
          <option value="delivered">{tOrders('delivered')}</option>
          <option value="cancelled">{tOrders('cancelled')}</option>
          <option value="refunded">{tOrders('refunded')}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <Package className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg">{tOrders('no_orders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const sc = statusConfig[order.status] ?? { color: 'bg-gray-100 text-gray-800' };
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {toDate(order.createdAt).toLocaleDateString(locale)} &bull; {order.products.length} {tOrders('items')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                      {tOrders(order.status as any) || order.status}
                    </span>
                    <PriceDisplay priceUSD={order.total} className="font-bold text-green-600 text-lg" />
                  </div>
                </div>

                {/* Suivi de commande */}
                <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <OrderStatusStepper status={order.status} />
                </div>

                {/* Produits */}
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                  {order.products.slice(0, 5).map((p, i) => (
                    <img
                      key={i}
                      src={p.image || '/logo.png'}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-2">
                    {order.products.map(p => p.name).slice(0, 2).join(', ')}
                    {order.products.length > 2 && '...'}
                  </span>
                </div>

                {/* Actions de statut */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {(order.status === 'pending' || order.status === 'paid') && (
                    <button
                      onClick={() => advanceStatus(order)}
                      disabled={updating === order.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                    >
                      {updating === order.id ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
                      {tOrders('take_in_processing')}
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button
                      onClick={() => advanceStatus(order)}
                      disabled={updating === order.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {updating === order.id ? <Loader className="animate-spin" size={16} /> : <Truck size={16} />}
                      {tOrders('mark_shipped')}
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => advanceStatus(order)}
                      disabled={updating === order.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating === order.id ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                      {tOrders('mark_delivered')}
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-semibold">
                      <CheckCircle size={16} />
                      {tOrders('order_delivered')}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FournisseurOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['fournisseur', 'admin']}>
      <FournisseurOrdersContent />
    </ProtectedRoute>
  );
}