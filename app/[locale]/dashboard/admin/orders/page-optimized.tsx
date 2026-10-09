'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  MapPin,
  CreditCard,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { updateOrderStatus as updateOrderStatusWithNotif } from '@/lib/firebase/orders';
import { Order, OrderStatus } from '@/types';
import { toDate } from '@/lib/utils/date';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const tAdmin = useTranslations('admin');
  const tOrders = useTranslations('orders');
  const tCommon = useTranslations('common');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Debounce search pour éviter trop de requêtes
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Configuration de la pagination avec filtres
  const filters = statusFilter !== 'all' 
    ? [{ field: 'status', operator: '==' as const, value: statusFilter }]
    : [];

  const {
    data: orders,
    loading: loadingOrders,
    hasMore,
    loadFirstPage,
    loadNextPage,
    refresh,
    totalLoaded,
  } = usePagination<Order>({
    collectionName: 'orders',
    pageSize: 20,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    filters,
  });

  // Charger les données au montage
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadFirstPage();
    }
  }, [user, statusFilter]);

  // Filtrer localement par recherche
  const filteredOrders = orders.filter(order => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.clientId?.toLowerCase().includes(searchLower) ||
      order.clientName?.toLowerCase().includes(searchLower)
    );
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatusWithNotif(orderId, newStatus);
      const updates: any = { status: newStatus, updatedAt: new Date() };
      if (newStatus === 'paid') updates.paidAt = new Date();
      if (newStatus === 'processing') updates.processingAt = new Date();
      if (newStatus === 'shipped') updates.shippedAt = new Date();
      if (newStatus === 'delivered') updates.deliveredAt = new Date();

      // Refresh pour obtenir les données à jour
      refresh();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updates } : null);
      }
      toast.success(tCommon('success'));
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(tAdmin('error_updating'));
    }
  };

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Calculer les statistiques
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const completedOrders = filteredOrders.filter(o => o.status === 'delivered').length;

  const getStatusBadge = (status: OrderStatus) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      paid: { bg: 'bg-blue-100', text: 'text-blue-800', icon: DollarSign },
      processing: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package },
      shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Truck },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    const { bg, text, icon: Icon } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon size={14} />
        {tOrders(status)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tAdmin('manage_orders')}</h1>
              <p className="text-gray-600 mt-1">{tAdmin('total')}: {totalLoaded} commandes chargées</p>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={loadingOrders}
            >
              <RefreshCw size={18} className={loadingOrders ? 'animate-spin' : ''} />
              {tCommon('refresh')}
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <DollarSign size={14} /> {tAdmin('total_revenue')}
              </p>
              <p className="text-xl font-bold text-blue-600">
                <PriceDisplay amount={totalRevenue} />
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-yellow-600 text-sm flex items-center gap-1">
                <Clock size={14} /> {tAdmin('pending')}
              </p>
              <p className="text-xl font-bold text-yellow-600">{pendingOrders}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-green-600 text-sm flex items-center gap-1">
                <CheckCircle size={14} /> Livrées
              </p>
              <p className="text-xl font-bold text-green-600">{completedOrders}</p>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tAdmin('search_placeholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payé</option>
                  <option value="processing">En traitement</option>
                  <option value="shipped">Expédié</option>
                  <option value="delivered">Livré</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loadingOrders && orders.length === 0 ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-green-600" size={48} />
              <p className="text-gray-600">Chargement des commandes...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">Aucune commande trouvée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Commande
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber || order.id.slice(0, 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.clientName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.clientEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            <PriceDisplay amount={order.total} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {toDate(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openModal(order)}
                            className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                          >
                            <Eye size={16} /> {tAdmin('view')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bouton charger plus */}
              {hasMore && (
                <div className="p-4 border-t border-gray-200 text-center">
                  <button
                    onClick={loadNextPage}
                    disabled={loadingOrders}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                  >
                    {loadingOrders ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <ChevronRight size={18} />
                        Charger plus
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal détails (simplifié pour l'exemple) */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Commande #{selectedOrder.orderNumber}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Statut actuel</p>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Changer le statut</p>
                    <div className="flex flex-wrap gap-2">
                      {(['paid', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                          disabled={selectedOrder.status === status}
                          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {tOrders(status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold mb-2">Articles ({selectedOrder.items.length})</p>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-semibold">
                          <PriceDisplay amount={item.price * item.quantity} />
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between py-3 font-bold text-lg">
                      <span>Total</span>
                      <span><PriceDisplay amount={selectedOrder.total} /></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
