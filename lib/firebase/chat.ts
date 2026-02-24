import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  writeBatch,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Types
export interface ConversationContext {
  type: 'product_inquiry' | 'hotel_inquiry' | 'restaurant_inquiry' | 'dating_inquiry';
  itemId?: string;
  itemName?: string;
}

export interface ProductReference {
  productId: string;
  productName: string;
  productImage?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantsData: {
    [userId: string]: {
      name: string;
      photo?: string;
      role: string;
    };
  };
  unreadCount: {
    [userId: string]: number;
  };
  context?: ConversationContext;
  productContext?: ProductReference;
  lastMessage?: {
    content: string;
    type: string;
    senderId: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'product' | 'quote_request';
  isRead: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  productReference?: ProductReference;
  createdAt: Date;
  updatedAt: Date;
}

// Create or Get Conversation
export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  user1Data: { name: string; photo?: string; role: string },
  user2Data: { name: string; photo?: string; role: string },
  context?: ConversationContext,
  productContext?: ProductReference
): Promise<string> {
  // Check if conversation already exists FOR THIS SPECIFIC ITEM
  const conversationsRef = collection(db, 'conversations');
  
  // Build query to find conversation between these users
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId1)
  );
  
  const snapshot = await getDocs(q);
  
  // Check if a conversation exists for THIS SPECIFIC ITEM
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    
    // Must have both participants
    if (!data.participants.includes(userId2)) continue;
    
    // If we have a productContext, check if it matches
    if (productContext && data.productContext) {
      // Same product/service = same conversation
      if (data.productContext.productId === productContext.productId) {
        // Update context if provided
        if (context) {
          await updateDoc(docSnap.ref, { 
            context,
            updatedAt: Timestamp.now() 
          });
        }
        return docSnap.id;
      }
    }
    
    // If no productContext provided, check context type and itemId
    if (!productContext && context && data.context) {
      if (data.context.type === context.type && data.context.itemId === context.itemId) {
        return docSnap.id;
      }
    }
  }
  
  // No existing conversation found for this item - create new one
  const cleanUser1Data: any = {
    name: user1Data.name,
    role: user1Data.role,
  };
  if (user1Data.photo) cleanUser1Data.photo = user1Data.photo;
  
  const cleanUser2Data: any = {
    name: user2Data.name,
    role: user2Data.role,
  };
  if (user2Data.photo) cleanUser2Data.photo = user2Data.photo;
  
  // Create new conversation
  const conversationData: any = {
    participants: [userId1, userId2],
    participantsData: {
      [userId1]: cleanUser1Data,
      [userId2]: cleanUser2Data,
    },
    unreadCount: {
      [userId1]: 0,
      [userId2]: 0,
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  if (context) conversationData.context = context;
  if (productContext) conversationData.productContext = productContext;
  
  const docRef = await addDoc(conversationsRef, conversationData);
  return docRef.id;
}

// Get User Conversations
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      lastMessage: data.lastMessage ? {
        ...data.lastMessage,
        createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
      } : undefined,
    } as Conversation;
  });
}

// Send Message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string | undefined,
  receiverId: string,
  content: string,
  type: 'text' | 'image' | 'video' | 'file' | 'product' | 'quote_request' = 'text',
  fileUrl?: string,
  fileName?: string,
  fileSize?: number,
  thumbnailUrl?: string,
  productReference?: ProductReference
): Promise<string> {
  const messagesRef = collection(db, 'messages');
  
  // Build message data
  const messageData: any = {
    conversationId,
    senderId,
    senderName,
    receiverId,
    content,
    type,
    isRead: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  if (senderPhoto) messageData.senderPhoto = senderPhoto;
  if (fileUrl) messageData.fileUrl = fileUrl;
  if (fileName) messageData.fileName = fileName;
  if (fileSize) messageData.fileSize = fileSize;
  if (thumbnailUrl) messageData.thumbnailUrl = thumbnailUrl;
  if (productReference) messageData.productReference = productReference;
  
  const docRef = await addDoc(messagesRef, messageData);
  
  // Update conversation
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    lastMessage: {
      content: type === 'text' ? content : 
               type === 'product' ? `📦 ${productReference?.productName}` :
               type === 'quote_request' ? `💰 Demande de devis pour ${productReference?.productName}` :
               type === 'image' ? '📷 Image' : 
               type === 'video' ? '🎥 Vidéo' : '📎 Fichier',
      type,
      senderId,
      createdAt: Timestamp.now(),
    },
    updatedAt: Timestamp.now(),
    [`unreadCount.${receiverId}`]: increment(1),
  });
  
  return docRef.id;
}

// Get Conversation Messages
export async function getConversationMessages(
  conversationId: string,
  limitCount: number = 50
): Promise<ChatMessage[]> {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  const messages = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as ChatMessage;
  });
  
  return messages.reverse(); // Oldest first
}

// Get Conversation by ID
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const docRef = doc(db, 'conversations', conversationId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    lastMessage: data.lastMessage ? {
      ...data.lastMessage,
      createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
    } : undefined,
  } as Conversation;
}

// Mark Messages as Read
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    where('receiverId', '==', userId),
    where('isRead', '==', false)
  );
  
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  
  snapshot.docs.forEach(docSnap => {
    batch.update(docSnap.ref, { isRead: true });
  });
  
  await batch.commit();
  
  // Reset unread count
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    [`unreadCount.${userId}`]: 0,
  });
}


// Subscribe to User Conversations (Real-time)
export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
        } : undefined,
      } as Conversation;
    });
    callback(conversations);
  });
}

// Subscribe to Conversation Messages (Real-time)
export function subscribeToConversationMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as ChatMessage;
    });
    callback(messages);
  });
}

// Subscribe to Total Unread Count (Real-time)
export function subscribeToTotalUnreadCount(
  userId: string,
  callback: (count: number) => void
): Unsubscribe {
  return subscribeToUserConversations(userId, (conversations) => {
    const total = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount[userId] || 0);
    }, 0);
    callback(total);
  });
}

// Upload Chat Image
export async function uploadChatImage(
  file: File,
  conversationId: string,
  userId: string
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `chat/${conversationId}/images/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

// Upload Chat Video
export async function uploadChatVideo(
  file: File,
  conversationId: string,
  userId: string
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `chat/${conversationId}/videos/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

// Upload Chat File
export async function uploadChatFile(
  file: File,
  conversationId: string,
  userId: string
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `chat/${conversationId}/files/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}
