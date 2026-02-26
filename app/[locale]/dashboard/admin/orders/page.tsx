'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
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
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, OrderStatus } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const tAdmin = useTranslations('admin');
  const tOrders = useTranslations('orders');
  const tCommon = useTranslations('common');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    // if (!loading && (!user || user.role !== 'admin')) {
    //   router.push('/dashboard');
    //   return;
    // }

    if (user && user.role !== 'admin') {
      loadOrders();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = ordersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Order[];
      // Sort by date desc
      ordersData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoadingOrders(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.clientId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updates: any = { 
        status: newStatus, 
        updatedAt: new Date() 
      };

      if (newStatus === 'paid') updates.paidAt = new Date();
      if (newStatus === 'shipped') updates.shippedAt = new Date();
      if (newStatus === 'delivered') updates.deliveredAt = new Date();

      await updateDoc(doc(db, 'orders', orderId), updates);
      toast.success(tCommon('success'));
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(tAdmin('error_updating'));
    }
  };

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // if (!user || user.role !== 'admin') {
  //   return null;
  // }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'paid': return <CheckCircle size={14} />;
      case 'processing': return <RefreshCw size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'delivered': return <Package size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      case 'refunded': return <DollarSign size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <ShoppingCart className="text-orange-600" size={40} />
                {tOrders('title')}
              </h1>
              <p className="text-gray-600">{tAdmin('manage_all_users')}</p>
            </div>
            <Link
              href="/dashboard/admin"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              {tCommon('back')}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <ShoppingCart size={14} /> {tAdmin('total')}
              </p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-yellow-600 text-sm flex items-center gap-1">
                <Clock size={14} /> {tOrders('pending')}
              </p>
              <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-green-600 text-sm flex items-center gap-1">
                <CheckCircle size={14} /> {tOrders('delivered')}
              </p>
              <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <DollarSign size={14} /> {tAdmin('total_revenue')}
              </p>
              <p className="text-xl font-bold text-blue-600">${totalRevenue.toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={tOrders('order_number')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                <option value="all">{tAdmin('all_statuses')}</option>
                <option value="pending">{tOrders('pending')}</option>
                <option value="paid">{tOrders('confirmed')}</option>
                <option value="processing">{tOrders('processing')}</option>
                <option value="shipped">{tOrders('shipped')}</option>
                <option value="delivered">{tOrders('delivered')}</option>
                <option value="cancelled">{tOrders('cancelled')}</option>
                <option value="refunded">Remboursée</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tOrders('order_number')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tCommon('products')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tOrders('total')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tOrders('status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tOrders('date')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{tAdmin('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{order.clientId.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{order.products.length} {order.products.length > 1 ? tOrders('items') : tOrders('item')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriceDisplay 
                        priceUSD={order.total}
                        className="text-sm font-bold text-green-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(order)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title={tOrders('view_details')}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                {tAdmin('showing')} {indexOfFirstOrder + 1} {tAdmin('to')} {Math.min(indexOfLastOrder, filteredOrders.length)} {tAdmin('of')} {filteredOrders.length} {tOrders('title')}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  {tAdmin('previous')}
                </button>
                <span className="px-4 py-1 bg-orange-100 text-orange-800 rounded-lg font-semibold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {tAdmin('next')}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{tOrders('view_details')}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b">
                    <div>
                      <p className="text-sm text-gray-600">{tOrders('order_number')}</p>
                      <p className="font-semibold">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{tOrders('status')}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{tOrders('date')}</p>
                      <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{tCommon('payment_method')}</p>
                      <p className="font-semibold">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package size={20} className="text-orange-500" />
                      {tCommon('products')}
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.products.map((product, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{tCommon('quantity')}: {product.quantity}</p>
                          </div>
                          <PriceDisplay 
                            priceUSD={product.price * product.quantity}
                            className="font-bold text-green-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin size={20} className="text-orange-500" />
                      {tCommon('shipping_address')}
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.country}</p>
                      <p className="text-sm text-gray-600 mt-1">Tél: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{tCommon('subtotal')}</span>
                        <PriceDisplay priceUSD={selectedOrder.subtotal} className="font-semibold" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{tCommon('shipping')}</span>
                        <PriceDisplay priceUSD={selectedOrder.shippingFee} className="font-semibold" />
                      </div>
                      {selectedOrder.marketingCommission > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>{tCommon('discount')}</span>
                          <PriceDisplay priceUSD={-selectedOrder.marketingCommission} className="" />
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>{tOrders('total')}</span>
                        <PriceDisplay priceUSD={selectedOrder.total} className="text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Update Status */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">{tOrders('status')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                          disabled={selectedOrder.status === status}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            selectedOrder.status === status
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
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
