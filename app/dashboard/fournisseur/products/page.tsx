'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useProductsStore } from '@/store/productsStore';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Loader,
  Grid3x3,
  List,
  Filter,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

type ViewMode = 'grid' | 'list';

function ProductsListContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { products, loading, fetchProducts, toggleProductStatus, deleteProductFromStore } = useProductsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubcategory, setFilterSubcategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProducts(user.id);
    }
  }, [user, fetchProducts]);

  // Extraire les catégories et sous-catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const subcategories = useMemo(() => {
    if (filterCategory === 'all') return [];
    const subcats = new Set(
      products
        .filter(p => p.category === filterCategory && p.subcategory)
        .map(p => p.subcategory!)
    );
    return Array.from(subcats).sort();
  }, [products, filterCategory]);

  // Filtrer les produits (exclure dating, restaurant, hotel)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Exclure les services (dating, restaurant, hotel) - afficher uniquement les produits e-commerce
      const isEcommerceProduct = !product.serviceCategory || 
                                 !['dating', 'restaurant', 'hotel'].includes(product.serviceCategory);
      
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.subcategory?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && product.isActive) ||
                           (filterStatus === 'inactive' && !product.isActive);
      
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      
      const matchesSubcategory = filterSubcategory === 'all' || 
                                 product.subcategory === filterSubcategory;
      
      return isEcommerceProduct && matchesSearch && matchesStatus && matchesCategory && matchesSubcategory;
    });
  }, [products, searchQuery, filterStatus, filterCategory, filterSubcategory]);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.isActive).length,
    inactive: products.filter(p => !p.isActive).length,
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
  }), [products]);

  const handleToggleStatus = async (productId: string) => {
    try {
      await toggleProductStatus(productId);
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    try {
      await deleteProductFromStore(productId);
      toast.success('Produit supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterCategory('all');
    setFilterSubcategory('all');
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes produits</h1>
            <p className="text-gray-600 mt-1">{stats.total} produit(s) au total</p>
          </div>
          <Link
            href="/dashboard/fournisseur/products/new"
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus size={20} />
            Ajouter un produit
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Package className="text-orange-500" size={32} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Actifs</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
              <Eye className="text-green-500" size={32} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Inactifs</p>
                <p className="text-3xl font-bold mt-1 text-gray-600">{stats.inactive}</p>
              </div>
              <EyeOff className="text-gray-500" size={32} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Vues totales</p>
                <p className="text-3xl font-bold mt-1">{stats.totalViews}</p>
              </div>
              <Eye className="text-blue-500" size={32} />
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    showFilters ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter size={20} />
                  Filtres
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t pt-4 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">Tous</option>
                      <option value="active">Actifs</option>
                      <option value="inactive">Inactifs</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setFilterSubcategory('all');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="all">Toutes les catégories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-catégorie
                    </label>
                    <select
                      value={filterSubcategory}
                      onChange={(e) => setFilterSubcategory(e.target.value)}
                      disabled={filterCategory === 'all' || subcategories.length === 0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="all">Toutes les sous-catégories</option>
                      {subcategories.map(subcat => (
                        <option key={subcat} value={subcat}>{subcat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reset Filters */}
                {(searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterSubcategory !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
                  >
                    <X size={16} />
                    Réinitialiser les filtres
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Commencez par ajouter votre premier produit'}
            </p>
            {!searchQuery && filterStatus === 'all' && filterCategory === 'all' && (
              <Link
                href="/dashboard/fournisseur/products/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Plus size={20} />
                Ajouter un produit
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {product.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    {product.stock === 0 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white">
                        Rupture
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 h-12">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Prix</p>
                      <p className="text-lg font-bold text-orange-600">
                        ${product.prices[0].price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="text-lg font-bold">{product.stock}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                    <div>MOQ: {product.moq}</div>
                    <div>Vues: {product.views || 0}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      <Eye size={16} />
                      Voir
                    </Link>
                    <Link
                      href={`/dashboard/fournisseur/products/${product.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                    >
                      <Edit size={16} />
                      Modifier
                    </Link>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleToggleStatus(product.id!)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                    >
                      {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      {product.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id!)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">
                          {product.category} {product.subcategory && `> ${product.subcategory}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        {product.stock === 0 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rupture de stock
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>

                    <div className="flex flex-wrap gap-6 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Prix: </span>
                        <span className="font-semibold text-orange-600">${product.prices[0].price}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">MOQ: </span>
                        <span className="font-semibold">{product.moq}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stock: </span>
                        <span className="font-semibold">{product.stock}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vues: </span>
                        <span className="font-semibold">{product.views || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ventes: </span>
                        <span className="font-semibold">{product.sales || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <Eye size={16} />
                        Voir
                      </Link>
                      <Link
                        href={`/dashboard/fournisseur/products/${product.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        <Edit size={16} />
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(product.id!)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        {product.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id!)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsListPage() {
  return (
    <ProtectedRoute allowedRoles={['fournisseur']}>
      <ProductsListContent />
    </ProtectedRoute>
  );
}
