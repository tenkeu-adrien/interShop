'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useTranslations } from 'next-intl';
import { MessageSquare, ChevronLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Conversation } from '@/types/chat';
export default function AdminMessagesPage() {
  const { user } = useAuthStore();
  const { conversations, loading, subscribeConversations, unsubscribeConversations } = useChatStore();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    subscribeConversations(user.id);
    return () => unsubscribeConversations();
  }, [user]);

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const names = Object.values(c.participantsData ?? {}).map(p => p.name).join(' ').toLowerCase();
    return names.includes(search.toLowerCase());
  });

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const d = ts instanceof Date ? ts : new Date(ts);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getUnread = (conv: Conversation) => {
    if (!user || !conv.unreadCount) return 0;
    return conv.unreadCount[user.id] ?? 0;
  };

  const getNames = (conv: Conversation) => {
    return Object.values(conv.participantsData ?? {}).map(p => p.name).join(' & ') || conv.id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="text-indigo-600" size={40} />
              {tAdmin('messages') || 'Messages'}
            </h1>
            <p className="text-gray-600 mt-1">{conversations.length} conversation(s)</p>
          </div>
          <Link
            href="/dashboard/admin"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            {tCommon('back')}
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <MessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">Aucune conversation</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filtered.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/chat/${conv.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getNames(conv).charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 truncate">
                        {getNames(conv)}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessage?.createdAt ?? conv.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage?.content ?? '...'}</p>
                  </div>

                  {/* Unread badge */}
                  {getUnread(conv) > 0 ? (
                    <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                      {getUnread(conv)}
                    </span>
                  ) : null}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
