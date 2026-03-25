'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
  ShoppingCart, Search, Filter, Eye, Package, Truck,
  CheckCircle, XCircle, Clock, DollarSign, ChevronLeft,
  ChevronRight, Calendar, MapPin, RefreshCw, Tag
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, OrderStatus } from '@/types';
import { creditMarketisteCommission } from '@/lib/firebase/wallet';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  paid:       'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-800',
};

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  pending:    <Clock size={14} />,
  paid:       <CheckCircle size={14} />,
  processing: <RefreshCw size={14} />,
  shipped:    <Truck size={14} />,
  delivered:  <Package size={14} />,
  cancelled:  <XCircle size={14} />,
  refunded:   <DollarSign size={14} />,
};

// Transitions autorisées par rôle
const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  fournisseur: ['paid', 'processing', 'shipped', 'delivered', 'cancelled'],
  admin:       ['paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
};

function FournisseurOrdersContent() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      // Admin voit tout, fournisseur voit ses commandes
      const q = user.role === 'admin'
        ? query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        : query(
            collection(db, 'orders'),
            where('fournisseurId', '==', user.id),
            orderBy('createdAt', 'desc')
          );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
      setOrders(data);
    } catch (e) {
      console.error(e);
      toast.error('Erreur chargement commandes');
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useEffect(() => {
    let result = [...orders];
    if (searchQuery) {
      result = result.filter(o =>
        o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.clientId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    setFiltered(result);
    setPage(1);
  }, [orders, searchQuery, statusFilter]);

  const handleUpdateStatus = async (order: Order, newStatus: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      const updates: any = { status: newStatus, updatedAt: new Date() };
      if (newStatus === 'paid')      updates.paidAt = new Date();
      if (newStatus === 'shipped')   updates.shippedAt = new Date();
      if (newStatus === 'delivered') updates.deliveredAt = new Date();

      await updateDoc(doc(db, 'orders', order.id), updates);

      // Créditer la commission marketiste à la livraison
      if (newStatus === 'delivered' && order.marketisteId && order.marketingCommission > 0) {
        try {
          await creditMarketisteCommission(
            order.marketisteId,
            order.id,
            order.orderNumber,
            order.marketingCommission
          );
          toast.success(`Commission de $${order.marketingCommission.toFixed(2)} créditée au marketiste`);
        } catch (e) {
          console.error('Erreur crédit commission:', e);
          toast.error('Commission non créditée — vérifiez manuellement');
        }
      }

      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updates } : o));
      if (selectedOrder?.id === order.id) setSelectedOrder(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Statut mis à jour');
    } catch (e) {
      console.error(e);
      toast.error('Erreur mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const allowedStatuses = ALLOWED_TRANSITIONS[user?.role === 'admin' ? 'admin' : 'fournisseur'];

  // Stats
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <ShoppingCart className="text-orange-600" size={40} />
                Gestion des commandes
              </h1>
              <p className="text-gray-600">
                {user?.role === 'admin' ? 'Toutes les commandes' : 'Vos commandes clients'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadOrders}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} /> Actualiser
              </button>
              <Link
                href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/fournisseur'}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Retour
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm flex items-center gap-1"><ShoppingCart size={14} /> Total</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-yellow-600 text-sm flex items-center gap-1"><Clock size={14} /> En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-green-600 text-sm flex items-center gap-1"><CheckCircle size={14} /> Livrées</p>
              <p className="text-2xl font-bold text-green-600">{delivered}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <p className="text-blue-600 text-sm flex items-center gap-1"><DollarSign size={14} /> Revenus</p>
              <p className="text-xl font-bold text-blue-600">${totalRevenue.toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par numéro ou client..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
                {user?.role === 'admin' && <option value="refunded">Remboursée</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code promo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {current.map(order => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{order.clientId.substring(0, 10)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.products?.length ?? 0} article(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriceDisplay priceUSD={order.total} className="text-sm font-bold text-green-600" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.marketingCode ? (
                        <span className="flex items-center gap-1 text-xs font-mono font-semibold text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                          <Tag size={12} /> {order.marketingCode}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {STATUS_ICONS[order.status]}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Voir détails"
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
              <span className="text-sm text-gray-700">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-1">
                  <ChevronLeft size={16} /> Précédent
                </button>
                <span className="px-4 py-1 bg-orange-100 text-orange-800 rounded-lg font-semibold">{page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-1">
                  Suivant <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <ShoppingCart className="mx-auto mb-4 text-gray-300" size={64} />
              <p>Aucune commande trouvée</p>
            </div>
          )}
        </div>

        {/* Modal détail commande */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Commande {selectedOrder.orderNumber}
                  </h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                    <XCircle size={28} />
                  </button>
                </div>

                {/* Infos générales */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-6 border-b mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Statut actuel</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[selectedOrder.status]}`}>
                      {STATUS_ICONS[selectedOrder.status]} {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Date</p>
                    <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Paiement</p>
                    <p className="font-semibold">{selectedOrder.paymentMethod}</p>
                  </div>
                  {selectedOrder.marketingCode && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Code promo</p>
                      <p className="font-mono font-bold text-yellow-700">{selectedOrder.marketingCode}</p>
                    </div>
                  )}
                  {selectedOrder.marketingCommission > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Commission marketiste</p>
                      <PriceDisplay priceUSD={selectedOrder.marketingCommission} className="font-bold text-green-600" />
                    </div>
                  )}
                </div>

                {/* Produits */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package size={18} className="text-orange-500" /> Produits
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.products?.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500">Qté: {p.quantity}</p>
                        </div>
                        <PriceDisplay priceUSD={p.price * p.quantity} className="font-bold text-green-600 text-sm" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adresse */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-orange-500" /> Adresse de livraison
                  </h3>
                  <p className="font-medium">{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}
                  </p>
                  <p className="text-sm text-gray-600">Tél: {selectedOrder.shippingAddress?.phone}</p>
                </div>

                {/* Totaux */}
                <div className="mb-6 border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <PriceDisplay priceUSD={selectedOrder.subtotal} className="font-semibold" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <PriceDisplay priceUSD={selectedOrder.shippingFee} className="font-semibold" />
                  </div>
                  {(selectedOrder.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction code promo</span>
                      <PriceDisplay priceUSD={-(selectedOrder.discountAmount ?? 0)} className="" />
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <PriceDisplay priceUSD={selectedOrder.total} className="text-green-600" />
                  </div>
                </div>

                {/* Actions de statut */}
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'refunded' && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Changer le statut</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {allowedStatuses
                        .filter(s => s !== selectedOrder.status)
                        .map(status => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(selectedOrder, status)}
                            disabled={updatingId === selectedOrder.id}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${
                              status === 'delivered'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : status === 'cancelled'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            } disabled:opacity-50`}
                          >
                            {updatingId === selectedOrder.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : STATUS_ICONS[status]}
                            {status === 'paid' ? 'Marquer payée' :
                             status === 'processing' ? 'En traitement' :
                             status === 'shipped' ? 'Expédiée' :
                             status === 'delivered' ? '✓ Marquer livrée' :
                             status === 'cancelled' ? 'Annuler' :
                             status === 'refunded' ? 'Rembourser' : status}
                          </button>
                        ))}
                    </div>
                    {selectedOrder.marketisteId && selectedOrder.marketingCommission > 0 && (
                      <p className="text-xs text-green-700 mt-3 bg-green-50 p-2 rounded">
                        💡 En marquant "Livrée", la commission de ${selectedOrder.marketingCommission.toFixed(2)} sera automatiquement créditée au marketiste.
                      </p>
                    )}
                  </div>
                )}

                {(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                  <div className={`border-t pt-4 text-center py-3 rounded-lg text-sm font-semibold ${
                    selectedOrder.status === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {selectedOrder.status === 'delivered' ? '✓ Commande livrée — commission créditée' : '✗ Commande annulée'}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
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
