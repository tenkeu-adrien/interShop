'use client';

import { useState, useRef } from 'react';
import { Camera, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadImage } from '@/lib/firebase/storage';
import { analyzeImage } from '@/lib/services/imageSearchService';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function ImageSearchButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 5MB)');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload l'image sur Firebase Storage
      toast.loading('Upload de l\'image...', { id: 'image-search' });
      const imageUrl = await uploadImage(
        file,
        'image-search',
        () => {} // Pas besoin de progress pour la recherche
      );

      // 2. Analyser l'image avec Cloud Vision API
      toast.loading('Analyse de l\'image avec l\'IA...', { id: 'image-search' });
      const { labels, colors } = await analyzeImage(imageUrl);

      if (labels.length === 0) {
        toast.error('Impossible d\'analyser l\'image. Essayez une autre photo.', { id: 'image-search' });
        return;
      }

      toast.success('Image analysée avec succès!', { id: 'image-search' });

      // 3. Rediriger vers la page de résultats avec les paramètres
      const searchParams = new URLSearchParams({
        imageSearch: 'true',
        labels: labels.join(','),
        colors: colors.join(','),
        imageUrl: imageUrl, // Pour afficher l'image recherchée
      });
      
      router.push(`/products?${searchParams.toString()}`);
    } catch (error: any) {
      console.error('Error searching by image:', error);
      toast.error(error.message || 'Erreur lors de la recherche', { id: 'image-search' });
    } finally {
      setLoading(false);
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      {/* Bouton Caméra */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Rechercher par image"
        aria-label="Rechercher par image"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Camera size={20} />
        )}
      </button>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
        disabled={loading}
        aria-label="Sélectionner une image"
      />
    </>
  );
}
