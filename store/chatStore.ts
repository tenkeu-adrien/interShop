import { create } from 'zustand';
import { Conversation, ChatMessage, MessageType, ProductReference } from '@/types/chat';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToUserConversations,
  subscribeToConversationMessages,
  subscribeToTotalUnreadCount,
  uploadChatImage,
  uploadChatVideo,
  uploadChatFile,
} from '@/lib/firebase/chat';

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  totalUnreadCount: number;
  loading: boolean;
  sending: boolean;
  
  // Subscriptions
  conversationsUnsubscribe: (() => void) | null;
  messagesUnsubscribe: (() => void) | null;
  unreadCountUnsubscribe: (() => void) | null;
  
  // Actions
  loadConversations: (userId: string) => Promise<void>;
  subscribeConversations: (userId: string) => void;
  unsubscribeConversations: () => void;
  
  setCurrentConversation: (conversation: Conversation | null) => void;
  loadMessages: (conversationId: string) => Promise<void>;
  subscribeMessages: (conversationId: string) => void;
  unsubscribeMessages: () => void;
  
  sendTextMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    content: string,
    type?: MessageType,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    thumbnailUrl?: string,
    productReference?: ProductReference
  ) => Promise<void>;
  
  sendImageMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    file: File
  ) => Promise<void>;
  
  sendVideoMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    file: File
  ) => Promise<void>;
  
  sendFileMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    file: File
  ) => Promise<void>;
  
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  
  subscribeTotalUnreadCount: (userId: string) => void;
  unsubscribeTotalUnreadCount: () => void;
  
  cleanup: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  totalUnreadCount: 0,
  loading: false,
  sending: false,
  conversationsUnsubscribe: null,
  messagesUnsubscribe: null,
  unreadCountUnsubscribe: null,
  
  loadConversations: async (userId: string) => {
    set({ loading: true });
    try {
      const conversations = await getUserConversations(userId);
      set({ conversations, loading: false });
    } catch (error) {
      console.error('Error loading conversations:', error);
      set({ loading: false });
    }
  },
  
  subscribeConversations: (userId: string) => {
    const unsubscribe = subscribeToUserConversations(userId, (conversations) => {
      set({ conversations });
    });
    set({ conversationsUnsubscribe: unsubscribe });
  },
  
  unsubscribeConversations: () => {
    const { conversationsUnsubscribe } = get();
    if (conversationsUnsubscribe) {
      conversationsUnsubscribe();
      set({ conversationsUnsubscribe: null });
    }
  },
  
  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation, messages: [] });
  },
  
  loadMessages: async (conversationId: string) => {
    set({ loading: true });
    try {
      const messages = await getConversationMessages(conversationId);
      set({ messages, loading: false });
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ loading: false });
    }
  },
  
  subscribeMessages: (conversationId: string) => {
    const unsubscribe = subscribeToConversationMessages(conversationId, (messages) => {
      set({ messages });
    });
    set({ messagesUnsubscribe: unsubscribe });
  },
  
  unsubscribeMessages: () => {
    const { messagesUnsubscribe } = get();
    if (messagesUnsubscribe) {
      messagesUnsubscribe();
      set({ messagesUnsubscribe: null });
    }
  },
  
  sendTextMessage: async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    content: string,
    type: MessageType = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    thumbnailUrl?: string,
    productReference?: ProductReference
  ) => {
    set({ sending: true });
    try {
      await sendMessage(
        conversationId,
        senderId,
        senderName,
        senderPhoto,
        receiverId,
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
        thumbnailUrl,
        productReference
      );
      set({ sending: false });
    } catch (error) {
      console.error('Error sending message:', error);
      set({ sending: false });
      throw error;
    }
  },
  
  sendImageMessage: async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    file: File
  ) => {
    set({ sending: true });
    try {
      const imageUrl = await uploadChatImage(file, conversationId, senderId);
      await sendMessage(
        conversationId,
        senderId,
        senderName,
        senderPhoto,
        receiverId,
        'Image',
        'image',
        imageUrl,
        file.name,
        file.size
      );
      set({ sending: false });
    } catch (error) {
      console.error('Error sending image:', error);
      set({ sending: false });
      throw error;
    }
  },
  
  sendVideoMessage: async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    file: File
  ) => {
    set({ sending: true });
    try {
      const videoUrl = await uploadChatVideo(file, conversationId, senderId);
      await sendMessage(
        conversationId,
        senderId,
        senderName,
        senderPhoto,
        receiverId,
        'Vidéo',
        'video',
        videoUrl,
        file.name,
        file.size
      );
      set({ sending: false });
    } catch (error) {
      console.error('Error sending video:', error);
      set({ sending: false });
      throw error;
    }
  },
  
  sendFileMessage: async (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderPhoto: string | undefined,
    receiverId: string,
    file: File
  ) => {
    set({ sending: true });
    try {
      const fileUrl = await uploadChatFile(file, conversationId, senderId);
      await sendMessage(
        conversationId,
        senderId,
        senderName,
        senderPhoto,
        receiverId,
        file.name,
        'file',
        fileUrl,
        file.name,
        file.size
      );
      set({ sending: false });
    } catch (error) {
      console.error('Error sending file:', error);
      set({ sending: false });
      throw error;
    }
  },
  
  markAsRead: async (conversationId: string, userId: string) => {
    try {
      await markMessagesAsRead(conversationId, userId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },
  
  subscribeTotalUnreadCount: (userId: string) => {
    const unsubscribe = subscribeToTotalUnreadCount(userId, (count) => {
      set({ totalUnreadCount: count });
    });
    set({ unreadCountUnsubscribe: unsubscribe });
  },
  
  unsubscribeTotalUnreadCount: () => {
    const { unreadCountUnsubscribe } = get();
    if (unreadCountUnsubscribe) {
      unreadCountUnsubscribe();
      set({ unreadCountUnsubscribe: null });
    }
  },
  
  cleanup: () => {
    get().unsubscribeConversations();
    get().unsubscribeMessages();
    get().unsubscribeTotalUnreadCount();
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      totalUnreadCount: 0,
    });
  },
}));
