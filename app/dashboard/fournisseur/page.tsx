'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus, UtensilsCrossed, Hotel, Heart, Shield } from 'lucide-react';
import Link from 'next/link';

function FournisseurDashboardContent() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Fournisseur</h1>
          <p className="text-gray-600 mt-2">Bienvenue, {user?.displayName}</p>
        </div>
        <Link
          href="/dashboard/fournisseur/products/new"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
        >
          Ajouter un produit
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Produits</h3>
            <Package className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
          <p className="text-sm text-gray-500 mt-2">Total de produits actifs</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Commandes</h3>
            <ShoppingBag className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.pendingOrders} en attente
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Revenus</h3>
            <DollarSign className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">Ce mois</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Croissance</h3>
            <TrendingUp className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold">+12%</p>
          <p className="text-sm text-gray-500 mt-2">vs mois dernier</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/fournisseur/products"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>Gérer les produits e-commerce</span>
              <Package size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/dashboard/fournisseur/products/new"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>Ajouter un produit e-commerce</span>
              <Plus size={20} className="text-gray-400" />
            </Link>
            <Link
              href="/dashboard/fournisseur/restaurants"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-orange-50 transition-colors text-orange-600"
            >
              <span>Mes Restaurants</span>
              <UtensilsCrossed size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/hotels"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition-colors text-purple-600"
            >
              <span>Mes Hôtels</span>
              <Hotel size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/dating-profiles"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-pink-50 transition-colors text-pink-600"
            >
              <span>Mes Profils de Rencontre</span>
              <Heart size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/add-listing"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-orange-50 transition-colors text-orange-600"
            >
              <span>Ajouter Restaurant/Hôtel</span>
              <Plus size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/add-dating-profile"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-pink-50 transition-colors text-pink-600"
            >
              <span>Ajouter Profil Rencontre</span>
              <Plus size={20} />
            </Link>
            <Link
              href="/dashboard/fournisseur/licenses"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-green-50 transition-colors text-green-600"
            >
              <span>Gérer ma licence</span>
              <Shield size={20} />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Commandes récentes</h2>
          <div className="text-gray-500 text-center py-8">
            Aucune commande récente
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Performance des ventes</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Graphique des ventes (à implémenter)
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
