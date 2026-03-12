'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useProductsStore } from '@/store/productsStore';
import { createProduct } from '@/lib/firebase/products';
import { 
  uploadImage, 
  uploadVideo, 
  compressImage,
  validateImageFile,
  validateVideoFile 
} from '@/lib/firebase/storage';
import { Product, PriceTier, FournisseurPaymentMethod } from '@/types';
import {
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  CheckCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  Info,
  Tag,
  CreditCard,
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { EditableSelect } from '@/components/ui/EditableSelect';
import { COUNTRIES, DELIVERY_TIMES, CERTIFICATIONS, PRODUCT_TAGS, PAYMENT_METHOD_TYPES } from '@/lib/data/productOptions';
import { getPaymentMethodCategory, getPaymentMethodInstructions } from '@/lib/utils/paymentMethodFields';

interface ImageUpload {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  url?: string;
}

interface VideoUpload {
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  url?: string;
}

function NewProductContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addProduct } = useProductsStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'pricing' | 'inventory' | 'shipping'>('general');

  // General Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Media
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [videos, setVideos] = useState<VideoUpload[]>([]);

  // Pricing
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([
    { minQuantity: 1, price: 0, currency: 'USD' }
  ]);

  // Inventory
  const [moq, setMoq] = useState(1);
  const [stock, setStock] = useState(0);
  const [sku, setSku] = useState('');

  // Shipping
  const [country, setCountry] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('7-15 days');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');

  // Marketing Settings (NEW)
  const [allowsMarketingCodes, setAllowsMarketingCodes] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [minQuantityForDiscount, setMinQuantityForDiscount] = useState(1);
  const [marketisteCommissionRate, setMarketisteCommissionRate] = useState(5);

  // Payment Methods (NEW)
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<FournisseurPaymentMethod[]>([]);
  const [showPaymentConfig, setShowPaymentConfig] = useState<string | null>(null);

  // Sections collapse state
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    media: true,
    pricing: true,
    marketing: true,
    payment: true,
    inventory: true,
    shipping: true
  });

  const categories = [
    'Électronique',
    'Mode',
    'Maison & Jardin',
    'Sport & Loisirs',
    'Beauté & Santé',
    'Jouets & Bébé',
    'Automobile',
    'Livres & Médias',
    'Alimentation',
    'Fournitures Bureau'
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle Image Upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      try {
        validateImageFile(file);
        
        // Compress image
        const compressedFile = await compressImage(file);
        
        const preview = URL.createObjectURL(compressedFile);
        const newImage: ImageUpload = {
          file: compressedFile,
          preview,
          uploading: false,
          progress: 0
        };
        
        setImages(prev => [...prev, newImage]);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  // Handle Video Upload
  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      try {
        validateVideoFile(file);
        
        const preview = URL.createObjectURL(file);
        const newVideo: VideoUpload = {
          file,
          preview,
          uploading: false,
          progress: 0
        };
        
        setVideos(prev => [...prev, newVideo]);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  // Remove Image
  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Remove Video
  const removeVideo = (index: number) => {
    setVideos(prev => {
      const newVideos = [...prev];
      URL.revokeObjectURL(newVideos[index].preview);
      newVideos.splice(index, 1);
      return newVideos;
    });
  };

  // Add Tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove Tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Add Price Tier
  const addPriceTier = () => {
    const lastTier = priceTiers[priceTiers.length - 1];
    setPriceTiers([
      ...priceTiers,
      {
        minQuantity: (lastTier.maxQuantity || lastTier.minQuantity) + 1,
        price: 0,
        currency: 'USD'
      }
    ]);
  };

  // Remove Price Tier
  const removePriceTier = (index: number) => {
    if (priceTiers.length > 1) {
      setPriceTiers(priceTiers.filter((_, i) => i !== index));
    }
  };

  // Update Price Tier
  const updatePriceTier = (index: number, field: keyof PriceTier, value: any) => {
    const newTiers = [...priceTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setPriceTiers(newTiers);
  };

  // Add Certification
  const addCertification = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput('');
    }
  };

  // Submit Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    // Validation
    if (!name.trim()) {
      toast.error('Le nom du produit est requis');
      return;
    }

    if (!description.trim()) {
      toast.error('La description est requise');
      return;
    }

    if (!category) {
      toast.error('La catégorie est requise');
      return;
    }

    if (images.length === 0) {
      toast.error('Au moins une image est requise');
      return;
    }

    if (priceTiers.some(tier => tier.price <= 0)) {
      toast.error('Tous les prix doivent être supérieurs à 0');
      return;
    }

    // Validation des moyens de paiement
    if (acceptedPaymentMethods.length === 0) {
      toast.error('Veuillez sélectionner au moins un moyen de paiement');
      return;
    }

    // Validation des champs spécifiques selon le type
    for (const method of acceptedPaymentMethods) {
      if (!method.accountName.trim()) {
        toast.error(`Veuillez entrer le nom du compte pour ${method.method}`);
        return;
      }

      const config = getPaymentMethodCategory(method.method);

      // Mobile Money
      if (config.fields.phoneNumber && !method.phoneNumber?.trim()) {
        toast.error(`Veuillez entrer le numéro de téléphone pour ${method.method}`);
        return;
      }

      // Crypto
      if (config.fields.walletAddress) {
        if (!method.walletAddress?.trim()) {
          toast.error(`Veuillez entrer l'adresse du wallet pour ${method.method}`);
          return;
        }
        if (!method.network?.trim()) {
          toast.error(`Veuillez sélectionner le réseau pour ${method.method}`);
          return;
        }
      }

      // Virement bancaire
      if (config.fields.iban) {
        if (!method.iban?.trim()) {
          toast.error(`Veuillez entrer l'IBAN pour ${method.method}`);
          return;
        }
        if (!method.bankName?.trim()) {
          toast.error(`Veuillez entrer le nom de la banque pour ${method.method}`);
          return;
        }
      }

      // Western Union / MoneyGram
      if (config.fields.recipientName) {
        if (!method.recipientName?.trim()) {
          toast.error(`Veuillez entrer le nom du bénéficiaire pour ${method.method}`);
          return;
        }
        if (!method.country?.trim()) {
          toast.error(`Veuillez entrer le pays pour ${method.method}`);
          return;
        }
        if (!method.city?.trim()) {
          toast.error(`Veuillez entrer la ville pour ${method.method}`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Upload images
      toast.loading('Upload des images...', { id: 'upload' });
      const imageUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setImages(prev => {
          const newImages = [...prev];
          newImages[i].uploading = true;
          return newImages;
        });

        const url = await uploadImage(
          image.file,
          `products/${user.id}/images`,
          (progress) => {
            setImages(prev => {
              const newImages = [...prev];
              newImages[i].progress = progress;
              return newImages;
            });
          }
        );

        imageUrls.push(url);
        setImages(prev => {
          const newImages = [...prev];
          newImages[i].url = url;
          newImages[i].uploading = false;
          return newImages;
        });
      }

      // Upload videos
      const videoUrls: string[] = [];
      if (videos.length > 0) {
        toast.loading('Upload des vidéos...', { id: 'upload' });
        
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          setVideos(prev => {
            const newVideos = [...prev];
            newVideos[i].uploading = true;
            return newVideos;
          });

          const url = await uploadVideo(
            video.file,
            `products/${user.id}/videos`,
            (progress) => {
              setVideos(prev => {
                const newVideos = [...prev];
                newVideos[i].progress = progress;
                return newVideos;
              });
            }
          );

          videoUrls.push(url);
          setVideos(prev => {
            const newVideos = [...prev];
            newVideos[i].url = url;
            newVideos[i].uploading = false;
            return newVideos;
          });
        }
      }

      // Create product
      toast.loading('Création du produit...', { id: 'upload' });
      
      // Build product data, omitting undefined fields for Firestore
      const productData: Omit<Product, 'id'> = {
        fournisseurId: user.id,
        name: name.trim(),
        description: description.trim(),
        images: imageUrls,
        category,
        tags,
        moq,
        prices: priceTiers,
        stock,
        country,
        deliveryTime,
        certifications,
        rating: 0,
        reviewCount: 0,
        views: 0,
        sales: 0,
        isActive: true,
        serviceCategory: 'ecommerce', // Par défaut pour les produits normaux
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Marketing settings
        marketingSettings: allowsMarketingCodes ? {
          allowsMarketingCodes: true,
          discountPercentage,
          minQuantityForDiscount,
          marketisteCommissionRate
        } : {
          allowsMarketingCodes: false,
          discountPercentage: 0,
          minQuantityForDiscount: 1,
          marketisteCommissionRate: 0
        },
        
        // Payment methods
        acceptedPaymentMethods,
        
        // Only include optional fields if they have values
        ...(videoUrls.length > 0 && { videos: videoUrls }),
        ...(subcategory.trim() && { subcategory: subcategory.trim() }),
        ...(sku.trim() && { sku: sku.trim() })
      };

      const productId = await createProduct(productData);
      
      // Ajouter au store Zustand
      addProduct({ ...productData, id: productId });

      toast.success('Produit créé avec succès!', { id: 'upload' });
      router.push('/dashboard/fournisseur/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Erreur lors de la création du produit', { id: 'upload' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ajouter un nouveau produit</h1>
            <p className="text-gray-600 mt-1">Remplissez les informations ci-dessous</p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <X size={20} />
            Annuler
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow"
          >
            <button
              type="button"
              onClick={() => toggleSection('general')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h2 className="text-xl font-bold">Informations générales</h2>
              {expandedSections.general ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <AnimatePresence>
              {expandedSections.general && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: iPhone 15 Pro Max 256GB"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Décrivez votre produit en détail..."
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {description.length} caractères
                    </p>
                  </div>

                  {/* Category & Subcategory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sous-catégorie
                      </label>
                      <input
                        type="text"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Ex: Smartphones"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <EditableSelect
                          value={tagInput}
                          onChange={setTagInput}
                          options={PRODUCT_TAGS}
                          placeholder="Sélectionner ou créer un tag"
                          allowCustom
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-orange-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Media Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow"
          >
            <button
              type="button"
              onClick={() => toggleSection('media')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h2 className="text-xl font-bold">Médias</h2>
              {expandedSections.media ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <AnimatePresence>
              {expandedSections.media && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 space-y-6"
                >
                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images du produit * (Max 5MB par image)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-gray-600">Cliquez pour ajouter des images</p>
                        <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP ou GIF</p>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            {image.uploading && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="text-white text-center">
                                  <Loader className="animate-spin mx-auto mb-2" size={24} />
                                  <p className="text-sm">{Math.round(image.progress)}%</p>
                                </div>
                              </div>
                            )}
                            {!image.uploading && (
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                            )}
                            {image.url && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full">
                                <Check size={16} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Videos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vidéos du produit (Optionnel, Max 50MB par vidéo)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoSelect}
                        className="hidden"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <Video className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-gray-600">Cliquez pour ajouter des vidéos</p>
                        <p className="text-sm text-gray-500 mt-1">MP4, WEBM ou OGG</p>
                      </label>
                    </div>

                    {/* Video Previews */}
                    {videos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {videos.map((video, index) => (
                          <div key={index} className="relative group">
                            <video
                              src={video.preview}
                              className="w-full h-32 object-cover rounded-lg"
                              controls
                            />
                            {video.uploading && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="text-white text-center">
                                  <Loader className="animate-spin mx-auto mb-2" size={24} />
                                  <p className="text-sm">{Math.round(video.progress)}%</p>
                                </div>
                              </div>
                            )}
                            {!video.uploading && (
                              <button
                                type="button"
                                onClick={() => removeVideo(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                            )}
                            {video.url && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full">
                                <Check size={16} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pricing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow"
          >
            <button
              type="button"
              onClick={() => toggleSection('pricing')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h2 className="text-xl font-bold">Tarification</h2>
              {expandedSections.pricing ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <AnimatePresence>
              {expandedSections.pricing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <Info size={16} />
                    <p>Définissez des paliers de prix en fonction de la quantité commandée</p>
                  </div>

                  {priceTiers.map((tier, index) => (
                    <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantité min *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={tier.minQuantity || 1}
                            onChange={(e) => updatePriceTier(index, 'minQuantity', parseInt(e.target.value) || 1)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantité max
                          </label>
                          <input
                            type="number"
                            min={tier.minQuantity || 1}
                            value={tier.maxQuantity || ''}
                            onChange={(e) => updatePriceTier(index, 'maxQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Illimité"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prix unitaire (USD) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={tier.price || 0}
                            onChange={(e) => updatePriceTier(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      {priceTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePriceTier(index)}
                          className="mt-8 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addPriceTier}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Ajouter un palier de prix
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Marketing Settings Section (NEW) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-lg shadow"
          >
            <button
              type="button"
              onClick={() => toggleSection('marketing')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-2">
                <Tag className="text-yellow-600" size={24} />
                <h2 className="text-xl font-bold">Paramètres Marketing</h2>
              </div>
              {expandedSections.marketing ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <AnimatePresence>
              {expandedSections.marketing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  <div className="flex items-start gap-3 text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <Info size={20} className="flex-shrink-0 mt-0.5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900 mb-1">Comment ça fonctionne ?</p>
                      <p>Les marketistes créent des codes promo pour promouvoir vos produits. Vous définissez ici la réduction accordée aux clients et la commission versée aux marketistes.</p>
                    </div>
                  </div>

                  {/* Allow Marketing Codes */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Accepter les codes promotionnels
                      </label>
                      <p className="text-sm text-gray-600">
                        Permettre aux marketistes de promouvoir ce produit avec leurs codes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowsMarketingCodes}
                        onChange={(e) => setAllowsMarketingCodes(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>

                  {allowsMarketingCodes && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pl-4 border-l-4 border-yellow-200"
                    >
                      {/* Discount Percentage */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Réduction accordée au client (%)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            value={discountPercentage}
                            onChange={(e) => setDiscountPercentage(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                          />
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={discountPercentage}
                              onChange={(e) => setDiscountPercentage(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                            />
                            <Percent size={20} className="text-gray-400" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Le client bénéficiera de {discountPercentage}% de réduction avec un code promo
                        </p>
                      </div>

                      {/* Min Quantity for Discount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantité minimum pour la réduction
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={minQuantityForDiscount}
                          onChange={(e) => setMinQuantityForDiscount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Le code promo ne s'appliquera qu'à partir de {minQuantityForDiscount} unité{minQuantityForDiscount > 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Marketiste Commission Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commission du marketiste (%)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="30"
                            step="0.5"
                            value={marketisteCommissionRate}
                            onChange={(e) => setMarketisteCommissionRate(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                          />
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              step="0.5"
                              value={marketisteCommissionRate}
                              onChange={(e) => setMarketisteCommissionRate(Math.min(30, Math.max(0, parseFloat(e.target.value) || 0)))}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                            />
                            <Percent size={20} className="text-gray-400" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Le marketiste gagnera {marketisteCommissionRate}% de commission sur chaque vente
                        </p>
                      </div>

                      {/* Example Calculation */}
                      <div className="bg-gradient-to-r from-yellow-50 to-green-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-sm font-medium text-gray-900 mb-2">💡 Exemple de calcul :</p>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p>• Prix du produit : {priceTiers[0]?.price || 100} USD</p>
                          <p>• Réduction client : -{((priceTiers[0]?.price || 100) * discountPercentage / 100).toFixed(2)} USD ({discountPercentage}%)</p>
                          <p>• Commission marketiste : +{((priceTiers[0]?.price || 100) * marketisteCommissionRate / 100).toFixed(2)} USD ({marketisteCommissionRate}%)</p>
                          <p className="font-semibold text-green-700 pt-2 border-t border-yellow-200">
                            → Client paie : {((priceTiers[0]?.price || 100) * (1 - discountPercentage / 100)).toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Payment Methods Section (NEW) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27 }}
            className="bg-white rounded-lg shadow"
          >
            <button
              type="button"
              onClick={() => toggleSection('payment')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold">Moyens de paiement acceptés</h2>
              </div>
              {expandedSections.payment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <AnimatePresence>
              {expandedSections.payment && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  <div className="flex items-start gap-3 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Info size={20} className="flex-shrink-0 mt-0.5 text-blue-600" />
                    <p>Sélectionnez les moyens de paiement que vous acceptez et configurez vos informations de compte pour recevoir les paiements.</p>
                  </div>

                  <div className="space-y-3">
                    {PAYMENT_METHOD_TYPES.map((method) => {
                      const isSelected = acceptedPaymentMethods.some(m => m.method === method);
                      const methodData = acceptedPaymentMethods.find(m => m.method === method);
                      
                      return (
                        <div key={method} className="border-2 rounded-lg overflow-hidden">
                          <label
                            className={`flex items-center gap-3 p-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAcceptedPaymentMethods([
                                    ...acceptedPaymentMethods,
                                    {
                                      method,
                                      accountName: '',
                                      accountNumber: '',
                                      accountDetails: '',
                                      isActive: true
                                    }
                                  ]);
                                  setShowPaymentConfig(method);
                                } else {
                                  setAcceptedPaymentMethods(
                                    acceptedPaymentMethods.filter(m => m.method !== method)
                                  );
                                  if (showPaymentConfig === method) {
                                    setShowPaymentConfig(null);
                                  }
                                }
                              }}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{method}</p>
                              {methodData && methodData.accountName && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {methodData.accountName}
                                  {methodData.phoneNumber && ` - ${methodData.phoneNumber}`}
                                  {methodData.walletAddress && ` - ${methodData.walletAddress.substring(0, 10)}...`}
                                  {methodData.iban && ` - ${methodData.iban}`}
                                  {methodData.recipientName && ` - ${methodData.recipientName}`}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <>
                                <Check size={20} className="text-blue-600" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setShowPaymentConfig(showPaymentConfig === method ? null : method);
                                  }}
                                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  {showPaymentConfig === method ? 'Masquer' : 'Configurer'}
                                </button>
                              </>
                            )}
                          </label>

                          {/* Configuration du moyen de paiement */}
                          {isSelected && showPaymentConfig === method && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-gray-50 p-4 border-t border-gray-200 space-y-3"
                            >
                              {/* Instructions */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                <Info size={16} className="inline mr-2" />
                                {getPaymentMethodInstructions(method)}
                              </div>

                              {/* Nom du compte (commun à tous) */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Nom du compte *
                                </label>
                                <input
                                  type="text"
                                  value={methodData?.accountName || ''}
                                  onChange={(e) => {
                                    setAcceptedPaymentMethods(
                                      acceptedPaymentMethods.map(m =>
                                        m.method === method
                                          ? { ...m, accountName: e.target.value }
                                          : m
                                      )
                                    );
                                  }}
                                  placeholder="Ex: Jean Dupont"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  required={isSelected}
                                />
                              </div>

                              {/* Champs spécifiques selon le type */}
                              {(() => {
                                const config = getPaymentMethodCategory(method);

                                // Mobile Money
                                if (config.fields.phoneNumber) {
                                  return (
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Numéro de téléphone *
                                      </label>
                                      <input
                                        type="tel"
                                        value={methodData?.phoneNumber || ''}
                                        onChange={(e) => {
                                          setAcceptedPaymentMethods(
                                            acceptedPaymentMethods.map(m =>
                                              m.method === method
                                                ? { ...m, phoneNumber: e.target.value }
                                                : m
                                            )
                                          );
                                        }}
                                        placeholder="Ex: +243 812 345 678"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required={isSelected}
                                      />
                                    </div>
                                  );
                                }

                                // Crypto
                                if (config.fields.walletAddress) {
                                  return (
                                    <>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Adresse du wallet *
                                        </label>
                                        <input
                                          type="text"
                                          value={methodData?.walletAddress || ''}
                                          onChange={(e) => {
                                            setAcceptedPaymentMethods(
                                              acceptedPaymentMethods.map(m =>
                                                m.method === method
                                                  ? { ...m, walletAddress: e.target.value }
                                                  : m
                                              )
                                            );
                                          }}
                                          placeholder="Ex: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                                          required={isSelected}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Réseau *
                                        </label>
                                        <select
                                          value={methodData?.network || ''}
                                          onChange={(e) => {
                                            setAcceptedPaymentMethods(
                                              acceptedPaymentMethods.map(m =>
                                                m.method === method
                                                  ? { ...m, network: e.target.value }
                                                  : m
                                              )
                                            );
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                          required={isSelected}
                                        >
                                          <option value="">Sélectionner un réseau</option>
                                          {config.networkOptions?.map(network => (
                                            <option key={network} value={network}>{network}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </>
                                  );
                                }

                                // Virement bancaire
                                if (config.fields.iban) {
                                  return (
                                    <>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          IBAN *
                                        </label>
                                        <input
                                          type="text"
                                          value={methodData?.iban || ''}
                                          onChange={(e) => {
                                            setAcceptedPaymentMethods(
                                              acceptedPaymentMethods.map(m =>
                                                m.method === method
                                                  ? { ...m, iban: e.target.value }
                                                  : m
                                              )
                                            );
                                          }}
                                          placeholder="Ex: FR76 1234 5678 9012 3456 7890 123"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                                          required={isSelected}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Nom de la banque *
                                        </label>
                                        <input
                                          type="text"
                                          value={methodData?.bankName || ''}
                                          onChange={(e) => {
                                            setAcceptedPaymentMethods(
                                              acceptedPaymentMethods.map(m =>
                                                m.method === method
                                                  ? { ...m, bankName: e.target.value }
                                                  : m
                                              )
                                            );
                                          }}
                                          placeholder="Ex: Banque Centrale"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                          required={isSelected}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Code SWIFT/BIC (optionnel)
                                        </label>
                                        <input
                                          type="text"
                                          value={methodData?.swiftCode || ''}
                                          onChange={(e) => {
                                            setAcceptedPaymentMethods(
                                              acceptedPaymentMethods.map(m =>
                                                m.method === method
                                                  ? { ...m, swiftCode: e.target.value }
                                                  : m
                                              )
                                            );
                                          }}
                                          placeholder="Ex: BNPAFRPP"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                                        />
                                      </div>
                                    </>
                                  );
                                }

                                // Western Union / MoneyGram
                                if (config.fields.recipientName) {
                                  return (
                                    <>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Nom complet du bénéficiaire *
                                        </label>
                                        <input
                                          type="text"
                                          value={methodData?.recipientName || ''}
                                          onChange={(e) => {
                                            setAcceptedPaymentMethods(
                                              acceptedPaymentMethods.map(m =>
                                                m.method === method
                                                  ? { ...m, recipientName: e.target.value }
                                                  : m
                                              )
                                            );
                                          }}
                                          placeholder="Ex: Jean Paul Dupont"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                          required={isSelected}
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pays *
                                          </label>
                                          <input
                                            type="text"
                                            value={methodData?.country || ''}
                                            onChange={(e) => {
                                              setAcceptedPaymentMethods(
                                                acceptedPaymentMethods.map(m =>
                                                  m.method === method
                                                    ? { ...m, country: e.target.value }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="Ex: Congo (RDC)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            required={isSelected}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ville *
                                          </label>
                                          <input
                                            type="text"
                                            value={methodData?.city || ''}
                                            onChange={(e) => {
                                              setAcceptedPaymentMethods(
                                                acceptedPaymentMethods.map(m =>
                                                  m.method === method
                                                    ? { ...m, city: e.target.value }
                                                    : m
                                                )
                                              );
                                            }}
                                            placeholder="Ex: Kinshasa"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            required={isSelected}
                                          />
                                        </div>
                                      </div>
                                    </>
                                  );
                                }

                                // Carte / Stripe / PayPal (pas de config)
                                if (config.category === 'card') {
                                  return (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                                      <CheckCircle size={16} className="inline mr-2" />
                                      Ce moyen de paiement est géré automatiquement. Aucune configuration supplémentaire nécessaire.
                                    </div>
                                  );
                                }

                                return null;
                              })()}

                              {/* Détails supplémentaires (optionnel pour tous) */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Instructions supplémentaires (optionnel)
                                </label>
                                <textarea
                                  value={methodData?.accountDetails || ''}
                                  onChange={(e) => {
                                    setAcceptedPaymentMethods(
                                      acceptedPaymentMethods.map(m =>
                                        m.method === method
                                          ? { ...m, accountDetails: e.target.value }
                                          : m
                                      )
                                    );
                                  }}
                                  rows={2}
                                  placeholder="Ex: Disponible de 8h à 18h, envoyer une capture d'écran après paiement..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {acceptedPaymentMethods.length === 0 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <AlertCircle size={16} />
                      <p>Veuillez sélectionner au moins une méthode de paiement</p>
                    </div>
                  )}

                  {acceptedPaymentMethods.length > 0 && acceptedPaymentMethods.some(m => {
                    const config = getPaymentMethodCategory(m.method);
                    if (!m.accountName) return true;
                    if (config.fields.phoneNumber && !m.phoneNumber) return true;
                    if (config.fields.walletAddress && (!m.walletAddress || !m.network)) return true;
                    if (config.fields.iban && (!m.iban || !m.bankName)) return true;
                    if (config.fields.recipientName && (!m.recipientName || !m.country || !m.city)) return true;
                    return false;
                  }) && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <AlertCircle size={16} />
                      <p>Veuillez configurer toutes les informations requises pour les moyens de paiement sélectionnés</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Inventory Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow"
          >
            <button
              type="button"
              onClick={() => toggleSection('inventory')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h2 className="text-xl font-bold">Inventaire</h2>
              {expandedSections.inventory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <AnimatePresence>
              {expandedSections.inventory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU (Référence)
                      </label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Ex: PROD-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantité minimale (MOQ) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={moq || 1}
                        onChange={(e) => setMoq(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock disponible *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stock || 0}
                        onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Shipping Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow"
          >
            <button
              type="button"
              onClick={() => toggleSection('shipping')}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h2 className="text-xl font-bold">Expédition</h2>
              {expandedSections.shipping ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <AnimatePresence>
              {expandedSections.shipping && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableSelect
                      label="Pays d'origine"
                      value={country}
                      onChange={setCountry}
                      options={COUNTRIES}
                      placeholder="Sélectionner un pays"
                      required
                      allowCustom
                    />

                    <EditableSelect
                      label="Délai de livraison"
                      value={deliveryTime}
                      onChange={setDeliveryTime}
                      options={DELIVERY_TIMES}
                      placeholder="Sélectionner un délai"
                      required
                      allowCustom
                    />
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certifications
                    </label>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <EditableSelect
                          value={certInput}
                          onChange={setCertInput}
                          options={CERTIFICATIONS}
                          placeholder="Sélectionner une certification"
                          allowCustom
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCertification}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {certifications.map(cert => (
                        <span
                          key={cert}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                        >
                          {cert}
                          <button
                            type="button"
                            onClick={() => setCertifications(certifications.filter(c => c !== cert))}
                            className="hover:text-green-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 justify-end"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Créer le produit
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <ProtectedRoute allowedRoles={['fournisseur']}>
      <NewProductContent />
    </ProtectedRoute>
  );
}
