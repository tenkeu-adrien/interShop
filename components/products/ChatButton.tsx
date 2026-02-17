'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getOrCreateConversation } from '@/lib/firebase/chat';
import { MessageCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatButtonProps {
  fournisseurId: string;
  fournisseurName: string;
  fournisseurPhoto?: string;
  productName?: string;
  className?: string;
}

export function ChatButton({
  fournisseurId,
  fournisseurName,
  fournisseurPhoto,
  productName,
  className = '',
}: ChatButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour envoyer un message');
      router.push('/login');
      return;
    }

    if (user.id === fournisseurId) {
      toast.error('Vous ne pouvez pas vous envoyer un message à vous-même');
      return;
    }

    setLoading(true);
    try {
      const conversationId = await getOrCreateConversation(
        user.id,
        fournisseurId,
        {
          name: user.displayName,
          photo: user.photoURL || undefined,
          role: user.role,
        },
        {
          name: fournisseurName,
          photo: fournisseurPhoto,
          role: 'fournisseur',
        }
      );

      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Erreur lors de l\'ouverture du chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Chargement...
        </>
      ) : (
        <>
          <MessageCircle size={20} />
          Contacter le vendeur
        </>
      )}
    </button>
  );
}
