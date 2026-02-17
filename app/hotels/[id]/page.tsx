'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import { 
  Hotel, 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  ArrowLeft, 
  Loader2,
  Wifi,
  Car,
  Coffee,
  Waves,
  Dumbbell,
  Wind
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import toast from 'react-hot-toast';

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadHotel(params.id as string);
    }
  }, [params.id]);

  const loadHotel = async (id: string) => {
    setLoading(true);
    try {
      const hotelDoc = await getDoc(doc(db, 'products', id));
      if (hotelDoc.exists()) {
        const data = { id: hotelDoc.id, ...hotelDoc.data() } as Product;
        if (data.serviceCategory === 'hotel') {
          setHotel(data);
        } else {
          toast.error('Cet hôtel n\'existe pas');
          router.push('/hotels');
        }
      } else {
        toast.error('Hôtel non trouvé');
        router.push('/hotels');
      }
    } catch (error) {
      console.error('Error loading hotel:', error);
      toast.error('Erreur lors du chargement de l\'hôtel');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!hotel || !hotel.hotelData) {
    return null;
  }

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi size={18} className="text-blue-500" />;
    if (lower.includes('parking')) return <Car size={18} className="text-blue-500" />;
    if (lower.includes('petit-déjeuner') || lower.includes('restaurant')) return <Coffee size={18} className="text-blue-500" />;
    if (lower.includes('piscine')) return <Waves size={18} className="text-blue-500" />;
    if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell size={18} className="text-blue-500" />;
    if (lower.includes('climatisation')) return <Wind size={18} className="text-blue-500" />;
    return <Hotel size={18} className="text-blue-500" />;
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
                  src={hotel.images[selectedImageIndex]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Thumbnails */}
            {hotel.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {hotel.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      selectedImageIndex === index ? 'ring-4 ring-blue-500' : ''
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

          {/* Hotel Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(hotel.hotelData.starRating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                    ))}
                  </div>
                  <span className="text-gray-600">({hotel.hotelData.starRating} étoiles)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400 fill-yellow-400" size={18} />
                  <span className="font-bold">{hotel.rating.toFixed(1)}</span>
                  <span className="text-gray-600">({hotel.reviewCount} avis)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            {hotel.prices && hotel.prices.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">À partir de</p>
                <div className="flex items-baseline gap-2">
                  <PriceDisplay 
                    priceUSD={hotel.prices[0].price}
                    className="text-3xl font-bold text-blue-600"
                  />
                  <span className="text-gray-600">/ nuit</span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
            </div>

            {/* Room Types */}
            {hotel.hotelData.roomTypes && hotel.hotelData.roomTypes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Types de chambres</h2>
                <div className="space-y-3">
                  {hotel.hotelData.roomTypes.map((room, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{room.type}</h3>
                        <PriceDisplay 
                          priceUSD={room.price}
                          className="text-lg font-bold text-blue-600"
                        />
                      </div>
                      {room.description && (
                        <p className="text-sm text-gray-600">{room.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              {hotel.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold">Adresse</p>
                    <p className="text-gray-600">{hotel.location.address}</p>
                    <p className="text-gray-600">{hotel.location.city}</p>
                  </div>
                </div>
              )}

              {/* Téléphone temporairement désactivé - à ajouter dans le type Product si nécessaire
              {hotel.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-blue-500" size={20} />
                  <div>
                    <p className="font-semibold">Téléphone</p>
                    <a href={`tel:${hotel.phone}`} className="text-blue-600 hover:underline">
                      {hotel.phone}
                    </a>
                  </div>
                </div>
              )}
              */}

              <div className="flex items-start gap-3">
                <Clock className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold">Horaires</p>
                  <p className="text-gray-600">Check-in: {hotel.hotelData.checkInTime}</p>
                  <p className="text-gray-600">Check-out: {hotel.hotelData.checkOutTime}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {hotel.hotelData.amenities && hotel.hotelData.amenities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Équipements</h2>
                <div className="grid grid-cols-2 gap-3">
                  {hotel.hotelData.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-gray-700">
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="flex gap-3">
              {/* Téléphone temporairement désactivé
              {hotel.phone && (
                <a
                  href={`tel:${hotel.phone}`}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold text-center hover:bg-blue-600 transition-colors"
                >
                  Appeler
                </a>
              )}
              */}
              {hotel.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${hotel.location.latitude},${hotel.location.longitude}`}
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
