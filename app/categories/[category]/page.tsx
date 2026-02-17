'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';
import { searchProducts } from '@/lib/firebase/products';
import { Product, SearchFilters } from '@/types';
import { Filter, ChevronLeft, Grid, List } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<SearchFilters>({
    category: decodeURIComponent(params.category as string).replace(/-/g, ' ')
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { products: data } = await searchProducts(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryName = decodeURIComponent(params.category as string)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/categories')}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4"
          >
            <ChevronLeft size={20} />
            Retour aux catégories
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
              <p className="text-gray-600">{products.length} produits trouvés</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'
                }`}
              >
                <Grid size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'
                }`}
              >
                <List size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} />
                <h2 className="font-bold text-lg">Filtres</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Prix minimum</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prix maximum</label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notation minimum</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onChange={(e) =>
                      setFilters({ ...filters, minRating: Number(e.target.value) })
                    }
                  >
                    <option value="">Toutes</option>
                    <option value="4">4+ étoiles</option>
                    <option value="3">3+ étoiles</option>
                    <option value="2">2+ étoiles</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      onChange={(e) =>
                        setFilters({ ...filters, verifiedOnly: e.target.checked })
                      }
                    />
                    <span className="text-sm">Fournisseurs vérifiés uniquement</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      onChange={(e) =>
                        setFilters({ ...filters, fastDelivery: e.target.checked })
                      }
                    />
                    <span className="text-sm">Livraison rapide</span>
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilters({ category: filters.category })}
                  className="w-full py-2 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50"
                >
                  Réinitialiser les filtres
                </motion.button>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid/List */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as SearchFilters['sortBy'],
                  })
                }
              >
                <option value="relevance">Pertinence</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="newest">Plus récents</option>
                <option value="popular">Plus populaires</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
                />
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white rounded-lg shadow"
              >
                <p className="text-2xl text-gray-500 mb-4">Aucun produit trouvé</p>
                <p className="text-gray-400">Essayez de modifier vos filtres</p>
              </motion.div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {products.map((product) => (
                  <motion.div key={product.id} variants={item}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
