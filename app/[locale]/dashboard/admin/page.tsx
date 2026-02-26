'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  UserCheck,
  Store,
  Tag,
  AlertCircle,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Heart,
  MessageSquare
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product, Order, User as UserType } from '@/types';
import Link from 'next/link';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalFournisseurs: number;
  totalMarketistes: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalClients: 0,
    totalFournisseurs: 0,
    totalMarketistes: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // if (!loading && (!user || user.role !== 'admin')) {
    //   router.push('/dashboard');
    //   return;
    // }

    if (user && user.role !== 'admin') {
      loadDashboardData();
    }
  }, [user, loading, router]);

  const loadDashboardData = async () => {
    setLoadingStats(true);
    try {
      // Charger les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserType[];
      
      const clients = users.filter(u => u.role === 'client');
      const fournisseurs = users.filter(u => u.role === 'fournisseur');
      const marketistes = users.filter(u => u.role === 'marketiste');

      // Charger les produits
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      const activeProducts = products.filter(p => p.isActive);

      // Charger les commandes
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      const pendingOrders = orders.filter(o => o.status === 'pending');
      
      // Calculer le revenu total
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      
      // Calculer le revenu du mois en cours
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyOrders = orders.filter(o => {
        const orderDate = o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt);
        return orderDate >= firstDayOfMonth;
      });
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);

      // Charger les commandes récentes
      const recentOrdersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
      const recentOrdersData = recentOrdersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Order[];

      // Charger les produits les plus vendus
      const topProductsQuery = query(
        collection(db, 'products'),
        orderBy('sales', 'desc'),
        limit(5)
      );
      const topProductsSnapshot = await getDocs(topProductsQuery);
      const topProductsData = topProductsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Product[];

      setStats({
        totalUsers: users.length,
        totalClients: clients.length,
        totalFournisseurs: fournisseurs.length,
        totalMarketistes: marketistes.length,
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        totalRevenue,
        monthlyRevenue,
      });

      setRecentOrders(recentOrdersData);
      setTopProducts(topProductsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

//   if (!user || user.role !== 'admin') {
//     return null;
//   }

  const statCards = [
    {
      title: tAdmin('total_users'),
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      isPositive: true,
      link: '/dashboard/admin/users'
    },
    {
      title: tAdmin('clients'),
      value: stats.totalClients,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+8%',
      isPositive: true,
      link: '/dashboard/admin/users?role=client'
    },
    {
      title: tAdmin('suppliers'),
      value: stats.totalFournisseurs,
      icon: Store,
      color: 'bg-purple-500',
      change: '+5%',
      isPositive: true,
      link: '/dashboard/admin/users?role=fournisseur'
    },
    {
      title: tAdmin('marketers'),
      value: stats.totalMarketistes,
      icon: Tag,
      color: 'bg-yellow-500',
      change: '+15%',
      isPositive: true,
      link: '/dashboard/admin/users?role=marketiste'
    },
    {
      title: tAdmin('total_products'),
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-indigo-500',
      change: `${stats.activeProducts} ${tAdmin('active_products')}`,
      isPositive: true,
      link: '/dashboard/admin/products'
    },
    {
      title: tAdmin('total_orders'),
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      change: `${stats.pendingOrders} ${tAdmin('pending')}`,
      isPositive: stats.pendingOrders === 0,
      link: '/dashboard/admin/orders'
    },
    {
      title: tAdmin('total_revenue'),
      value: `${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-600',
      change: '+23%',
      isPositive: true,
      link: '/dashboard/admin/revenue'
    },
    {
      title: tAdmin('monthly_revenue'),
      value: `${stats.monthlyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: '+18%',
      isPositive: true,
      link: '/dashboard/admin/revenue'
    },
  ];
      title: 'Clients',
      value: stats.totalClients,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+8%',
      isPositive: true,
      link: '/dashboard/admin/users?role=client'
    },
    {
      title: 'Fournisseurs',
      value: stats.totalFournisseurs,
      icon: Store,
      color: 'bg-purple-500',
      change: '+5%',
      isPositive: true,
      link: '/dashboard/admin/users?role=fournisseur'
    },
    {
      title: 'Marketistes',
      value: stats.totalMarketistes,
      icon: Tag,
      color: 'bg-yellow-500',
      change: '+15%',
      isPositive: true,
      link: '/dashboard/admin/users?role=marketiste'
    },
    {
      title: 'Produits totaux',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-indigo-500',
      change: `${stats.activeProducts} actifs`,
      isPositive: true,
      link: '/dashboard/admin/products'
    },
    {
      title: 'Commandes totales',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      change: `${stats.pendingOrders} en attente`,
      isPositive: stats.pendingOrders === 0,
      link: '/dashboard/admin/orders'
    },
    {
      title: 'Revenu total',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-600',
      change: '+23%',
      isPositive: true,
      link: '/dashboard/admin/revenue'
    },
    {
      title: 'Revenu mensuel',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: '+18%',
      isPositive: true,
      link: '/dashboard/admin/revenue'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{tAdmin('dashboard_title')}</h1>
          <p className="text-gray-600">{tAdmin('dashboard_subtitle')}</p>
        </div>

        {/* Stats Grid - Compact Single Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={card.link}
                className="bg-white rounded-lg shadow-md p-3 hover:shadow-xl transition-all transform hover:scale-105 block"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`${card.color} p-2 rounded-lg`}>
                    <card.icon className="text-white" size={16} />
                  </div>
                  {card.isPositive ? (
                    <ArrowUpRight className="text-green-500" size={14} />
                  ) : (
                    <ArrowDownRight className="text-red-500" size={14} />
                  )}
                </div>
                <h3 className="text-gray-600 text-xs mb-1">{card.title}</h3>
                <p className="text-xl font-bold text-gray-900 mb-1">{card.value}</p>
                <p className={`text-xs ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Commandes récentes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="text-orange-500" size={24} />
                {tAdmin('recent_orders')}
              </h2>
              <Link 
                href="/dashboard/admin/orders"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {tAdmin('view_all')}
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.products.length} {tAdmin('products_count')}
                      </p>
                    </div>
                    <div className="text-right">
                      <PriceDisplay 
                        priceUSD={order.total}
                        className="font-bold text-green-600"
                      />
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">{tAdmin('no_recent_orders')}</p>
              )}
            </div>
          </motion.div>

          {/* Produits les plus vendus */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="text-purple-500" size={24} />
                {tAdmin('top_products')}
              </h2>
              <Link 
                href="/dashboard/admin/products"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {tAdmin('view_all')}
              </Link>
            </div>

            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} {tAdmin('sales')}</p>
                    </div>
                    <PriceDisplay 
                      priceUSD={product.prices[0].price}
                      className="font-bold text-green-600"
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">{tAdmin('no_products_found')}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="text-green-500" size={24} />
            {tAdmin('quick_actions')}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/dashboard/admin/users"
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center group"
            >
              <Users className="mx-auto mb-1 text-gray-600 group-hover:text-green-600" size={24} />
              <p className="font-semibold text-gray-900 text-sm">{tAdmin('users')}</p>
            </Link>

            <Link
              href="/dashboard/admin/products"
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
            >
              <Package className="mx-auto mb-1 text-gray-600 group-hover:text-purple-600" size={24} />
              <p className="font-semibold text-gray-900 text-sm">{tCommon('products')}</p>
            </Link>

            <Link
              href="/dashboard/admin/orders"
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-center group"
            >
              <ShoppingCart className="mx-auto mb-1 text-gray-600 group-hover:text-orange-600" size={24} />
              <p className="font-semibold text-gray-900 text-sm">{tCommon('orders')}</p>
            </Link>

            <Link
              href="/dashboard/admin/licenses"
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <Shield className="mx-auto mb-1 text-gray-600 group-hover:text-blue-600" size={24} />
              <p className="font-semibold text-gray-900 text-sm">{tAdmin('licenses')}</p>
            </Link>
            
            <Link
              href="/dashboard/admin/verify-profiles"
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all text-center group"
            >
              <Heart className="mx-auto mb-1 text-gray-600 group-hover:text-pink-600" size={24} />
              <p className="font-semibold text-gray-900 text-sm">{tAdmin('profiles')}</p>
            </Link>
            
            <Link
              href="/dashboard/admin/contact-requests"
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center group"
            >
              <MessageSquare className="mx-auto mb-1 text-gray-600 group-hover:text-indigo-600" size={24} />
              <p className="font-semibold text-gray-900 text-sm">{tAdmin('contact_messages')}</p>
            </Link>
            
            <Link
              href="/dashboard/admin/exchange-rates"
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all text-center group"
            >
              <DollarSign className="mx-auto mb-1 text-gray-600 group-hover:text-yellow-600" size={24} />
              <p className="font-semibold text-gray-900 text-sm">{tAdmin('exchange_rates')}</p>
            </Link>
            
            <Link
              href="/dashboard/admin/payment-methods"
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center group"
            >
              <DollarSign className="mx-auto mb-1 text-gray-600 group-hover:text-emerald-600" size={24} />
              <p className="font-semibold text-gray-900 text-sm">{tAdmin('payment_methods')}</p>
            </Link>
            
            <Link
              href="/dashboard/admin/wallet-transactions"
              className="p-3 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-center group"
            >
              <ShoppingCart className="mx-auto mb-1 text-gray-600 group-hover:text-teal-600" size={24} />
              <p className="font-semibold text-gray-900 text-sm">{tAdmin('wallet_transactions')}</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
