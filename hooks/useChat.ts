import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { subscribeToUserConversations } from '@/lib/firebase/chat';

export function useChat() {
  const { user } = useAuthStore();
  const { conversations, loadConversations } = useChatStore();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserConversations(user.id, (newConversations) => {
      // Le store gère déjà les conversations via loadConversations
      loadConversations(user.id);
    });

    return () => unsubscribe();
  }, [user, loadConversations]);

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount[user?.id || ''] || 0),
    0
  );

  return { conversations, totalUnread };
}
