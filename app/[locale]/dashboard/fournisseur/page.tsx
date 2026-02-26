'use client';

import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus, UtensilsCrossed, Hotel, Heart, Shield } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

function FournisseurDashboardContent() {
  const { user } = useAuthStore();
  const tFournisseur = useTranslations('fournisseur');
  const tCommon = useTranslations('common');
  const tDashboard = useTranslations('dashboard');
  
  const [stats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{tFournisseur('dashboard_title')}</h1>
          <p className="text-gray-600 mt-2">{tDashboard('welcome')}, {user?.displayName}</p>
        </div>
        <Link
          href="/dashboard/fournisseur/products/new"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
        >
          {tFournisseur('add_product')}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">{tDashboard('products')}</h3>
            <Package className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
          <p className="text-sm text-gray-500 mt-2">{tFournisseur('total_products')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">{tDashboard('orders')}</h3>
            <ShoppingBag className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.pendingOrders} {tFournisseur('pending_orders')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">{tFournisseur('revenue')}</h3>
            <DollarSign className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">{tFournisseur('this_month')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">{tCommon('view_all')}</h3>
            <TrendingUp className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">+12%</p>
          <p className="text-sm text-gray-500 mt-2">vs {tFournisseur('this_month')}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">{tFournisseur('my_products')}</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/fournisseur/products"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>{tFournisseur('manage_your_products')}</span>
              <Package size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/dashboard/fournisseur/products/new"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>{tFournisseur('add_product')}</span>
              <Plus size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/dashboard/fournisseur/restaurants"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-orange-50 transition-colors text-orange-600"
            >
              <span>{tFournisseur('restaurants')}</span>
              <UtensilsCrossed size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/hotels"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition-colors text-purple-600"
            >
              <span>{tFournisseur('hotels')}</span>
              <Hotel size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/dating-profiles"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-pink-50 transition-colors text-pink-600"
            >
              <span>{tFournisseur('dating_profiles')}</span>
              <Heart size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/add-listing"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-orange-50 transition-colors text-orange-600"
            >
              <span>{tFournisseur('add_hotel')} / {tFournisseur('add_restaurant')}</span>
              <Plus size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/add-dating-profile"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-pink-50 transition-colors text-pink-600"
            >
              <span>{tFournisseur('add_dating_profile')}</span>
              <Plus size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/licenses"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-green-50 transition-colors text-green-600"
            >
              <span>{tFournisseur('my_licenses')}</span>
              <Shield size={20} />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">{tDashboard('orders')}</h2>
          <div className="text-gray-500 text-center py-8">
            {tDashboard('no_activity')}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">{tFournisseur('my_stats')}</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {tCommon('loading')}
        </div>
      </div>
    </div>
  );
}

export default function FournisseurDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['fournisseur']}>
      <FournisseurDashboardContent />
    </ProtectedRoute>
  );
}
