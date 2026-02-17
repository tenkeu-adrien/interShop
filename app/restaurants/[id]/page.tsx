'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import { 
  UtensilsCrossed, 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  ArrowLeft, 
  Loader2,
  Wifi,
  Car,
  CreditCard,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadRestaurant(params.id as string);
    }
  }, [params.id]);

  const loadRestaurant = async (id: string) => {
    setLoading(true);
    try {
      const restaurantDoc = await getDoc(doc(db, 'products', id));
      if (restaurantDoc.exists()) {
        const data = { id: restaurantDoc.id, ...restaurantDoc.data() } as Product;
        if (data.serviceCategory === 'restaurant') {
          setRestaurant(data);
        } else {
          toast.error('Ce restaurant n\'existe pas');
          router.push('/restaurants');
        }
      } else {
        toast.error('Restaurant non trouvé');
        router.push('/restaurants');
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
      toast.error('Erreur lors du chargement du restaurant');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (!restaurant || !restaurant.restaurantData) {
    return null;
  }

  const getPriceRangeDisplay = (range: string) => {
    const symbols = { '€': '€', '€€': '€€', '€€€': '€€€', '€€€€': '€€€€' };
    return symbols[range as keyof typeof symbols] || range;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Gallery */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg overflow-hidden shadow-lg mb-4"
            >
              <div className="relative h-96">
                <img
                  src={restaurant.images[selectedImageIndex]}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Thumbnails */}
            {restaurant.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {restaurant.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      selectedImageIndex === index ? 'ring-4 ring-orange-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Restaurant Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-400 fill-yellow-400" size={20} />
                  <span className="font-bold text-lg">{restaurant.rating.toFixed(1)}</span>
                  <span className="text-gray-600">({restaurant.reviewCount} avis)</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {getPriceRangeDisplay(restaurant.restaurantData.priceRange)}
              </div>
            </div>

            {/* Type de cuisine */}
            <div className="mb-4">
              <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">
                {restaurant.restaurantData.cuisineType}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              {restaurant.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-orange-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Adresse</p>
                    <p className="text-gray-600">{restaurant.location.address}</p>
                    <p className="text-gray-600">{restaurant.location.city}</p>
                  </div>
                </div>
              )}

              {/* Téléphone temporairement désactivé
              {restaurant.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-orange-500" size={20} />
                  <div>
                    <p className="font-semibold">Téléphone</p>
                    <a href={`tel:${restaurant.phone}`} className="text-orange-600 hover:underline">
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              )}
              */}

              {restaurant.restaurantData.openingHours && (
                <div className="flex items-start gap-3">
                  <Clock className="text-orange-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Horaires</p>
                    <p className="text-gray-600 whitespace-pre-line">
                      {JSON.stringify(restaurant.restaurantData.openingHours, null, 2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {restaurant.restaurantData.features && restaurant.restaurantData.features.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Services</h2>
                <div className="grid grid-cols-2 gap-3">
                  {restaurant.restaurantData.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-gray-700">
                      {feature.toLowerCase().includes('wifi') && <Wifi size={18} className="text-orange-500" />}
                      {feature.toLowerCase().includes('parking') && <Car size={18} className="text-orange-500" />}
                      {feature.toLowerCase().includes('carte') && <CreditCard size={18} className="text-orange-500" />}
                      {feature.toLowerCase().includes('terrasse') && <Users size={18} className="text-orange-500" />}
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="flex gap-3">
              {/* Téléphone temporairement désactivé
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold text-center hover:bg-orange-600 transition-colors"
                >
                  Appeler
                </a>
              )}
              */}
              {restaurant.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${restaurant.location.latitude},${restaurant.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold text-center hover:bg-gray-300 transition-colors"
                >
                  Itinéraire
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
