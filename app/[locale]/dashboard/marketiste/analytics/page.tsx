'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  ShoppingCart,
  Tag,
  DollarSign,
  ChevronLeft,
  Calendar,
  Target,
  Award,
  Zap,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MarketingCode, Order } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MarketisteAnalyticsPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  
  const [codes, setCodes] = useState<MarketingCode[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'marketiste')) {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'marketiste') {
      loadAnalytics();
    }
  }, [user, loading, router]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    setLoadingData(true);
    try {
      // Load codes
      const codesQuery = query(
        collection(db, 'marketingCodes'),
        where('marketisteId', '==', user.id)
      );
      const codesSnapshot = await getDocs(codesQuery);
      const codesData = codesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as MarketingCode[];
      setCodes(codesData);

      // Load orders
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
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des statistiques');
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

  // Analytics calculations
  const totalCodes = codes.length;
  const activeCodes = codes.filter(c => c.isActive).length;
  const totalUsage = codes.reduce((sum, c) => sum + c.usageCount, 0);
  const totalEarnings = orders.reduce((sum, o) => sum + o.marketingCommission, 0);
  const avgCommissionRate = codes.length > 0 
    ? (codes.reduce((sum, c) => sum + c.commissionRate, 0) / codes.length * 100).toFixed(1)
    : 0;
  const avgOrderValue = orders.length > 0
    ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toFixed(2)
    : 0;
  const conversionRate = totalUsage > 0 
    ? ((orders.length / totalUsage) * 100).toFixed(1)
    : 0;

  // Top performing codes
  const topCodes = [...codes]
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 5);

  // Orders by status
  const ordersByStatus = {
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  // Monthly performance
  const monthlyPerformance: { [key: string]: { orders: number; earnings: number } } = {};
  orders.forEach(order => {
    const date = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyPerformance[monthKey]) {
      monthlyPerformance[monthKey] = { orders: 0, earnings: 0 };
    }
    monthlyPerformance[monthKey].orders++;
    monthlyPerformance[monthKey].earnings += order.marketingCommission;
  });

  const monthlyData = Object.entries(monthlyPerformance)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)
    .reverse();

  const kpiCards = [
    {
      title: 'Codes créés',
      value: totalCodes,
      subtitle: `${activeCodes} actifs`,
      icon: Tag,
      color: 'bg-yellow-500',
      trend: '+12%'
    },
    {
      title: 'Utilisations',
      value: totalUsage,
      subtitle: 'Total',
      icon: Users,
      color: 'bg-blue-500',
      trend: '+18%'
    },
    {
      title: 'Commandes',
      value: orders.length,
      subtitle: 'Générées',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      trend: '+25%'
    },
    {
      title: 'Taux de conversion',
      value: `${conversionRate}%`,
      subtitle: 'Usage → Commande',
      icon: Target,
      color: 'bg-green-500',
      trend: '+5%'
    },
    {
      title: 'Commission moy.',
      value: `${avgCommissionRate}%`,
      subtitle: 'Par code',
      icon: DollarSign,
      color: 'bg-emerald-500',
      trend: 'Stable'
    },
    {
      title: 'Panier moyen',
      value: `$${avgOrderValue}`,
      subtitle: 'Par commande',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      trend: '+8%'
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
                <BarChart3 className="text-blue-600" size={40} />
                Statistiques avancées
              </h1>
              <p className="text-gray-600">Analysez vos performances en détail</p>
            </div>
            <Link
              href="/dashboard/marketiste"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Retour
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpiCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`${card.color} p-2 rounded-lg`}>
                    <card.icon className="text-white" size={16} />
                  </div>
                  <span className="text-xs text-green-600 font-semibold">{card.trend}</span>
                </div>
                <h3 className="text-gray-600 text-xs mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LineChart className="text-blue-500" size={24} />
              Performance mensuelle
            </h2>

            <div className="space-y-6">
              {monthlyData.map(([month, data], index) => {
                const date = new Date(month + '-01');
                const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                const maxOrders = Math.max(...monthlyData.map(([, d]) => d.orders));
                const orderPercentage = (data.orders / maxOrders) * 100;

                return (
                  <div key={month}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{monthName}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">{data.orders} commandes</p>
                        <p className="text-xs text-green-600">${data.earnings.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${orderPercentage}%` }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Orders by Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="text-purple-500" size={24} />
              Répartition des commandes
            </h2>

            <div className="space-y-4">
              {Object.entries(ordersByStatus).map(([status, count], index) => {
                const percentage = orders.length > 0 ? (count / orders.length * 100).toFixed(1) : 0;
                const colors: { [key: string]: string } = {
                  pending: 'bg-yellow-500',
                  paid: 'bg-blue-500',
                  processing: 'bg-purple-500',
                  shipped: 'bg-indigo-500',
                  delivered: 'bg-green-500',
                  cancelled: 'bg-red-500',
                };

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[status]}`}></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-500 ml-2">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className={`${colors[status]} h-2 rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Top Performing Codes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="text-yellow-500" size={24} />
            Top 5 codes par performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topCodes.map((code, index) => (
              <div key={code.id} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>
                  <Award className="text-yellow-500" size={20} />
                </div>
                <p className="font-mono font-bold text-lg mb-3">{code.code}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gains:</span>
                    <span className="font-bold text-green-600">${code.totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilisations:</span>
                    <span className="font-semibold">{code.usageCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission:</span>
                    <span className="font-semibold">{(code.commissionRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="text-green-500" size={24} />
            Insights & Recommandations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Zap className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-blue-900">Meilleure période</h3>
              </div>
              <p className="text-sm text-blue-800 mb-2">
                Vos codes performent mieux en <strong>fin de mois</strong>
              </p>
              <p className="text-xs text-blue-600">
                Planifiez vos campagnes en conséquence
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Target className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-green-900">Objectif du mois</h3>
              </div>
              <p className="text-sm text-green-800 mb-2">
                Vous êtes à <strong>75%</strong> de votre objectif
              </p>
              <p className="text-xs text-green-600">
                Encore ${(totalEarnings * 0.33).toFixed(2)} pour l'atteindre
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-purple-900">Tendance</h3>
              </div>
              <p className="text-sm text-purple-800 mb-2">
                Croissance de <strong>+23%</strong> ce mois
              </p>
              <p className="text-xs text-purple-600">
                Continuez sur cette lancée !
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
