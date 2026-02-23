'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Loader2, X, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  createProductInquiryConversation,
  createDatingInquiryConversation,
  createHotelInquiryConversation,
  createRestaurantInquiryConversation,
} from '@/lib/firebase/chatHelpers';
import { sendMessage } from '@/lib/firebase/chat';

interface ContactButtonProps {
  type: 'product' | 'dating' | 'hotel' | 'restaurant';
  ownerId: string;
  ownerName: string;
  ownerPhoto?: string;
  ownerRole: string;
  itemId: string;
  itemName: string;
  itemImage?: string;
  className?: string;
  fullWidth?: boolean;
}

export function ContactButton({
  type,
  ownerId,
  ownerName,
  ownerPhoto,
  ownerRole,
  itemId,
  itemName,
  itemImage,
  className = '',
  fullWidth = true,
}: ContactButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  const getDefaultMessage = () => {
    switch (type) {
      case 'product':
        return `Bonjour, je peux en savoir plus sur ce produit : ${itemName} ?`;
      case 'dating':
        return `Bonjour, je souhaiterais obtenir plus d'informations sur ce profil.`;
      case 'hotel':
        return `Bonjour, je souhaiterais obtenir plus d'informations sur votre hôtel : ${itemName}.`;
      case 'restaurant':
        return `Bonjour, je souhaiterais obtenir plus d'informations sur votre restaurant : ${itemName}.`;
      default:
        return 'Bonjour, je souhaiterais obtenir plus d\'informations.';
    }
  };

  const handleOpenModal = () => {
    if (!user) {
      toast.error('Vous devez être connecté pour contacter');
      router.push('/login');
      return;
    }

    if (user.id === ownerId) {
      toast.error('Vous ne pouvez pas vous contacter vous-même');
      return;
    }

    setMessage(getDefaultMessage());
    setShowModal(true);
  };

  const handleContact = async () => {
    if (!message.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }

    setLoading(true);

    try {
      const clientData = {
        name: user!.displayName || 'Utilisateur',
        photo: user!.photoURL,
        role: user!.role,
      };

      const ownerData = {
        name: ownerName,
        photo: ownerPhoto,
        role: ownerRole,
      };

      let conversationId: string;

      switch (type) {
        case 'product':
          conversationId = await createProductInquiryConversation(
            user!.id,
            ownerId,
            clientData,
            ownerData,
            itemId,
            itemName,
            itemImage
          );
          break;

        case 'dating':
          conversationId = await createDatingInquiryConversation(
            user!.id,
            ownerId,
            clientData,
            ownerData,
            itemId,
            itemName
          );
          break;

        case 'hotel':
          conversationId = await createHotelInquiryConversation(
            user!.id,
            ownerId,
            clientData,
            ownerData,
            itemId,
            itemName
          );
          break;

        case 'restaurant':
          conversationId = await createRestaurantInquiryConversation(
            user!.id,
            ownerId,
            clientData,
            ownerData,
            itemId,
            itemName
          );
          break;

        default:
          throw new Error('Type de contact non supporté');
      }

      // Envoyer le message initial
      await sendMessage(
        conversationId,
        user!.id,
        user!.displayName || 'Utilisateur',
        user!.photoURL,
        ownerId,
        message.trim()
      );

      toast.success('Message envoyé avec succès');
      setShowModal(false);
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'product':
        return 'Discuter avec le vendeur';
      case 'dating':
        return 'Demander le contact';
      case 'hotel':
        return 'Contacter l\'hôtel';
      case 'restaurant':
        return 'Contacter le restaurant';
      default:
        return 'Contacter';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'product':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'dating':
        return 'bg-pink-500 hover:bg-pink-600';
      case 'hotel':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'restaurant':
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getModalColor = () => {
    switch (type) {
      case 'product':
        return 'blue';
      case 'dating':
        return 'pink';
      case 'hotel':
        return 'purple';
      case 'restaurant':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const color = getModalColor();

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={loading}
        className={`${
          fullWidth ? 'w-full' : ''
        } ${getButtonColor()} text-white py-3 px-6 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <MessageCircle size={24} />
        {getButtonText()}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className={`bg-${color}-500 text-white p-6 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle size={28} />
                    <div>
                      <h2 className="text-xl font-bold">Envoyer un message</h2>
                      <p className="text-sm opacity-90">à {ownerName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Item Preview */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                  {itemImage && (
                    <img
                      src={itemImage}
                      alt={itemName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">
                      {type === 'product' && 'Produit'}
                      {type === 'dating' && 'Profil'}
                      {type === 'hotel' && 'Hôtel'}
                      {type === 'restaurant' && 'Restaurant'}
                    </p>
                    <p className="font-semibold text-gray-900 truncate">{itemName}</p>
                  </div>
                </div>

                {/* Message Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Saisissez votre message..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {message.length} caractères
                  </p>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 Vous pouvez modifier ce message avant de l'envoyer. Soyez clair et précis dans votre demande.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleContact}
                    disabled={loading || !message.trim()}
                    className={`flex-1 px-4 py-3 bg-${color}-500 text-white rounded-lg font-semibold hover:bg-${color}-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Envoyer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
