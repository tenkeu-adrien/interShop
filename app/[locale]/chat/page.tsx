'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { ChatList } from '@/components/chat/ChatList';
import { MessageCircle, ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { subscribeTotalUnreadCount, unsubscribeTotalUnreadCount } = useChatStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    subscribeTotalUnreadCount(user.id);

    return () => {
      unsubscribeTotalUnreadCount();
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageCircle className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">Vos conversations</p>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <ChatList />
        </div>
      </div>
    </div>
  );
}
