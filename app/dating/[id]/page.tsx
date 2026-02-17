'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DatingProfile } from '@/types/dating';
import { getDatingProfile, incrementProfileViews } from '@/lib/firebase/datingProfiles';
import { Heart, MapPin, Briefcase, Ruler, Eye, MessageCircle, ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function DatingProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<DatingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadProfile(params.id as string);
    }
  }, [params.id]);

  const loadProfile = async (id: string) => {
    setLoading(true);
    try {
      const data = await getDatingProfile(id);
      if (data) {
        setProfile(data);
        // Increment views
        await incrementProfileViews(id);
      } else {
        toast.error('Profil non trouvé');
        router.push('/dating');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleContactRequest = () => {
    if (!user) {
      toast.error('Vous devez être connecté pour demander un contact');
      router.push('/login');
      return;
    }
    router.push(`/chat?intermediary=${profile?.fournisseurId}&profile=${profile?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500" size={48} />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

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

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Shield className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Protection de la vie privée</h3>
            <p className="text-sm text-blue-800">
              Les coordonnées de ce profil ne sont pas affichées publiquement. Pour obtenir le contact, 
              cliquez sur "Demander le contact" ci-dessous.
            </p>
          </div>
        </div>

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
                  src={profile.images[selectedImageIndex]}
                  alt={profile.firstName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-pink-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                  <Heart size={16} />
                  {profile.status === 'available' ? 'Disponible' : 'Indisponible'}
                </div>
              </div>
            </motion.div>

            {/* Thumbnails */}
            {profile.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {profile.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      selectedImageIndex === index ? 'ring-4 ring-pink-500' : ''
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

          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {profile.firstName}, {profile.age} ans
            </h1>

            <div className="flex items-center gap-4 text-gray-600 mb-6">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={18} />
                  <span>{profile.location.city}</span>
                </div>
              )}
              <span className="capitalize">{profile.gender}</span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">À propos</h2>
              <p className="text-gray-700 leading-relaxed">{profile.description}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {profile.height && (
                <div className="flex items-center gap-2">
                  <Ruler size={18} className="text-pink-500" />
                  <div>
                    <p className="text-sm text-gray-500">Taille</p>
                    <p className="font-semibold">{profile.height} cm</p>
                  </div>
                </div>
              )}

              {profile.eyeColor && (
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-pink-500" />
                  <div>
                    <p className="text-sm text-gray-500">Yeux</p>
                    <p className="font-semibold capitalize">{profile.eyeColor}</p>
                  </div>
                </div>
              )}

              {profile.profession && (
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-pink-500" />
                  <div>
                    <p className="text-sm text-gray-500">Profession</p>
                    <p className="font-semibold">{profile.profession}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Centres d'intérêt</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Button */}
            <button
              onClick={handleContactRequest}
              className="w-full bg-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageCircle size={24} />
              Demander le contact
            </button>

            <p className="text-sm text-gray-500 mt-3 text-center">
              Un intermédiaire vous mettra en relation
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
