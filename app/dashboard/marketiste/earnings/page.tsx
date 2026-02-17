'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Calendar,
  Download,
  ChevronLeft,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

export default function MarketisteEarningsPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'marketiste')) {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'marketiste') {
      loadEarnings();
    }
  }, [user, loading, router]);

  const loadEarnings = async () => {
    if (!user) return;
    
    setLoadingData(true);
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('marketisteId', '==', user.id)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Erreur lors du chargement des gains');
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'marketiste') {
    return null;
  }

  // Calculs
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  const filterOrdersByPeriod = (orders: Order[]) => {
    if (periodFilter === 'month') {
      return orders.filter(o => {
        const orderDate = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt);
        return orderDate >= firstDayOfMonth;
      });
    } else if (periodFilter === 'week') {
      return orders.filter(o => {
        const orderDate = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt);
        return orderDate >= firstDayOfWeek;
      });
    }
    return orders;
  };

  const filteredOrders = filterOrdersByPeriod(orders);

  const totalEarnings = filteredOrders.reduce((sum, o) => sum + o.marketingCommission, 0);
  const pendingEarnings = filteredOrders
    .filter(o => o.status === 'pending' || o.status === 'paid' || o.status === 'processing' || o.status === 'shipped')
    .reduce((sum, o) => sum + o.marketingCommission, 0);
  const paidEarnings = filteredOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.marketingCommission, 0);
  const cancelledEarnings = filteredOrders
    .filter(o => o.status === 'cancelled' || o.status === 'refunded')
    .reduce((sum, o) => sum + o.marketingCommission, 0);

  // Earnings by month
  const earningsByMonth: { [key: string]: number } = {};
  orders.forEach(order => {
    const date = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    earningsByMonth[monthKey] = (earningsByMonth[monthKey] || 0) + order.marketingCommission;
  });

  const monthlyData = Object.entries(earningsByMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)
    .reverse();

  // Recent transactions
  const recentTransactions = [...filteredOrders]
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10);

  const statCards = [
    {
      title: 'Gains totaux',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+23%',
      isPositive: true,
    },
    {
      title: 'En attente',
      value: `$${pendingEarnings.toFixed(2)}`,
      icon: Clock,
      color: 'bg-yellow-500',
      change: `${filteredOrders.filter(o => ['pending', 'paid', 'processing', 'shipped'].includes(o.status)).length} commandes`,
      isPositive: true,
    },
    {
      title: 'Payés',
      value: `$${paidEarnings.toFixed(2)}`,
      icon: CheckCircle,
      color: 'bg-blue-500',
      change: `${filteredOrders.filter(o => o.status === 'delivered').length} commandes`,
      isPositive: true,
    },
    {
      title: 'Annulés',
      value: `$${cancelledEarnings.toFixed(2)}`,
      icon: TrendingDown,
      color: 'bg-red-500',
      change: `${filteredOrders.filter(o => ['cancelled', 'refunded'].includes(o.status)).length} commandes`,
      isPositive: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Wallet className="text-green-600" size={40} />
                Mes gains
              </h1>
              <p className="text-gray-600">Suivez vos commissions et revenus</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/marketiste"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Retour
              </Link>
              <button
                onClick={() => toast.success('Fonctionnalité bientôt disponible')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Download size={20} />
                Exporter
              </button>
            </div>
          </div>

          {/* Period Filter */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                periodFilter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                periodFilter === 'month'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ce mois
            </button>
            <button
              onClick={() => setPeriodFilter('week')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                periodFilter === 'week'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cette semaine
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <card.icon className="text-white" size={24} />
                  </div>
                  {card.isPositive ? (
                    <ArrowUpRight className="text-green-500" size={20} />
                  ) : (
                    <ArrowDownRight className="text-red-500" size={20} />
                  )}
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                <p className={`text-sm ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-500" size={24} />
              Évolution mensuelle
            </h2>

            <div className="space-y-4">
              {monthlyData.map(([month, amount], index) => {
                const maxAmount = Math.max(...monthlyData.map(([, a]) => a));
                const percentage = (amount / maxAmount) * 100;
                const date = new Date(month + '-01');
                const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

                return (
                  <div key={month}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{monthName}</span>
                      <span className="text-sm font-bold text-green-600">${amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="text-blue-500" size={24} />
              Informations de paiement
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Wallet className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Solde disponible</p>
                    <p className="text-2xl font-bold text-blue-900">${paidEarnings.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => toast.success('Demande de retrait envoyée')}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Demander un retrait
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Prochain paiement</span>
                  <span className="font-semibold">1er du mois</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Méthode de paiement</span>
                  <span className="font-semibold">Virement bancaire</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Seuil minimum</span>
                  <span className="font-semibold">$50.00</span>
                </div>
              </div>

              <button
                onClick={() => toast('Fonctionnalité bientôt disponible', { icon: 'ℹ️' })}
                className="w-full text-green-600 border-2 border-green-600 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Modifier mes informations
              </button>
            </div>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="text-purple-500" size={24} />
            Transactions récentes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-yellow-600">
                      {order.marketingCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' || order.status === 'refunded' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <PriceDisplay 
                        priceUSD={order.marketingCommission}
                        className="text-sm font-bold text-green-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {recentTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune transaction pour la période sélectionnée
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
