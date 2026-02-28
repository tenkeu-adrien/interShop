'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import { 
  Package, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  TrendingUp,
  Star,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  BarChart,
  AlertTriangle,
  Archive
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tProducts = useTranslations('products');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    // if (!loading && (!user || user.role !== 'admin')) {
    //   router.push('/dashboard');
    //   return;
    // }

    if (user && user.role !== 'admin') {
      loadProducts();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoadingProducts(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(p => p.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(p => !p.isActive);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        isActive: !isActive,
        updatedAt: new Date()
      });
      toast.success(isActive ? tProducts('product_deleted') : tProducts('product_created'));
      loadProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error(tCommon('error'));
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm(tProducts('delete_confirmation'))) return;
    
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success(tProducts('product_deleted'));
      loadProducts();
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(tCommon('error'));
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading || loadingProducts) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ChevronLeft size={20} />
              {tCommon('back')}
            </Link>
            <Skeleton className="h-12 w-96 mb-2" />
            <Skeleton className="h-6 w-64" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          
          <Skeleton className="h-32 rounded-lg mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // if (!user || user.role !== 'admin') {
  //   return null;
  // }

  const totalValue = products.reduce((sum, p) => sum + (p.prices[0]?.price || 0) * p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock < 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Package className="text-purple-600" size={40} />
                {tAdmin('product_management')}
              </h1>
              <p className="text-gray-600">{tAdmin('manage_your_products')}</p>
            </div>
            <Link
              href="/dashboard/admin"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              {tCommon('back')}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <Package size={14} /> Total
              </p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-green-600 text-sm flex items-center gap-1">
                <CheckCircle size={14} /> Actifs
              </p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
              <p className="text-red-600 text-sm flex items-center gap-1">
                <XCircle size={14} /> Inactifs
              </p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => !p.isActive).length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-yellow-600 text-sm flex items-center gap-1">
                <AlertTriangle size={14} /> Stock bas
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {lowStockProducts.length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <DollarSign size={14} /> Valeur
              </p>
              <p className="text-xl font-bold text-blue-600">
                ${totalValue.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {currentProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={product.images[0] || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.isActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Archive size={14} />
                      Inactif
                    </span>
                  </div>
                )}
                {product.stock < 10 && product.isActive && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Stock bas
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={14} />
                    <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-gray-500">({product.reviewCount})</span>
                  <span className="text-xs text-gray-500">• {product.sales} ventes</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <PriceDisplay 
                    priceUSD={product.prices[0]?.price || 0}
                    className="text-lg font-bold text-purple-600"
                  />
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(product)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 text-sm font-semibold"
                  >
                    <Eye size={16} />
                    Voir
                  </button>
                  <button
                    onClick={() => handleToggleActive(product.id!, product.isActive)}
                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-semibold ${
                      product.isActive 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {product.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    {product.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-md px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {indexOfFirstProduct + 1} à {Math.min(indexOfLastProduct, filteredProducts.length)} sur {filteredProducts.length} produits
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Précédent
              </button>
              <span className="px-4 py-1 bg-purple-100 text-purple-800 rounded-lg font-semibold">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Détails du produit</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Images */}
                  <div>
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.images.slice(1, 5).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${selectedProduct.name} ${idx + 2}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{selectedProduct.name}</h3>
                      <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Catégorie</p>
                        <p className="font-semibold">{selectedProduct.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Prix</p>
                        <PriceDisplay 
                          priceUSD={selectedProduct.prices[0]?.price || 0}
                          className="font-bold text-purple-600"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Stock</p>
                        <p className="font-semibold">{selectedProduct.stock} unités</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">MOQ</p>
                        <p className="font-semibold">{selectedProduct.moq} unités</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Note</p>
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400 fill-yellow-400" size={16} />
                          <span className="font-semibold">{selectedProduct.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({selectedProduct.reviewCount})</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ventes</p>
                        <p className="font-semibold">{selectedProduct.sales}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pays</p>
                        <p className="font-semibold">{selectedProduct.country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Livraison</p>
                        <p className="font-semibold">{selectedProduct.deliveryTime}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => handleToggleActive(selectedProduct.id!, selectedProduct.isActive)}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                          selectedProduct.isActive 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {selectedProduct.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedProduct.id!)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Supprimer
                      </button>
                    </div>
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
