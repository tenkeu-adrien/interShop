'use client';

import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';
import { Product } from '@/types';
import { useGeolocationStore } from '@/store/geolocationStore';
import Link from 'next/link';

interface HotelCardProps {
  hotel: Product;
  index: number;
}

export function HotelCard({ hotel, index }: HotelCardProps) {
  const { calculateDistance } = useGeolocationStore();
  
  const distance = hotel?.location 
    ? calculateDistance(hotel?.location.latitude, hotel.location.longitude)
    : null;
  
  const minPrice = hotel?.hotelData?.roomTypes.reduce((min, room) => 
    room.price < min ? room.price : min, 
    hotel.hotelData.roomTypes[0]?.price || 0
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/hotels/${hotel?.id}`}
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all block"
      >
        <div className="relative h-48">
          <img
            src={hotel?.images[0]}
            alt={hotel?.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            {Array.from({ length: hotel?.hotelData?.starRating || 0 }).map((_, i) => (
              <Star key={i} size={12} className="fill-white" />
            ))}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{hotel?.name}</h3>
          
          <div className="flex items-center gap-1 mb-2">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="text-sm font-semibold">{hotel?.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-600">({hotel?.reviewCount})</span>
          </div>
          
          {minPrice && (
            <p className="text-sm text-gray-600 mb-2">
              À partir de <span className="font-bold text-purple-600">${minPrice}</span> / nuit
            </p>
          )}
          
          {distance !== null && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <MapPin size={14} />
              <span>{distance?.toFixed(1)} km</span>
            </div>
          )}
          
          {hotel?.hotelData?.amenities && (
            <div className="flex flex-wrap gap-1 mt-3">
              {hotel?.hotelData.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
