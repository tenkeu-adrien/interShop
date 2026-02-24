'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useProductsStore } from '@/store/productsStore';
import { Hotel, Plus, Search, Edit, Trash2, Eye, MapPin, Star, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';

function HotelsListContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { products, loading, fetchProducts, deleteProductFromStore } = useProductsStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchProducts(user.id);
    }
  }, [user, fetchProducts]);

  // Filtrer uniquement les hôtels
  const hotels = products.filter(p => p.serviceCategory === 'hotel');
  
  const filteredHotels = hotels.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.location?.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet hôtel ?')) return;
    
    try {
      await deleteProductFromStore(id);
      toast.success('Hôtel supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
            <div className="bg-purple-100 p-3 rounded-full">
              <Hotel className="text-purple-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Hôtels</h1>
              <p className="text-gray-600 mt-1">{hotels.length} hôtel(s)</p>
            </div>
          </div>
          <Link
            href="/dashboard/fournisseur/add-listing"
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus size={20} />
            Ajouter un hôtel
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
              placeholder="Rechercher un hôtel..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Hotels Grid */}
        {filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    {Array.from({ length: hotel.hotelData?.starRating || 0 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-white" />
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{hotel.name}</h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="text-sm font-semibold">{hotel.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">({hotel.reviewCount})</span>
                  </div>

                  {hotel.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{hotel.location.city}</span>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-3">
                    {hotel.hotelData?.roomTypes.length || 0} type(s) de chambre
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/hotels/${hotel.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      <Eye size={16} />
                      Voir
                    </Link>
                    <button
                      onClick={() => handleDelete(hotel.id!)}
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
            <Hotel className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun hôtel</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Aucun hôtel ne correspond à votre recherche' : 'Commencez par ajouter votre premier hôtel'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/fournisseur/add-listing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                <Plus size={20} />
                Ajouter un hôtel
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HotelsListPage() {
  return (
    <ProtectedRoute allowedRoles={['fournisseur']}>
      <HotelsListContent />
    </ProtectedRoute>
  );
}
