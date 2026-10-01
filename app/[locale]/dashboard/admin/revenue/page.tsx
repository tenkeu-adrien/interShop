'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Package,
  Users,
} from 'lucide-react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order } from '@/types';
import { toDate } from '@/lib/utils/date';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
}

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  growthRate: number;
}

export default function RevenuePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    growthRate: 0,
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryRevenue[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [timeRange, setTimeRange] = useState<'month' | 'year' | 'all'>('month');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      loadRevenueData();
    }
  }, [user, loading, router, timeRange]);

  const loadRevenueData = async () => {
    setLoadingData(true);
    try {
      // Charger toutes les commandes
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const allOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      // Calculer les dates
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Filtrer selon la période
      let filteredOrders = allOrders;
      if (timeRange === 'month') {
        filteredOrders = allOrders.filter(o => {
          const orderDate = toDate(o.createdAt);
          return orderDate >= firstDayOfMonth;
        });
      } else if (timeRange === 'year') {
        filteredOrders = allOrders.filter(o => {
          const orderDate = toDate(o.createdAt);
          return orderDate >= firstDayOfYear;
        });
      }

      // Calculer les revenus par mois
      const monthlyRevenueMap = new Map<string, { revenue: number; orders: number }>();
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return date;
      }).reverse();

      last12Months.forEach(date => {
        const key = date.toISOString().slice(0, 7);
        monthlyRevenueMap.set(key, { revenue: 0, orders: 0 });
      });

      allOrders.forEach(order => {
        const orderDate = toDate(order.createdAt);
        const key = orderDate.toISOString().slice(0, 7);
        if (monthlyRevenueMap.has(key)) {
          const current = monthlyRevenueMap.get(key)!;
          current.revenue += order.total;
          current.orders += 1;
        }
      });

      const monthlyRevenueArray: MonthlyRevenue[] = Array.from(
        monthlyRevenueMap.entries()
      ).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders,
      }));

      setMonthlyData(monthlyRevenueArray);

      // Calculer les revenus par catégorie (simulé - à adapter selon votre structure)
      const categoryRevenueMap = new Map<string, number>();
      filteredOrders.forEach(order => {
        order.items?.forEach(item => {
          const category = item.category || 'Autre';
          categoryRevenueMap.set(
            category,
            (categoryRevenueMap.get(category) || 0) + (item.price * item.quantity)
          );
        });
      });

      const totalCategoryRevenue = Array.from(categoryRevenueMap.values()).reduce(
        (sum, val) => sum + val,
        0
      );

      const categoryRevenueArray: CategoryRevenue[] = Array.from(
        categoryRevenueMap.entries()
      )
        .map(([category, revenue]) => ({
          category,
          revenue,
          percentage: totalCategoryRevenue > 0 ? (revenue / totalCategoryRevenue) * 100 : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setCategoryData(categoryRevenueArray);

      // Calculer les statistiques
      const currentMonthOrders = allOrders.filter(o => {
        const orderDate = toDate(o.createdAt);
        return orderDate >= firstDayOfMonth;
      });

      const lastMonthOrders = allOrders.filter(o => {
        const orderDate = toDate(o.createdAt);
        return orderDate >= lastMonth && orderDate <= lastMonthEnd;
      });

      const currentYearOrders = allOrders.filter(o => {
        const orderDate = toDate(o.createdAt);
        return orderDate >= firstDayOfYear;
      });

      const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
      const monthlyRevenue = currentMonthOrders.reduce((sum, o) => sum + o.total, 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.total, 0);
      const yearlyRevenue = currentYearOrders.reduce((sum, o) => sum + o.total, 0);

      const growthRate =
        lastMonthRevenue > 0
          ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      setStats({
        totalRevenue,
        monthlyRevenue,
        yearlyRevenue,
        averageOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
        totalOrders: allOrders.length,
        completedOrders: allOrders.filter(o => o.status === 'delivered').length,
        pendingOrders: allOrders.filter(o => o.status === 'pending').length,
        cancelledOrders: allOrders.filter(o => o.status === 'cancelled').length,
        growthRate,
      });
    } catch (error) {
      console.error('Error loading revenue data:', error);
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

  if (!user || user.role !== 'admin') {
    return null;
  }

  // Données pour le graphique en ligne
  const lineChartData = {
    labels: monthlyData.map(d => {
      const date = new Date(d.month + '-01');
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenus',
        data: monthlyData.map(d => d.revenue),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Données pour le graphique en barres
  const barChartData = {
    labels: monthlyData.slice(-6).map(d => {
      const date = new Date(d.month + '-01');
      return date.toLocaleDateString('fr-FR', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Commandes',
        data: monthlyData.slice(-6).map(d => d.orders),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  // Données pour le graphique circulaire
  const pieChartData = {
    labels: categoryData.map(d => d.category),
    datasets: [
      {
        data: categoryData.map(d => d.revenue),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {tAdmin('revenue_analytics')}
            </h1>
            <p className="text-gray-600">{tAdmin('revenue_subtitle')}</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === 'month'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ce mois
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === 'year'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cette année
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              {stats.growthRate >= 0 ? (
                <ArrowUpRight className="text-green-500" size={20} />
              ) : (
                <ArrowDownRight className="text-red-500" size={20} />
              )}
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Revenus du mois</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              <PriceDisplay amount={stats.monthlyRevenue} />
            </p>
            <p
              className={`text-sm ${
                stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.growthRate >= 0 ? '+' : ''}
              {stats.growthRate.toFixed(1)}% vs mois dernier
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Revenus de l'année</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              <PriceDisplay amount={stats.yearlyRevenue} />
            </p>
            <p className="text-sm text-gray-500">
              {stats.completedOrders} commandes livrées
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ShoppingCart className="text-yellow-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Valeur moyenne commande</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              <PriceDisplay amount={stats.averageOrderValue} />
            </p>
            <p className="text-sm text-gray-500">
              {stats.totalOrders} commandes totales
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">Revenus totaux</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              <PriceDisplay amount={stats.totalRevenue} />
            </p>
            <p className="text-sm text-gray-500">Depuis le début</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={24} />
              Évolution des revenus (12 derniers mois)
            </h2>
            <div className="h-80">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={24} />
              Nombre de commandes (6 derniers mois)
            </h2>
            <div className="h-80">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        {/* Category Revenue & Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="text-purple-600" size={24} />
              Revenus par catégorie (Top 5)
            </h2>
            <div className="h-80">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="text-orange-600" size={24} />
              Statut des commandes
            </h2>
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Livrées</p>
                    <p className="text-sm text-gray-600">Commandes complétées</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedOrders}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Calendar className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">En attente</p>
                    <p className="text-sm text-gray-600">À traiter</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingOrders}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="text-red-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Annulées</p>
                    <p className="text-sm text-gray-600">Commandes annulées</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelledOrders}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
