'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { MessageCircle, Search, Loader2, Package, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ConversationType, getConversationTypeLabel, getConversationTypeIcon, getConversationTypeColor } from '@/types/chat';

export function ChatList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { conversations, loading, subscribeConversations, unsubscribeConversations } = useChatStore();
  const [selectedFilter, setSelectedFilter] = useState<ConversationType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      subscribeConversations(user.id);
    }
    
    return () => {
      unsubscribeConversations();
    };
  }, [user]);

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const getOtherParticipant = (conversation: any) => {
    const otherUserId = conversation.participants.find((id: string) => id !== user?.id);
    return conversation.participantsData[otherUserId];
  };

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conv => {
    // Filtre par type
    if (selectedFilter !== 'all' && conv.context?.type !== selectedFilter) {
      return false;
    }

    // Filtre par recherche
    if (searchQuery) {
      const otherUser = getOtherParticipant(conv);
      const searchLower = searchQuery.toLowerCase();
      return (
        otherUser?.name?.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.content?.toLowerCase().includes(searchLower) ||
        conv.context?.metadata?.productName?.toLowerCase().includes(searchLower) ||
        conv.context?.metadata?.orderNumber?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Compter les conversations par type
  const countByType = (type: ConversationType | 'all') => {
    if (type === 'all') return conversations.length;
    return conversations.filter(conv => conv.context?.type === type).length;
  };

  const filters: Array<{ type: ConversationType | 'all'; label: string; icon: string }> = [
    { type: 'all', label: 'Tous', icon: '💬' },
    { type: 'order', label: 'Commandes', icon: '🛒' },
    { type: 'product_inquiry', label: 'Produits', icon: '📦' },
    { type: 'dating_inquiry', label: 'Rencontres', icon: '❤️' },
    { type: 'hotel_inquiry', label: 'Hôtels', icon: '🏨' },
    { type: 'restaurant_inquiry', label: 'Restaurants', icon: '🍽️' },
  ];

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher une conversation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filtres par type */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => {
          const count = countByType(filter.type);
          if (count === 0 && filter.type !== 'all') return null;
          
          return (
            <button
              key={filter.type}
              onClick={() => setSelectedFilter(filter.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedFilter === filter.type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{filter.icon}</span>
              <span className="font-medium">{filter.label}</span>
              {count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedFilter === filter.type
                    ? 'bg-white/20'
                    : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Liste des conversations */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchQuery ? 'Aucun résultat' : 'Aucune conversation'}
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Essayez avec d\'autres mots-clés'
              : 'Commencez à discuter avec un fournisseur en visitant un produit'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            const unreadCount = conversation.unreadCount[user?.id || ''] || 0;
            const lastMessage = conversation.lastMessage;
            const context = conversation.context;

            return (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="w-full p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition-colors text-left border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {otherUser?.photo ? (
                      <img
                        src={otherUser.photo}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {otherUser?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {otherUser?.name}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      )}
                    </div>
                    
                    {/* Badge de type + rôle */}
                    <div className="flex items-center gap-2 mb-1">
                      {context && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getConversationTypeColor(context.type)}`}>
                          {getConversationTypeIcon(context.type)} {getConversationTypeLabel(context.type)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 capitalize">
                        {otherUser?.role}
                      </span>
                    </div>

                    {/* Contexte (commande, produit, etc.) */}
                    {context?.metadata && (
                      <div className="text-xs text-gray-600 mb-1">
                        {context.metadata.orderNumber && (
                          <span>📋 Commande #{context.metadata.orderNumber}</span>
                        )}
                        {context.metadata.productName && (
                          <span className="truncate">📦 {context.metadata.productName}</span>
                        )}
                        {context.metadata.profileName && (
                          <span className="truncate">👤 {context.metadata.profileName}</span>
                        )}
                        {context.metadata.hotelName && (
                          <span className="truncate">🏨 {context.metadata.hotelName}</span>
                        )}
                        {context.metadata.restaurantName && (
                          <span className="truncate">🍽️ {context.metadata.restaurantName}</span>
                        )}
                      </div>
                    )}

                    {/* Dernier message */}
                    {lastMessage && (
                      <p className={`text-sm truncate ${
                        unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                      }`}>
                        {lastMessage.senderId === user?.id && 'Vous: '}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
