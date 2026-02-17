'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { MessageCircle, Search, Loader2, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ChatList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { conversations, loading, subscribeConversations, unsubscribeConversations } = useChatStore();

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

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="mx-auto text-gray-300 mb-4" size={64} />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune conversation</h3>
        <p className="text-gray-600">
          Commencez à discuter avec un fournisseur en visitant un produit
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherUser = getOtherParticipant(conversation);
        const unreadCount = conversation.unreadCount[user?.id || ''] || 0;
        const lastMessage = conversation.lastMessage;

        return (
          <button
            key={conversation.id}
            onClick={() => handleConversationClick(conversation.id)}
            className="w-full p-4 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition-colors text-left"
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
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 capitalize">
                    {otherUser?.role}
                  </span>
                </div>

                {/* Product Context */}
                {conversation.productContext && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-blue-600">
                    <Package size={12} />
                    <span className="truncate">{conversation.productContext.productName}</span>
                  </div>
                )}

                {lastMessage && (
                  <p className={`text-sm truncate mt-1 ${
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
  );
}
