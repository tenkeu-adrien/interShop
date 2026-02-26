'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import { 
  Tag, 
  DollarSign, 
  TrendingUp, 
  Users,
  ShoppingCart,
  BarChart3,
  Plus,
  Copy,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Award,
  Target
} from 'lucide-react';
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MarketingCode, Order } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

export default function MarketisteDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const tMarketiste = useTranslations('marketiste');
  const tCommon = useTranslations('common');
  
  const [codes, setCodes] = useState<MarketingCode[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    commissionRate: 10,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
  });

  useEffect(() => {
    // if (!loading && (!user || user.role !== 'marketiste')) {
    //   router.push('/dashboard');
    //   return;
    // }

    if (user && user.role !== 'marketiste') {
      loadDashboardData();
    }
  }, [user, loading, router]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoadingData(true);
    try {
      // Charger les codes marketing
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

      // Charger les commandes avec mes codes
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
      console.error('Error loading dashboard data:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateCode = async () => {
    if (!user || !newCode.code) {
      toast.error(tCommon('error'));
      return;
    }

    try {
      const codeData: Omit<MarketingCode, 'id'> = {
        code: newCode.code.toUpperCase(),
        marketisteId: user.id,
        commissionRate: newCode.commissionRate / 100,
        validFrom: new Date(newCode.validFrom),
        validUntil: newCode.validUntil ? new Date(newCode.validUntil) : undefined,
        isActive: true,
        usageCount: 0,
        totalEarnings: 0,
      };

      await addDoc(collection(db, 'marketingCodes'), codeData);
      toast.success(tMarketiste('code_created'));
      setShowCreateModal(false);
      setNewCode({
        code: '',
        commissionRate: 10,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error creating code:', error);
      toast.error(tMarketiste('error_creating'));
    }
  };

  const handleToggleCode = async (codeId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'marketingCodes', codeId), {
        isActive: !isActive
      });
      toast.success(isActive ? tMarketiste('code_deleted') : tMarketiste('code_created'));
      loadDashboardData();
    } catch (error) {
      console.error('Error toggling code:', error);
      toast.error(tMarketiste('error_updating'));
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm(tMarketiste('delete_confirmation'))) return;
    
    try {
      await deleteDoc(doc(db, 'marketingCodes', codeId));
      toast.success(tMarketiste('code_deleted'));
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting code:', error);
      toast.error(tMarketiste('error_deleting'));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(tCommon('success'));
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // if (!user || user.role !== 'marketiste') {
  //   return null;
  // }

  // Calculs
  const totalEarnings = orders.reduce((sum, order) => sum + order.marketingCommission, 0);
  const pendingEarnings = orders
    .filter(o => o.status === 'pending' || o.status === 'paid')
    .reduce((sum, order) => sum + order.marketingCommission, 0);
  const paidEarnings = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, order) => sum + order.marketingCommission, 0);
  const totalOrders = orders.length;
  const activeCodes = codes.filter(c => c.isActive).length;
  const totalUsage = codes.reduce((sum, code) => sum + code.usageCount, 0);

  // Meilleurs codes
  const topCodes = [...codes]
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 5);

  // Commandes récentes
  const recentOrders = [...orders]
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

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
      title: 'Gains en attente',
      value: `$${pendingEarnings.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: `${pendingEarnings > 0 ? 'En cours' : 'Aucun'}`,
      isPositive: pendingEarnings > 0,
    },
    {
      title: 'Gains payés',
      value: `$${paidEarnings.toFixed(2)}`,
      icon: CheckCircle,
      color: 'bg-blue-500',
      change: '+15%',
      isPositive: true,
    },
    {
      title: 'Commandes',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: `${totalUsage} utilisations`,
      isPositive: true,
    },
    {
      title: 'Codes actifs',
      value: activeCodes,
      icon: Tag,
      color: 'bg-orange-500',
      change: `${codes.length} total`,
      isPositive: true,
    },
    {
      title: 'Taux moyen',
      value: `${codes.length > 0 ? (codes.reduce((sum, c) => sum + c.commissionRate, 0) / codes.length * 100).toFixed(1) : 0}%`,
      icon: Percent,
      color: 'bg-indigo-500',
      change: 'Commission',
      isPositive: true,
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
                <Tag className="text-yellow-600" size={40} />
                {tMarketiste('dashboard_title')}
              </h1>
              <p className="text-gray-600">{tMarketiste('dashboard_subtitle')}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              {tMarketiste('create_code')}
            </button>
          </div>

          {/* Stats Grid - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-3 hover:shadow-xl transition-all"
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
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Mes codes marketing */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Tag className="text-yellow-500" size={24} />
                {tMarketiste('my_codes')}
              </h2>
              <Link 
                href="/dashboard/marketiste/codes"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {tCommon('view_all')}
              </Link>
            </div>

            <div className="space-y-3">
              {codes.length > 0 ? (
                codes.slice(0, 5).map((code) => (
                  <div key={code.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg font-mono font-bold">
                          {code.code}
                        </div>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copier"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCode(code.id, code.isActive)}
                          className={`p-1 rounded ${
                            code.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={code.isActive ? 'Actif' : 'Inactif'}
                        >
                          {code.isActive ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">{tMarketiste('commission')}</p>
                        <p className="font-semibold">{(code.commissionRate * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">{tMarketiste('uses')}</p>
                        <p className="font-semibold">{code.usageCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">{tMarketiste('earnings')}</p>
                        <p className="font-semibold text-green-600">${code.totalEarnings.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Tag className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="text-gray-500 mb-4">{tMarketiste('no_codes')}</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {tMarketiste('create_first_code')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Commandes récentes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="text-purple-500" size={24} />
                {tMarketiste('order_history')}
              </h2>
              <Link 
                href="/dashboard/marketiste/orders"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {tCommon('view_all')}
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-600">
                          {tMarketiste('code')}: <span className="font-mono font-semibold">{order.marketingCode}</span>
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">{tMarketiste('amount')}</p>
                        <PriceDisplay 
                          priceUSD={order.total}
                          className="font-semibold"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-xs">{tMarketiste('commission')}</p>
                        <PriceDisplay 
                          priceUSD={order.marketingCommission}
                          className="font-bold text-green-600"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="text-gray-500">{tCommon('loading')}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Top Codes Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="text-yellow-500" size={24} />
            {tMarketiste('performance_overview')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topCodes.length > 0 ? (
              topCodes.map((code, index) => (
                <div key={code.id} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      #{index + 1}
                    </div>
                    <Award className="text-yellow-500" size={20} />
                  </div>
                  <p className="font-mono font-bold text-lg mb-2">{code.code}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{tMarketiste('earnings')}:</span>
                      <span className="font-bold text-green-600">${code.totalEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{tMarketiste('uses')}:</span>
                      <span className="font-semibold">{code.usageCount}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center py-8 text-gray-500">
                {tMarketiste('create_first_code')}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="text-green-500" size={24} />
            {tCommon('settings')}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/marketiste/codes"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all text-center group"
            >
              <Tag className="mx-auto mb-2 text-gray-600 group-hover:text-yellow-600" size={32} />
              <p className="font-semibold text-gray-900">{tMarketiste('code_management')}</p>
            </Link>

            <Link
              href="/dashboard/marketiste/orders"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
            >
              <ShoppingCart className="mx-auto mb-2 text-gray-600 group-hover:text-purple-600" size={32} />
              <p className="font-semibold text-gray-900">{tMarketiste('my_orders')}</p>
            </Link>

            <Link
              href="/dashboard/marketiste/earnings"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center group"
            >
              <DollarSign className="mx-auto mb-2 text-gray-600 group-hover:text-green-600" size={32} />
              <p className="font-semibold text-gray-900">{tMarketiste('my_earnings')}</p>
            </Link>

            <Link
              href="/dashboard/marketiste/analytics"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
            >
              <BarChart3 className="mx-auto mb-2 text-gray-600 group-hover:text-blue-600" size={32} />
              <p className="font-semibold text-gray-900">{tMarketiste('analytics')}</p>
            </Link>
          </div>
        </motion.div>

        {/* Create Code Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{tMarketiste('new_code')}</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tMarketiste('code')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                      placeholder="PROMO2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tMarketiste('commission_rate')} (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newCode.commissionRate}
                      onChange={(e) => setNewCode({ ...newCode, commissionRate: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tMarketiste('date')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newCode.validFrom}
                      onChange={(e) => setNewCode({ ...newCode, validFrom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tMarketiste('expiry_date')}
                    </label>
                    <input
                      type="date"
                      value={newCode.validUntil}
                      onChange={(e) => setNewCode({ ...newCode, validUntil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCreateCode}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      {tMarketiste('create_code')}
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      {tCommon('cancel')}
                    </button>
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
