'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductQuotaDisplay } from '@/components/ProductQuotaDisplay';
import { GeolocationCapture } from '@/components/GeolocationCapture';
import { LicenseUpgradeModal } from '@/components/LicenseUpgradeModal';
import { InputWithSuggestions } from '@/components/ui/InputWithSuggestions';
import { useAuthStore } from '@/store/authStore';
import { useLicenseStore } from '@/store/licenseStore';
import { createMultiCategoryProduct } from '@/lib/firebase/products';
import { uploadMultipleImages } from '@/lib/firebase/storage';
import { Loader2, Upload, X, Plus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { checkQuota } = useLicenseStore();
  
  const [listingType, setListingType] = useState<'restaurant' | 'hotel'>('restaurant');
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Common fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  
  // Restaurant fields
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [currentCuisine, setCurrentCuisine] = useState('');
  const [priceRange, setPriceRange] = useState<'€' | '€€' | '€€€' | '€€€€'>('€€');
  const [features, setFeatures] = useState<string[]>([]);
  
  // Hotel fields
  const [starRating, setStarRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [roomTypes, setRoomTypes] = useState<Array<{ type: string; price: number; description: string }>>([
    { type: 'Simple', price: 0, description: '' }
  ]);

  // Suggestions pour les types de cuisine
  const cuisineSuggestions = [
    'Française',
    'Italienne',
    'Chinoise',
    'Japonaise',
    'Indienne',
    'Mexicaine',
    'Thaïlandaise',
    'Vietnamienne',
    'Libanaise',
    'Marocaine',
    'Tunisienne',
    'Algérienne',
    'Sénégalaise',
    'Ivoirienne',
    'Camerounaise',
    'Américaine',
    'Espagnole',
    'Grecque',
    'Turque',
    'Brésilienne',
    'Coréenne',
    'Fusion',
    'Végétarienne',
    'Vegan',
    'Fast-food',
    'Grillades',
    'Fruits de mer',
    'Pizza',
    'Sushi',
    'Street food'
  ];

  // Options prédéfinies pour les caractéristiques
  const restaurantFeatureOptions = [
    'WiFi gratuit',
    'Parking',
    'Terrasse',
    'Climatisation',
    'Accessible PMR',
    'Animaux acceptés',
    'Livraison',
    'À emporter',
    'Réservation en ligne',
    'Paiement carte',
    'Menu végétarien',
    'Menu vegan',
    'Menu sans gluten',
    'Bar',
    'Musique live'
  ];

  const hotelAmenityOptions = [
    'WiFi gratuit',
    'Parking gratuit',
    'Piscine',
    'Spa',
    'Salle de sport',
    'Restaurant',
    'Bar',
    'Room service',
    'Climatisation',
    'Petit-déjeuner inclus',
    'Navette aéroport',
    'Réception 24h/24',
    'Coffre-fort',
    'Blanchisserie',
    'Salle de conférence',
    'Accessible PMR',
    'Animaux acceptés',
    'Vue mer',
    'Balcon',
    'Jacuzzi'
  ];

  const toggleFeature = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const addCuisineType = () => {
    if (currentCuisine.trim() && !cuisineTypes.includes(currentCuisine.trim())) {
      setCuisineTypes([...cuisineTypes, currentCuisine.trim()]);
      setCurrentCuisine('');
    }
  };

  const removeCuisineType = (cuisine: string) => {
    setCuisineTypes(cuisineTypes.filter(c => c !== cuisine));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const minImages = listingType === 'restaurant' ? 3 : 5;
      const maxImages = listingType === 'restaurant' ? 10 : 20;
      
      if (files.length < minImages) {
        toast.error(`Minimum ${minImages} images requises`);
        return;
      }
      if (files.length > maxImages) {
        toast.error(`Maximum ${maxImages} images autorisées`);
        return;
      }
      setImages(files);
    }
  };

  const handleLocationCaptured = (lat: number, lng: number, addr: string) => {
    setLocation({ latitude: lat, longitude: lng, address: addr });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    // Check quota
    if (!checkQuota()) {
      setShowUpgradeModal(true);
      toast.error('Quota de produits atteint');
      return;
    }

    if (!location) {
      toast.error('Veuillez capturer votre position');
      return;
    }

    if (images.length === 0) {
      toast.error('Veuillez ajouter des images');
      return;
    }

    setLoading(true);
    try {
      // Upload images
      const imageUrls = await uploadMultipleImages(
        images,
        `fournisseurs/${user.id}/${listingType}s`
      );

      // Create product
      const productData: any = {
        fournisseurId: user.id,
        name,
        description,
        images: imageUrls,
        category: listingType,
        serviceCategory: listingType,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || address,
          city,
          country: 'Unknown',
        },
        rating: 0,
        reviewCount: 0,
        views: 0,
        sales: 0,
        isActive: true,
        moq: 1,
        prices: [{ minQuantity: 1, price: 0, currency: 'USD' }],
        stock: 1,
        country: 'Unknown',
        deliveryTime: 'N/A',
        certifications: [],
        tags: [],
      };

      if (listingType === 'restaurant') {
        productData.restaurantData = {
          cuisineType: cuisineTypes,
          priceRange,
          openingHours: {},
          features,
        };
      } else {
        productData.hotelData = {
          starRating,
          roomTypes,
          checkInTime,
          checkOutTime,
          amenities,
        };
      }

      await createMultiCategoryProduct(productData, user.id);
      
      toast.success(`${listingType === 'restaurant' ? 'Restaurant' : 'Hôtel'} ajouté avec succès !`);
      router.push('/dashboard/fournisseur/products');
    } catch (error: any) {
      console.error('Error creating listing:', error);
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
          Ajouter un établissement
        </h1>

        <ProductQuotaDisplay fournisseurId={user.id} />

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <form onSubmit={handleSubmit}>
            {/* Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'établissement
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setListingType('restaurant')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    listingType === 'restaurant'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Restaurant
                </button>
                <button
                  type="button"
                  onClick={() => setListingType('hotel')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    listingType === 'hotel'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hôtel
                </button>
              </div>
            </div>

            {/* Geolocation */}
            <div className="mb-6">
              <GeolocationCapture
                warningMessage={`Votre position actuelle sera utilisée comme localisation du ${listingType}`}
                onLocationCaptured={handleLocationCaptured}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Images */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images * (Min: {listingType === 'restaurant' ? 3 : 5}, Max: {listingType === 'restaurant' ? 10 : 20})
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
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Cliquez pour sélectionner des images
                </label>
                {images.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">{images.length} image(s) sélectionnée(s)</p>
                )}
              </div>
            </div>

            {/* Restaurant-specific fields */}
            {listingType === 'restaurant' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gamme de prix
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="€">€ - Économique</option>
                    <option value="€€">€€ - Modéré</option>
                    <option value="€€€">€€€ - Cher</option>
                    <option value="€€€€">€€€€ - Très cher</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Types de cuisine
                  </label>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <InputWithSuggestions
                        label=""
                        value={currentCuisine}
                        onChange={setCurrentCuisine}
                        suggestions={cuisineSuggestions}
                        placeholder="Ex: Française, Italienne..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addCuisineType}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Ajouter
                    </button>
                  </div>
                  
                  {cuisineTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cuisineTypes.map((cuisine, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                        >
                          {cuisine}
                          <button
                            type="button"
                            onClick={() => removeCuisineType(cuisine)}
                            className="hover:text-orange-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Caractéristiques
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {restaurantFeatureOptions.map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Hotel-specific fields */}
            {listingType === 'hotel' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Étoiles
                    </label>
                    <select
                      value={starRating}
                      onChange={(e) => setStarRating(Number(e.target.value) as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="1">1 étoile</option>
                      <option value="2">2 étoiles</option>
                      <option value="3">3 étoiles</option>
                      <option value="4">4 étoiles</option>
                      <option value="5">5 étoiles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in
                    </label>
                    <input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out
                    </label>
                    <input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Équipements
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hotelAmenityOptions.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Création en cours...
                </>
              ) : (
                `Ajouter le ${listingType === 'restaurant' ? 'restaurant' : "l'hôtel"}`
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
