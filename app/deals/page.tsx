'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, TrendingDown, Clock, Star, Search, Filter } from 'lucide-react';
import  ProductCard  from '@/components/products/ProductCard';
import { BackButton } from '@/components/ui/BackButton';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'discount' | 'price' | 'popular'>('discount');
  
  useEffect(() => {
    fetchDeals();
  }, [sortBy]);
  
  const fetchDeals = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      
      // Récupérer tous les produits actifs
      const q = query(
        productsRef,
        where('isActive', '==', true),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const allProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      // Filtrer les produits avec réductions (simulé avec un prix réduit)
      // Dans une vraie app, vous auriez un champ "discount" ou "originalPrice"
      const dealsProducts = allProducts.filter(p => {
        // Simuler des deals: produits avec stock > 50 ou ventes > 100
        return p.stock > 50 || (p.sales && p.sales > 100);
      });
      
      // Trier selon le critère
      let sorted = [...dealsProducts];
      if (sortBy === 'price') {
        sorted.sort((a, b) => a.prices[0].price - b.prices[0].price);
      } else if (sortBy === 'popular') {
        sorted.sort((a, b) => (b.sales || 0) - (a.sales || 0));
      } else {
        // Trier par "discount" (simulé avec le stock)
        sorted.sort((a, b) => b.stock - a.stock);
      }
      
      setProducts(sorted);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton href="/" />
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="text-red-500" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">Offres Spéciales</h1>
          </div>
          <p className="text-gray-600">Découvrez nos meilleures offres et promotions</p>
        </div>
        
        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-8 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">🔥 Ventes Flash</h2>
              <p className="text-lg opacity-90">Jusqu'à 70% de réduction sur une sélection de produits</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <Clock size={24} />
              <div>
                <div className="text-sm opacity-80">Se termine dans</div>
                <div className="text-2xl font-bold">23:45:12</div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Réduction moyenne</p>
                <p className="text-2xl font-bold text-gray-900">45%</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Tag className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Offres disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Star className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">4.5/5</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher une offre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="discount">Meilleure réduction</option>
                <option value="price">Prix croissant</option>
                <option value="popular">Plus populaires</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}
        
        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">Aucune offre trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
