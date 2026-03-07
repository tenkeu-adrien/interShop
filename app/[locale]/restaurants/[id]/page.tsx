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
  Loader2,
  Bike,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ContactButton } from '@/components/products/ContactButton';
import { BackButton } from '@/components/ui/BackButton';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('restaurants');
  const tCommon = useTranslations('common');
  
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
          toast.error(t('no_restaurants'));
          router.push('/restaurants');
        }
      } else {
        toast.error(t('no_restaurants'));
        router.push('/restaurants');
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
      toast.error(tCommon('error'));
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

  const { restaurantData } = restaurant;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackButton className="mb-6" />

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
                {restaurantData.isOpen && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
                    {t('open_now')}
                  </div>
                )}
              </div>
            </motion.div>

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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{restaurant.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                <span className="font-bold">{restaurant.rating.toFixed(1)}</span>
                <span className="text-gray-600">({restaurant.reviewCount} avis)</span>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                {restaurantData.cuisine}
              </span>
            </div>

            <p className="text-gray-700 mb-6">{restaurant.description}</p>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bike className="text-orange-500" size={20} />
                  <span className="font-semibold">{t('delivery_time')}</span>
                </div>
                <p className="text-gray-700">{restaurantData.deliveryTime}</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-orange-500" size={20} />
                  <span className="font-semibold">{t('min_order')}</span>
                </div>
                <PriceDisplay 
                  priceUSD={restaurantData.minimumOrder}
                  className="text-lg font-bold text-orange-600"
                />
              </div>
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

              <div className="flex items-start gap-3">
                <Clock className="text-orange-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold">Horaires</p>
                  <p className="text-gray-600">{restaurantData.openingHours}</p>
                </div>
              </div>
            </div>

            {/* Menu */}
            {restaurantData.menu && restaurantData.menu.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{t('menu')}</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {restaurantData.menu.map((item, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <PriceDisplay 
                          priceUSD={item.price}
                          className="text-lg font-bold text-orange-600"
                        />
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="space-y-3">
              <ContactButton
                type="restaurant"
                ownerId={restaurant.fournisseurId}
                ownerName={restaurant.name}
                ownerRole="fournisseur"
                itemId={restaurant.id!}
                itemName={restaurant.name}
                itemImage={restaurant.images[0]}
              />
              
              {restaurant.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${restaurant.location.latitude},${restaurant.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold text-center hover:bg-gray-300 transition-colors"
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
