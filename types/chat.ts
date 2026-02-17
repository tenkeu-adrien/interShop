// Types pour le système de chat

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'product' | 'quote_request';

export interface ProductReference {
  productId: string;
  productName: string;
  productImage: string;
  productPrice?: number;
  productCurrency?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  receiverId: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string; // Pour les vidéos
  productReference?: ProductReference; // Référence au produit
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  participantsData: {
    [userId: string]: {
      name: string;
      photo?: string;
      role: string;
    };
  };
  productContext?: ProductReference; // Produit lié à la conversation
  lastMessage?: {
    content: string;
    type: MessageType;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatNotification {
  id: string;
  userId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  type: MessageType;
  isRead: boolean;
  createdAt: Date;
}

export interface TypingStatus {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}
