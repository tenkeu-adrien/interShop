'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { BackButton } from '@/components/ui/BackButton';
import { useTranslations } from 'next-intl';
import { Loader2, MapPin, Heart, MessageCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DatingProfilePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('dating');
  const tCommon = useTranslations('common');
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [params.id]);

  const loadProfile = async () => {
    try {
      const profileDoc = await getDoc(doc(db, 'datingProfiles', params.id as string));
      if (profileDoc.exists()) {
        setProfile({ id: profileDoc.id, ...profileDoc.data() });
      } else {
        toast.error(t('no_profiles'));
        router.push('/dating');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-500" size={48} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton className="mb-6" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Profile Image */}
          <div className="relative h-96">
            <img
              src={profile.photos?.[0] || '/placeholder.png'}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            {profile.verified && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                <Shield size={16} />
                {t('verified')}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {profile.name}, {profile.age}
                </h1>
                {profile.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={18} />
                    <span>{profile.location.city}</span>
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('bio')}</h2>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{t('interests')}</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">{t('privacy_title')}</h3>
                  <p className="text-sm text-blue-700">{t('privacy_notice')}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => toast.info('Fonctionnalité bientôt disponible')}
                className="flex-1 bg-pink-500 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors"
              >
                <Heart size={20} />
                {t('like')}
              </button>
              <button
                onClick={() => toast.info('Fonctionnalité bientôt disponible')}
                className="flex-1 bg-blue-500 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              >
                <MessageCircle size={20} />
                {t('message')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
