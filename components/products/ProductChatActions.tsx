'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { getOrCreateConversation } from '@/lib/firebase/chat';
import { MessageCircle, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductReference } from '@/types/chat';
import { useTranslations } from 'next-intl';

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
  const tCommon = useTranslations('common');
  const tChat = useTranslations('chat');

  const productReference: ProductReference = {
    productId: product.id,
    productName: product.name,
    productImage: product.images[0],
    productPrice: product.prices?.[0]?.price,
    productCurrency: product.prices?.[0]?.currency,
  };

  const conversationContext = {
    type: 'product_inquiry' as const,
    productId: product.id,
    metadata: {
      productName: product.name,
      productImage: product.images[0],
      productPrice: product.prices?.[0]?.price,
      productCurrency: product.prices?.[0]?.currency,
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      toast.error(tChat('login_required'));
      router.push('/login');
      return;
    }

    if (user.id === product.fournisseurId) {
      toast.error(tChat('cannot_message_self'));
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
        conversationContext
      );

      await sendTextMessage(
        conversationId,
        user.id,
        user.displayName,
        user.photoURL || undefined,
        product.fournisseurId,
        tChat('interested_message'),
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
      toast.error(tChat('error_opening_chat'));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async () => {
    if (!user) {
      toast.error(tChat('login_required_quote'));
      router.push('/login');
      return;
    }

    if (user.id === product.fournisseurId) {
      toast.error(tChat('cannot_quote_own_product'));
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
        conversationContext
      );

      await sendTextMessage(
        conversationId,
        user.id,
        user.displayName,
        user.photoURL || undefined,
        product.fournisseurId,
        tChat('quote_request_message'),
        'quote_request',
        undefined,
        undefined,
        undefined,
        undefined,
        productReference
      );

      toast.success(tChat('quote_sent_success'));
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error requesting quote:', error);
      toast.error(tChat('error_sending_request'));
    } finally {
      setLoadingQuote(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <button
        onClick={handleStartChat}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {tCommon('loading')}
          </>
        ) : (
          <>
            <MessageCircle size={20} />
            {tChat('chat_with_seller')}
          </>
        )}
      </button>

      <button
        onClick={handleRequestQuote}
        disabled={loadingQuote}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loadingQuote ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {tCommon('loading')}
          </>
        ) : (
          <>
            <FileText size={20} />
            {tChat('request_quote')}
          </>
        )}
      </button>
    </div>
  );
}
