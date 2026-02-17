'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { getOrCreateConversation } from '@/lib/firebase/chat';
import { MessageCircle, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductReference } from '@/types/chat';

interface ProductChatActionsProps {
  product: {
    id: string;
    name: string;
    images: string[];
    fournisseurId: string;
    prices?: Array<{ price: number; currency: string }>;
  };
  fournisseur: {
    name: string;
    photo?: string;
  };
  className?: string;
}

export function ProductChatActions({ 
  product, 
  fournisseur,
  className = '' 
}: ProductChatActionsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { sendTextMessage } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const productReference: ProductReference = {
    productId: product.id,
    productName: product.name,
    productImage: product.images[0],
    productPrice: product.prices?.[0]?.price,
    productCurrency: product.prices?.[0]?.currency,
  };

  const handleStartChat = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour envoyer un message');
      router.push('/login');
      return;
    }

    if (user.id === product.fournisseurId) {
      toast.error('Vous ne pouvez pas vous envoyer un message à vous-même');
      return;
    }

    setLoading(true);
    try {
      const conversationId = await getOrCreateConversation(
        user.id,
        product.fournisseurId,
        {
          name: user.displayName,
          photo: user.photoURL || undefined,
          role: user.role,
        },
        {
          name: fournisseur.name,
          photo: fournisseur.photo,
          role: 'fournisseur',
        },
        productReference
      );

      // Envoyer un message automatique avec le produit
      await sendTextMessage(
        conversationId,
        user.id,
        user.displayName,
        user.photoURL || undefined,
        product.fournisseurId,
        `Bonjour, je suis intéressé par ce produit.`,
        'product',
        undefined,
        undefined,
        undefined,
        undefined,
        productReference
      );

      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Erreur lors de l\'ouverture du chat');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour demander un devis');
      router.push('/login');
      return;
    }

    if (user.id === product.fournisseurId) {
      toast.error('Vous ne pouvez pas demander un devis pour votre propre produit');
      return;
    }

    setLoadingQuote(true);
    try {
      const conversationId = await getOrCreateConversation(
        user.id,
        product.fournisseurId,
        {
          name: user.displayName,
          photo: user.photoURL || undefined,
          role: user.role,
        },
        {
          name: fournisseur.name,
          photo: fournisseur.photo,
          role: 'fournisseur',
        },
        productReference
      );

      // Envoyer une demande de devis
      await sendTextMessage(
        conversationId,
        user.id,
        user.displayName,
        user.photoURL || undefined,
        product.fournisseurId,
        `Je souhaiterais recevoir un devis détaillé pour ce produit. Merci de me communiquer vos meilleures conditions.`,
        'quote_request',
        undefined,
        undefined,
        undefined,
        undefined,
        productReference
      );

      toast.success('Demande de devis envoyée avec succès');
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error requesting quote:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoadingQuote(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Bouton Discuter */}
      <button
        onClick={handleStartChat}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Chargement...
          </>
        ) : (
          <>
            <MessageCircle size={20} />
            Discuter avec le vendeur
          </>
        )}
      </button>

      {/* Bouton Demander un Devis */}
      <button
        onClick={handleRequestQuote}
        disabled={loadingQuote}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loadingQuote ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Envoi...
          </>
        ) : (
          <>
            <FileText size={20} />
            Demander un devis
          </>
        )}
      </button>
    </div>
  );
}
