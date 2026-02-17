'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getConversation } from '@/lib/firebase/chat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Loader2 } from 'lucide-react';
import { Conversation } from '@/types/chat';

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadConversation();
  }, [params.id, user]);

  const loadConversation = async () => {
    if (!params.id || !user) return;

    setLoading(true);
    try {
      const conv = await getConversation(params.id as string);
      if (conv) {
        setConversation(conv);
      } else {
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      router.push('/chat');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!conversation || !user) return null;

  const otherUserId = conversation.participants.find(id => id !== user.id);
  const otherUser = otherUserId ? conversation.participantsData[otherUserId] : null;

  if (!otherUser) return null;

  return (
    <div className="h-screen flex flex-col">
      <ChatWindow
        conversationId={conversation.id}
        receiverId={otherUserId!}
        receiverName={otherUser.name}
        receiverPhoto={otherUser.photo}
        productContext={conversation.productContext}
      />
    </div>
  );
}
