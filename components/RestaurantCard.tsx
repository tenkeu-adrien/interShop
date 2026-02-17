'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Star } from 'lucide-react';
import { Product } from '@/types';
import { useGeolocationStore } from '@/store/geolocationStore';
import Link from 'next/link';

interface RestaurantCardProps {
  restaurant: Product;
  index: number;
}

export function RestaurantCard({ restaurant, index }: RestaurantCardProps) {
  const { calculateDistance } = useGeolocationStore();
  
  const distance = restaurant.location 
    ? calculateDistance(restaurant.location.latitude, restaurant.location.longitude)
    : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/restaurants/${restaurant.id}`}
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all block"
      >
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
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
          
          <div className="flex items-center gap-1 mb-2">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="text-sm font-semibold">{restaurant.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-600">({restaurant.reviewCount})</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {restaurant.restaurantData?.cuisineType.join(', ')}
          </p>
          
          {distance !== null && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <MapPin size={14} />
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock size={14} />
            <span>Ouvert aujourd'hui</span>
          </div>
          
          {restaurant.restaurantData?.features && (
            <div className="flex flex-wrap gap-1 mt-3">
              {restaurant.restaurantData.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
