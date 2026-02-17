'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Heart, Plus, Search, Edit, Trash2, Eye, MapPin, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DatingProfile } from '@/types/dating';
import { getFournisseurDatingProfiles, deleteDatingProfile } from '@/lib/firebase/datingProfiles';

function DatingProfilesListContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getFournisseurDatingProfiles(user.id);
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredProfiles = profiles.filter(p =>
    p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce profil ?')) return;
    
    try {
      await deleteDatingProfile(id);
      setProfiles(profiles.filter(p => p.id !== id));
      toast.success('Profil supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
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
            <div className="bg-pink-100 p-3 rounded-full">
              <Heart className="text-pink-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Profils de Rencontre</h1>
              <p className="text-gray-600 mt-1">{profiles.length} profil(s)</p>
            </div>
          </div>
          <Link
            href="/dashboard/fournisseur/add-dating-profile"
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Plus size={20} />
            Ajouter un profil
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
              placeholder="Rechercher un profil..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Profiles Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={profile.images[0]}
                    alt={profile.firstName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      profile.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {profile.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">
                    {profile.firstName}, {profile.age}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <User size={14} />
                    <span className="capitalize">{profile.gender}</span>
                  </div>

                  {profile.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{profile.location.city}</span>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {profile.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/dating/${profile.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      <Eye size={16} />
                      Voir
                    </Link>
                    <button
                      onClick={() => handleDelete(profile.id)}
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
            <Heart className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun profil</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Aucun profil ne correspond à votre recherche' : 'Commencez par ajouter votre premier profil de rencontre'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/fournisseur/add-dating-profile"
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                <Plus size={20} />
                Ajouter un profil
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DatingProfilesListPage() {
  return (
    <ProtectedRoute allowedRoles={['fournisseur']}>
      <DatingProfilesListContent />
    </ProtectedRoute>
  );
}
