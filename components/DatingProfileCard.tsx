'use client';

import { motion } from 'framer-motion';
import { Heart, MapPin, MessageCircle } from 'lucide-react';
import { DatingProfile } from '@/types/dating';
import Link from 'next/link';

interface DatingProfileCardProps {
  profile: DatingProfile;
  index: number;
}

export function DatingProfileCard({ profile, index }: DatingProfileCardProps) {
  return (
    <Link href={`/dating/${profile.id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
      >
        <div className="relative h-64">
          <img
            src={profile.images[0]}
            alt={profile.firstName}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Heart size={14} />
            {profile.status === 'available' ? 'Disponible' : 'Indisponible'}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xl">
              {profile.firstName}, {profile.age}
            </h3>
            <span className="text-sm text-gray-600 capitalize">
              {profile.gender}
            </span>
          </div>
          
          {profile.location && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <MapPin size={14} />
              <span>{profile.location.city}</span>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {profile.description}
          </p>
          
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {profile.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
          
          <div className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold text-center flex items-center justify-center gap-2">
            <MessageCircle size={16} />
            Voir le profil
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Les coordonnées sont partagées via un intermédiaire
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
