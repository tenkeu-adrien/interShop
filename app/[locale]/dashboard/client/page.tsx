'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  ShoppingBag, Heart, MessageSquare, MapPin, Bell,
  Package, Clock, CheckCircle, XCircle, ChevronRight,
  User, Settings, Wallet, Star
} from 'lucide-react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order } from '@/types';

function ClientDashboardContent() {
  const { user } = useAuthStore();
  const t = useTranslations('client');
  const tCommon = useTranslations('common');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) loadRecentOrders();
  }, [user]);

  const loadRecentOrders = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'orders'),
        where('clientId', '==', user.id),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      setRecentOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      case 'shipped': return <Package size={16} className="text-blue-500" />;
      default: return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 rounded-2xl p-6 mb-8 text-gray-900">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-30 rounded-full p-3">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('welcome')}, {user?.displayName}</h1>
              <p className="text-gray-800 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/orders" className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
            <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors">
              <ShoppingBag className="text-orange-600" size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700">{t('my_orders')}</span>
          </Link>

          <Link href="/wishlist" className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
            <div className="bg-red-100 p-3 rounded-full group-hover:bg-red-200 transition-colors">
              <Heart className="text-red-500" size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700">{t('wishlist')}</span>
          </Link>

          <Link href="/chat" className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
              <MessageSquare className="text-blue-500" size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700">{t('messages')}</span>
          </Link>

          <Link href="/wallet" className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group">
            <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
              <Wallet className="text-green-600" size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700">{t('wallet')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="text-orange-500" size={22} />
                {t('recent_orders')}
              </h2>
              <Link href="/orders" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                {tCommon('view_all')} <ChevronRight size={16} />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')} · {order.products.length} {t('items')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ShoppingBag className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">{t('no_orders')}</p>
                <Link href="/" className="mt-3 inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">
                  {t('start_shopping')}
                </Link>
              </div>
            )}
          </div>

          {/* Account Links */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="text-gray-500" size={22} />
              {t('my_account')}
            </h2>
            <div className="space-y-2">
              {[
                { href: '/profile', icon: User, label: t('profile'), color: 'text-blue-500' },
                { href: '/orders', icon: ShoppingBag, label: t('my_orders'), color: 'text-orange-500' },
                { href: '/wishlist', icon: Heart, label: t('wishlist'), color: 'text-red-500' },
                { href: '/wallet', icon: Wallet, label: t('wallet'), color: 'text-green-600' },
                { href: '/chat', icon: MessageSquare, label: t('messages'), color: 'text-blue-500' },
                { href: '/notifications', icon: Bell, label: t('notifications'), color: 'text-purple-500' },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={color} />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['client', 'admin']}>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}
