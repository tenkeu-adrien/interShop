'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Send, 
  Image as ImageIcon, 
  Video, 
  Paperclip, 
  Loader2,
  X,
  Download,
  ArrowLeft,
  Package,
  FileText,
  ExternalLink,
  Heart,
  Hotel as HotelIcon,
  UtensilsCrossed
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Conversation } from '@/types/chat';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  conversationId: string;
  receiverId: string;
  receiverName: string;
  receiverPhoto?: string;
  conversation?: Conversation;
  productContext?: {
    productId: string;
    productName: string;
    productImage?: string;
  };
}

export function ChatWindow({ 
  conversationId, 
  receiverId, 
  receiverName,
  receiverPhoto,
  conversation,
  productContext
}: ChatWindowProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    messages,
    sending,
    subscribeMessages,
    unsubscribeMessages,
    sendTextMessage,
    sendImageMessage,
    sendVideoMessage,
    sendFileMessage,
    markAsRead,
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (conversationId) {
      subscribeMessages(conversationId);
      
      // Mark messages as read
      if (user) {
        markAsRead(conversationId, user.id);
      }
    }

    return () => {
      unsubscribeMessages();
    };
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!user) return;

    try {
      if (selectedFile) {
        // Send file message
        const fileType = selectedFile.type;
        
        if (fileType.startsWith('image/')) {
          await sendImageMessage(
            conversationId,
            user.id,
            user.displayName,
            user.photoURL || undefined,
            receiverId,
            selectedFile
          );
        } else if (fileType.startsWith('video/')) {
          await sendVideoMessage(
            conversationId,
            user.id,
            user.displayName,
            user.photoURL || undefined,
            receiverId,
            selectedFile
          );
        } else {
          await sendFileMessage(
            conversationId,
            user.id,
            user.displayName,
            user.photoURL || undefined,
            receiverId,
            selectedFile
          );
        }
        
        setSelectedFile(null);
        setFilePreview(null);
      } else if (messageText.trim()) {
        // Send text message
        await sendTextMessage(
          conversationId,
          user.id,
          user.displayName,
          user.photoURL || undefined,
          receiverId,
          messageText.trim()
        );
        setMessageText('');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB for images, 50MB for videos)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Fichier trop volumineux (max ${maxSize / (1024 * 1024)}MB)`);
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get context link and icon based on conversation type
  const getContextInfo = () => {
    if (!conversation?.context) return null;

    const { context } = conversation;
    let link = '';
    let icon = null;
    let label = '';
    let name = '';

    switch (context.type) {
      case 'product_inquiry':
        if (context.productId) {
          link = `/products/${context.productId}`;
          icon = <Package size={14} className="text-blue-600" />;
          label = 'Voir le produit';
          name = context.metadata?.productName || 'Produit';
        }
        break;
      
      case 'dating_inquiry':
        if (context.datingProfileId) {
          link = `/dating/${context.datingProfileId}`;
          icon = <Heart size={14} className="text-pink-600" />;
          label = 'Voir le profil';
          name = context.metadata?.profileName || 'Profil';
        }
        break;
      
      case 'hotel_inquiry':
        if (context.hotelId) {
          link = `/hotels/${context.hotelId}`;
          icon = <HotelIcon size={14} className="text-purple-600" />;
          label = 'Voir l\'hôtel';
          name = context.metadata?.hotelName || 'Hôtel';
        }
        break;
      
      case 'restaurant_inquiry':
        if (context.restaurantId) {
          link = `/restaurants/${context.restaurantId}`;
          icon = <UtensilsCrossed size={14} className="text-orange-600" />;
          label = 'Voir le restaurant';
          name = context.metadata?.restaurantName || 'Restaurant';
        }
        break;
      
      case 'order':
        if (context.orderId) {
          // Assuming orders page exists
          link = `/orders/${context.orderId}`;
          icon = <Package size={14} className="text-green-600" />;
          label = 'Voir la commande';
          name = `Commande #${context.metadata?.orderNumber || context.orderId}`;
        }
        break;
    }

    return link ? { link, icon, label, name } : null;
  };

  const contextInfo = getContextInfo();

  const renderMessage = (message: any) => {
    const isOwn = message.senderId === user?.id;

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {!isOwn && (
            <div className="flex-shrink-0">
              {receiverPhoto ? (
                <img
                  src={receiverPhoto}
                  alt={receiverName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {receiverName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <div>
            <div
              className={`rounded-lg px-4 py-2 ${
                isOwn
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {/* Product Reference */}
              {message.productReference && (
                <Link
                  href={`/products/${message.productReference.productId}`}
                  target="_blank"
                  className={`block mb-2 p-3 rounded-lg border-2 ${
                    isOwn 
                      ? 'bg-blue-600 border-blue-400 hover:bg-blue-700' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={message.productReference.productImage}
                      alt={message.productReference.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === 'quote_request' ? (
                          <FileText size={16} className={isOwn ? 'text-blue-200' : 'text-blue-500'} />
                        ) : (
                          <Package size={16} className={isOwn ? 'text-blue-200' : 'text-blue-500'} />
                        )}
                        <p className={`font-semibold text-sm truncate ${
                          isOwn ? 'text-white' : 'text-gray-900'
                        }`}>
                          {message.productReference.productName}
                        </p>
                      </div>
                      {message.productReference.productPrice && (
                        <p className={`text-sm font-bold ${
                          isOwn ? 'text-blue-100' : 'text-blue-600'
                        }`}>
                          {message.productReference.productPrice} {message.productReference.productCurrency}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <ExternalLink size={12} className={isOwn ? 'text-blue-200' : 'text-gray-500'} />
                        <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                          Cliquer pour voir le produit
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Quote Request Badge */}
              {message.type === 'quote_request' && (
                <div className={`flex items-center gap-2 mb-2 px-2 py-1 rounded ${
                  isOwn ? 'bg-blue-600' : 'bg-yellow-100'
                }`}>
                  <FileText size={14} className={isOwn ? 'text-yellow-300' : 'text-yellow-600'} />
                  <span className={`text-xs font-semibold ${
                    isOwn ? 'text-yellow-300' : 'text-yellow-600'
                  }`}>
                    Demande de devis
                  </span>
                </div>
              )}

              {message.type === 'text' && (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}

              {message.type === 'image' && (
                <div>
                  <img
                    src={message.fileUrl}
                    alt="Image"
                    className="max-w-full rounded cursor-pointer"
                    onClick={() => window.open(message.fileUrl, '_blank')}
                  />
                  <p className="text-xs mt-1 opacity-75">Cliquez pour agrandir</p>
                </div>
              )}

              {message.type === 'video' && (
                <div>
                  <video
                    src={message.fileUrl}
                    controls
                    className="max-w-full rounded"
                  />
                </div>
              )}

              {message.type === 'file' && (
                <a
                  href={message.fileUrl}
                  download={message.fileName}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Paperclip size={16} />
                  <span>{message.fileName}</span>
                  <Download size={16} />
                </a>
              )}
            </div>

            <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}>
              <span>
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
              {isOwn && message.isRead && (
                <span className="text-blue-500">✓✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.back()}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          
          {receiverPhoto ? (
            <img
              src={receiverPhoto}
              alt={receiverName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {receiverName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900">{receiverName}</h2>
            <p className="text-sm text-gray-500">En ligne</p>
          </div>
        </div>

        {/* Context Link (Product, Dating, Hotel, Restaurant, Order) */}
        {contextInfo && (
          <Link
            href={contextInfo.link}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg hover:shadow-md transition-all"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
              {contextInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {contextInfo.name}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ExternalLink size={12} className="text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">{contextInfo.label}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Legacy Product Context (for backward compatibility) */}
        {!contextInfo && productContext && (
          <Link
            href={`/products/${productContext.productId}`}
            className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <img
              src={productContext.productImage}
              alt={productContext.productName}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Package size={14} className="text-blue-600" />
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {productContext.productName}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <ExternalLink size={12} className="text-blue-600" />
                <span className="text-xs text-blue-600">Voir le produit</span>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Aucun message pour le moment</p>
            <p className="text-sm mt-2">Envoyez un message pour commencer la conversation</p>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <Paperclip size={24} className="text-gray-500" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end gap-2">
          {/* File Buttons */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
            title="Joindre un fichier"
          >
            <Paperclip size={20} />
          </button>

          {/* Text Input */}
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={sending || (!messageText.trim() && !selectedFile)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
