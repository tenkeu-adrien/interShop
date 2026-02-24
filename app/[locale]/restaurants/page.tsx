'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Loader2 } from 'lucide-react';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useCategoryStore } from '@/store/categoryStore';
import { useGeolocationStore } from '@/store/geolocationStore';
import { getProductsByCategory } from '@/lib/firebase/products';
import { Product } from '@/types';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { filters, setFilters } = useCategoryStore();
  const { userLocation, requestLocation } = useGeolocationStore();

  useEffect(() => {
    loadRestaurants();
  }, [filters, userLocation]);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await getProductsByCategory('restaurant', {
        city: filters.city,
        priceRange: filters.priceRange,
        features: filters.features,
        userLocation: userLocation || undefined,
        maxDistance: filters.distance,
      });
      setRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNearMe = async () => {
    await requestLocation();
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurants</h1>
          <p className="text-gray-600">Découvrez les meilleurs restaurants près de chez vous</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un restaurant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleNearMe}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <MapPin size={20} />
              Près de moi
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Filter size={20} />
              Filtres
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <input
                  type="text"
                  placeholder="Entrez une ville"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gamme de prix</label>
                <select
                  value={filters.priceRange || ''}
                  onChange={(e) => setFilters({ priceRange: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tous</option>
                  <option value="€">€ - Économique</option>
                  <option value="€€">€€ - Modéré</option>
                  <option value="€€€">€€€ - Cher</option>
                  <option value="€€€€">€€€€ - Très cher</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Distance max</label>
                <select
                  value={filters.distance || ''}
                  onChange={(e) => setFilters({ distance: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Toutes</option>
                  <option value="1">1 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km+</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun restaurant trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
