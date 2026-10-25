'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Loader,
  Video as VideoIcon
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { HeroSlide } from '@/types';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { compressVideo, validateVideoFile, formatFileSize } from '@/lib/utils/videoCompression';

function AdminSlidesContent() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: 'En savoir plus',
    buttonLink: '/products',
    buttonColor: '#FF5722',
    backgroundColor: '#F5F5F5',
    mediaType: 'image' as 'image' | 'video',
    imageUrl: '',
    videoUrl: '',
    isActive: true,
    order: 0
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }
    if (user && user.role === 'admin') {
      loadSlides();
    }
  }, [user, loading, router]);

  const loadSlides = async () => {
    setLoadingSlides(true);
    try {
      const q = query(collection(db, 'heroSlides'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const slidesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as HeroSlide[];
      setSlides(slidesData);
    } catch (error) {
      console.error('Erreur chargement slides:', error);
      toast.error('Erreur lors du chargement des slides');
    } finally {
      setLoadingSlides(false);
    }
  };

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    
    if (isVideo) {
      // Validation vidéo
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Fichier vidéo invalide');
        return;
      }

      // Compression vidéo
      setCompressing(true);
      setCompressionProgress(0);
      
      try {
        toast.loading('Compression de la vidéo en cours...', { id: 'compression' });
        
        const result = await compressVideo(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          bitrate: 2500000
        }, (progress) => {
          setCompressionProgress(progress);
        });

        toast.success(
          `Vidéo compressée : ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (${result.compressionRatio.toFixed(1)}% de réduction)`,
          { id: 'compression', duration: 5000 }
        );

        setMediaFile(result.file);
        setMediaPreview(URL.createObjectURL(result.file));
        setFormData({ ...formData, mediaType: 'video' });
      } catch (error) {
        console.error('Erreur compression vidéo:', error);
        toast.error('Erreur lors de la compression de la vidéo', { id: 'compression' });
      } finally {
        setCompressing(false);
        setCompressionProgress(0);
      }
    } else {
      // Image
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData({ ...formData, mediaType: 'image' });
    }
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const folder = file.type.startsWith('video/') ? 'slides/videos' : 'slides/images';
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let mediaUrl = formData.mediaType === 'video' ? formData.videoUrl : formData.imageUrl;
      
      // Upload nouveau média si sélectionné
      if (mediaFile) {
        mediaUrl = await uploadMedia(mediaFile);
      }

      if (!mediaUrl && !editingSlide) {
        toast.error('Veuillez sélectionner une image ou une vidéo');
        setUploading(false);
        return;
      }

      const slideData = {
        title: formData.title,
        description: formData.description,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        buttonColor: formData.buttonColor,
        backgroundColor: formData.backgroundColor,
        mediaType: formData.mediaType,
        ...(formData.mediaType === 'video' ? {
          videoUrl: mediaUrl,
          imageUrl: null
        } : {
          imageUrl: mediaUrl,
          videoUrl: null
        }),
        isActive: formData.isActive,
        updatedAt: new Date(),
        ...(editingSlide ? {} : {
          createdAt: new Date(),
          createdBy: user!.id,
          order: slides.length
        })
      };

      if (editingSlide) {
        // Mise à jour
        await updateDoc(doc(db, 'heroSlides', editingSlide.id), slideData);
        toast.success('Slide mis à jour');
      } else {
        // Création
        await addDoc(collection(db, 'heroSlides'), slideData);
        toast.success('Slide créé');
      }

      setShowModal(false);
      resetForm();
      loadSlides();
    } catch (error) {
      console.error('Erreur sauvegarde slide:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      buttonText: 'En savoir plus',
      buttonLink: '/products',
      buttonColor: '#FF5722',
      backgroundColor: '#F5F5F5',
      mediaType: 'image',
      imageUrl: '',
      videoUrl: '',
      isActive: true,
      order: 0
    });
    setMediaFile(null);
    setMediaPreview('');
    setEditingSlide(null);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      buttonColor: slide.buttonColor,
      backgroundColor: slide.backgroundColor,
      mediaType: slide.mediaType,
      imageUrl: slide.imageUrl || '',
      videoUrl: slide.videoUrl || '',
      isActive: slide.isActive,
      order: slide.order
    });
    setMediaPreview(slide.videoUrl || slide.imageUrl || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce slide ?')) return;
    
    try {
      await deleteDoc(doc(db, 'heroSlides', id));
      toast.success('Slide supprimé');
      loadSlides();
    } catch (error) {
      console.error('Erreur suppression slide:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      await updateDoc(doc(db, 'heroSlides', slide.id), {
        isActive: !slide.isActive,
        updatedAt: new Date()
      });
      toast.success(slide.isActive ? 'Slide désactivé' : 'Slide activé');
      loadSlides();
    } catch (error) {
      console.error('Erreur toggle active:', error);
      toast.error('Erreur');
    }
  };

  const moveSlide = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slide.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    try {
      const targetSlide = slides[targetIndex];
      
      await updateDoc(doc(db, 'heroSlides', slide.id), { order: targetIndex });
      await updateDoc(doc(db, 'heroSlides', targetSlide.id), { order: currentIndex });
      
      toast.success('Ordre modifié');
      loadSlides();
    } catch (error) {
      console.error('Erreur changement ordre:', error);
      toast.error('Erreur');
    }
  };

  if (loading || loadingSlides) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Slides</h1>
          <p className="text-gray-600 mt-1">Gérez les slides de la page d'accueil</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Nouveau Slide
        </button>
      </div>

      {/* Liste des slides */}
      <div className="grid gap-4">
        {slides.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <ImageIcon className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-gray-500 text-lg">Aucun slide pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">Créez votre premier slide pour la page d'accueil</p>
          </div>
        ) : (
          slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex gap-6">
                {/* Media preview */}
                <div className="flex-shrink-0">
                  {slide.mediaType === 'video' && slide.videoUrl ? (
                    <div className="relative">
                      <video
                        src={slide.videoUrl}
                        className="w-40 h-40 object-cover rounded-lg"
                        muted
                        loop
                      />
                      <VideoIcon className="absolute top-2 right-2 text-white bg-black bg-opacity-50 p-1 rounded" size={20} />
                    </div>
                  ) : (
                    <img
                      src={slide.imageUrl || slide.videoUrl || ''}
                      alt={slide.title}
                      className="w-40 h-40 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{slide.title}</h3>
                      <p className="text-gray-600 mt-1">{slide.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      slide.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {slide.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: slide.backgroundColor }}
                      />
                      <span className="text-sm text-gray-600">Fond: {slide.backgroundColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: slide.buttonColor }}
                      />
                      <span className="text-sm text-gray-600">Bouton: {slide.buttonColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      style={{ backgroundColor: slide.buttonColor }}
                      className="px-4 py-2 text-white rounded-lg text-sm font-semibold"
                    >
                      {slide.buttonText}
                    </button>
                    <span className="text-sm text-gray-500">→ {slide.buttonLink}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleActive(slide)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={slide.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {slide.isActive ? (
                      <Eye size={20} className="text-green-600" />
                    ) : (
                      <EyeOff size={20} className="text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit size={20} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={20} className="text-red-600" />
                  </button>
                  <div className="border-t pt-2 mt-2">
                    <button
                      onClick={() => moveSlide(slide, 'up')}
                      disabled={index === 0}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Monter"
                    >
                      <ArrowUp size={20} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => moveSlide(slide, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Descendre"
                    >
                      <ArrowDown size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingSlide ? 'Modifier le slide' : 'Nouveau slide'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Découvrez nos nouveautés"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Courte description du slide"
                  />
                </div>

                {/* Couleurs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur de fond
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-full h-10 border rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur du bouton
                    </label>
                    <input
                      type="color"
                      value={formData.buttonColor}
                      onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                      className="w-full h-10 border rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Bouton */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte du bouton
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien du bouton
                    </label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="/products"
                    />
                  </div>
                </div>

                {/* Type de média */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de média *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="image"
                        checked={formData.mediaType === 'image'}
                        onChange={(e) => setFormData({ ...formData, mediaType: 'image' })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <ImageIcon size={20} />
                      <span>Image</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="video"
                        checked={formData.mediaType === 'video'}
                        onChange={(e) => setFormData({ ...formData, mediaType: 'video' })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <VideoIcon size={20} />
                      <span>Vidéo</span>
                    </label>
                  </div>
                </div>

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.mediaType === 'video' ? 'Vidéo' : 'Image'} {!editingSlide && '*'}
                  </label>
                  {formData.mediaType === 'video' && (
                    <p className="text-xs text-gray-500 mb-2">
                      💡 La vidéo sera automatiquement compressée pour optimiser la taille (max 100 MB)
                    </p>
                  )}
                  <input
                    type="file"
                    accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleMediaChange}
                    disabled={compressing}
                    className="w-full px-4 py-2 border rounded-lg disabled:opacity-50"
                  />
                  
                  {compressing && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Compression en cours...</span>
                        <span>{compressionProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${compressionProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {mediaPreview && !compressing && (
                    <div className="mt-4">
                      {formData.mediaType === 'video' ? (
                        <video
                          src={mediaPreview}
                          controls
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Actif */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Slide actif (visible sur la page d'accueil)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || compressing}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading || compressing ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        {compressing ? 'Compression...' : 'Enregistrement...'}
                      </>
                    ) : (
                      editingSlide ? 'Mettre à jour' : 'Créer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function AdminSlidesPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminSlidesContent />
    </ProtectedRoute>
  );
}
