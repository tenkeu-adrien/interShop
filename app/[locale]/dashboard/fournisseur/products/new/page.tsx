'use client';

import { useState } from 'react';
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
import { Product, PriceTier } from '@/types';
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
  Loader,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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

  // Sections collapse state
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    media: true,
    pricing: true,
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
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Ajouter un tag"
                      />
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays d'origine *
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Ex: Chine"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Délai de livraison *
                      </label>
                      <input
                        type="text"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Ex: 7-15 jours"
                        required
                      />
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certifications
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={certInput}
                        onChange={(e) => setCertInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Ex: CE, ISO 9001"
                      />
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
