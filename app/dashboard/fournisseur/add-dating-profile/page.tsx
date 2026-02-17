'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductQuotaDisplay } from '@/components/ProductQuotaDisplay';
import { LicenseUpgradeModal } from '@/components/LicenseUpgradeModal';
import { InputWithSuggestions } from '@/components/ui/InputWithSuggestions';
import { useAuthStore } from '@/store/authStore';
import { useLicenseStore } from '@/store/licenseStore';
import { createDatingProfile } from '@/lib/firebase/datingProfiles';
import { uploadMultipleImages } from '@/lib/firebase/storage';
import { Loader2, Upload, Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { DatingProfile } from '@/types/dating';

export default function AddDatingProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { checkQuota } = useLicenseStore();
  
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState<'homme' | 'femme' | 'autre'>('femme');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [height, setHeight] = useState<number | undefined>();
  const [skinColor, setSkinColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [profession, setProfession] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Suggestions pour les champs
  const skinColorSuggestions = [
    'Claire',
    'Mate',
    'Bronzée',
    'Foncée',
    'Très claire',
    'Très foncée',
    'Olive',
    'Dorée'
  ];

  const eyeColorSuggestions = [
    'Marron',
    'Noir',
    'Bleu',
    'Vert',
    'Noisette',
    'Gris',
    'Ambre',
    'Bleu-vert'
  ];

  const professionSuggestions = [
    'Étudiant(e)',
    'Enseignant(e)',
    'Ingénieur(e)',
    'Médecin',
    'Infirmier(ère)',
    'Commerçant(e)',
    'Entrepreneur(se)',
    'Artiste',
    'Avocat(e)',
    'Comptable',
    'Développeur(se)',
    'Designer',
    'Chef cuisinier',
    'Architecte',
    'Journaliste',
    'Fonctionnaire',
    'Agriculteur(trice)',
    'Artisan(e)',
    'Sans emploi',
    'Retraité(e)'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length < 2) {
        toast.error('Minimum 2 photos requises');
        return;
      }
      if (files.length > 8) {
        toast.error('Maximum 8 photos autorisées');
        return;
      }
      setImages(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (age < 18) {
      toast.error('Âge minimum : 18 ans');
      return;
    }

    if (!checkQuota()) {
      setShowUpgradeModal(true);
      toast.error('Quota de produits atteint');
      return;
    }

    if (images.length < 2) {
      toast.error('Minimum 2 photos requises');
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await uploadMultipleImages(
        images,
        `fournisseurs/${user.id}/dating-profiles`
      );

      const profileData: Omit<DatingProfile, 'id'> = {
        fournisseurId: user.id,
        firstName,
        age,
        gender,
        description,
        images: imageUrls,
        location: {
          latitude: 0,
          longitude: 0,
          address: '',
          city,
          country: 'Unknown',
        },
        height,
        skinColor,
        eyeColor,
        profession,
        interests,
        status: 'available',
        contactInfo: {
          phone,
          email,
          whatsapp,
        },
        rating: 0,
        reviewCount: 0,
        views: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createDatingProfile(profileData);
      
      toast.success('Profil ajouté avec succès !');
      router.push('/dashboard/fournisseur/dating-profiles');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      if (error.message.includes('Quota')) {
        setShowUpgradeModal(true);
      }
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Ajouter un profil de rencontre
        </h1>

        <ProductQuotaDisplay fournisseurId={user.id} />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6 flex items-start gap-3">
          <Shield className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Confidentialité</h3>
            <p className="text-sm text-blue-800">
              Les informations de contact ne seront visibles que par vous. Les clients devront vous contacter pour obtenir ces informations.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4">Informations du profil</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge * (minimum 18 ans)
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <h3 className="text-lg font-semibold mb-4">Informations optionnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille (cm)
                </label>
                <input
                  type="number"
                  value={height || ''}
                  onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <InputWithSuggestions
                label="Couleur de peau"
                value={skinColor}
                onChange={setSkinColor}
                suggestions={skinColorSuggestions}
                placeholder="Ex: Claire, Mate, Bronzée..."
              />

              <InputWithSuggestions
                label="Couleur des yeux"
                value={eyeColor}
                onChange={setEyeColor}
                suggestions={eyeColorSuggestions}
                placeholder="Ex: Marron, Bleu, Vert..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InputWithSuggestions
                label="Profession"
                value={profession}
                onChange={setProfession}
                suggestions={professionSuggestions}
                placeholder="Ex: Enseignant(e), Ingénieur(e)..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Centres d'intérêt (séparés par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Musique, Sport, Voyage"
                  onChange={(e) => setInterests(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos * (Min: 2, Max: 8)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="images"
                />
                <label
                  htmlFor="images"
                  className="cursor-pointer text-pink-600 hover:text-pink-700 font-semibold"
                >
                  Cliquez pour sélectionner des photos
                </label>
                {images.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">{images.length} photo(s) sélectionnée(s)</p>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4 text-red-600">Informations de contact (privées)</h3>
            <p className="text-sm text-gray-600 mb-4">Ces informations ne seront visibles que par vous</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Création en cours...
                </>
              ) : (
                'Ajouter le profil'
              )}
            </button>
          </form>
        </div>
      </div>

      <LicenseUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
