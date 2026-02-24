'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useProductsStore } from '@/store/productsStore';
import { UtensilsCrossed, Plus, Search, Edit, Trash2, Eye, MapPin, Star, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';

function RestaurantsListContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { products, loading, fetchProducts, deleteProductFromStore } = useProductsStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchProducts(user.id);
    }
  }, [user, fetchProducts]);

  // Filtrer uniquement les restaurants
  const restaurants = products.filter(p => p.serviceCategory === 'restaurant');
  
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.location?.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ?')) return;
    
    try {
      await deleteProductFromStore(id);
      toast.success('Restaurant supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading && restaurants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <UtensilsCrossed className="text-orange-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Restaurants</h1>
              <p className="text-gray-600 mt-1">{restaurants.length} restaurant(s)</p>
            </div>
          </div>
          <Link
            href="/dashboard/fournisseur/add-listing"
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
            Ajouter un restaurant
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un restaurant..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Restaurants Grid */}
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={restaurant.images[0]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {restaurant.restaurantData?.priceRange}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{restaurant.name}</h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="text-sm font-semibold">{restaurant.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">({restaurant.reviewCount})</span>
                  </div>

                  {restaurant.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{restaurant.location.city}</span>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {restaurant.restaurantData?.cuisineType.join(', ')}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/restaurants/${restaurant.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      <Eye size={16} />
                      Voir
                    </Link>
                    <button
                      onClick={() => handleDelete(restaurant.id!)}
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
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <UtensilsCrossed className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun restaurant</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Aucun restaurant ne correspond à votre recherche' : 'Commencez par ajouter votre premier restaurant'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/fournisseur/add-listing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Plus size={20} />
                Ajouter un restaurant
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RestaurantsListPage() {
  return (
    <ProtectedRoute allowedRoles={['fournisseur']}>
      <RestaurantsListContent />
    </ProtectedRoute>
  );
}
