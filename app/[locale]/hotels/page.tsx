'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Loader2, Star } from 'lucide-react';
import { HotelCard } from '@/components/HotelCard';
import { useCategoryStore } from '@/store/categoryStore';
import { useGeolocationStore } from '@/store/geolocationStore';
import { getProductsByCategory } from '@/lib/firebase/products';
import { Product } from '@/types';
import { useTranslations } from 'next-intl';

export default function HotelsPage() {
  const t = useTranslations();
  const [hotels, setHotels] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const { filters, setFilters } = useCategoryStore();
  const { userLocation, requestLocation } = useGeolocationStore();

  useEffect(() => {
    loadHotels();
  }, [filters, userLocation]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const data = await getProductsByCategory('hotel', {
        city: filters.city,
        features: filters.features,
        userLocation: userLocation || undefined,
        maxDistance: filters.distance,
      });
      setHotels(data);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNearMe = async () => {
    await requestLocation();
  };

  const filteredHotels = hotels.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStars = !starFilter || h.hotelData?.starRating === starFilter;
    return matchesSearch && matchesStars;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('hotels.title')}</h1>
          <p className="text-gray-600">{t('hotels.subtitle')}</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('hotels.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleNearMe}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <MapPin size={20} />
              {t('hotels.near_me')}
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Filter size={20} />
              {t('hotels.filters')}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('hotels.enter_city')}</label>
                <input
                  type="text"
                  placeholder={t('hotels.enter_city')}
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('hotels.stars')}</label>
                <select
                  value={starFilter || ''}
                  onChange={(e) => setStarFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{t('hotels.all')}</option>
                  <option value="1">1 {t('hotels.star')}</option>
                  <option value="2">2 {t('hotels.stars')}</option>
                  <option value="3">3 {t('hotels.stars')}</option>
                  <option value="4">4 {t('hotels.stars')}</option>
                  <option value="5">5 {t('hotels.stars')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('hotels.max_distance')}</label>
                <select
                  value={filters.distance || ''}
                  onChange={(e) => setFilters({ distance: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{t('hotels.all')}</option>
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
            <Loader2 className="animate-spin text-purple-500" size={48} />
          </div>
        )}

        {/* Hotels Grid */}
        {!loading && filteredHotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel, index) => (
              <HotelCard key={hotel.id} hotel={hotel} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredHotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('hotels.no_hotels')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
