import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import { ChatMessage, Conversation, MessageType, ProductReference } from '@/types/chat';
import { createNotification } from './notifications';

// Create or Get Conversation
export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  user1Data: { name: string; photo?: string; role: string },
  user2Data: { name: string; photo?: string; role: string },
  productContext?: ProductReference
): Promise<string> {
  // Check if conversation already exists
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId1)
  );
  
  const snapshot = await getDocs(q);
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.participants.includes(userId2)) {
      // Update product context if provided
      if (productContext) {
        await updateDoc(doc.ref, {
          productContext,
          updatedAt: new Date(),
        });
      }
      return doc.id;
    }
  }
  
  // Nettoyer les données utilisateur pour éviter les undefined
  const cleanUser1Data = {
    name: user1Data.name,
    role: user1Data.role,
    ...(user1Data.photo && { photo: user1Data.photo })
  };
  
  const cleanUser2Data = {
    name: user2Data.name,
    role: user2Data.role,
    ...(user2Data.photo && { photo: user2Data.photo })
  };
  
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Ajouter productContext seulement s'il existe
  if (productContext) {
    conversationData.productContext = productContext;
  }
  
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
      // Convertir les Timestamps en Dates
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      lastMessage: data.lastMessage ? {
        ...data.lastMessage,
        createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
      } : undefined,
    };
  }) as Conversation[];
}

// Listen to User Conversations (Real-time)
export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
) {
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
        // Convertir les Timestamps en Dates
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
        } : undefined,
      };
    }) as Conversation[];
    callback(conversations);
  });
}

// Send Text Message
export async function sendMessage(
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
): Promise<string> {
  const messagesRef = collection(db, 'messages');
  
  // Construire messageData en omettant les champs undefined
  const messageData: any = {
    conversationId,
    senderId,
    senderName,
    receiverId,
    content,
    type,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Ajouter les champs optionnels seulement s'ils existent
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
      createdAt: new Date(),
    },
    updatedAt: new Date(),
    [`unreadCount.${receiverId}`]: increment(1),
  });
  
  // Create notification for receiver
  await createNotification(
    receiverId,
    'message_received',
    'Nouveau message',
    type === 'quote_request' 
      ? `${senderName} a demandé un devis`
      : `${senderName} vous a envoyé un message`,
    {
      conversationId,
      senderId,
      messageType: type,
      ...(productReference?.productId && { productId: productReference.productId })
    }
  );
  
  return docRef.id;
}

// Upload Image
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

// Upload Video
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

// Upload File
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
      // Convertir les Timestamps Firestore en Dates JavaScript
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    };
  }) as ChatMessage[];
  
  return messages.reverse(); // Reverse to show oldest first
}

// Listen to Conversation Messages (Real-time)
export function subscribeToConversationMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
) {
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
        // Convertir les Timestamps Firestore en Dates JavaScript
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      };
    }) as ChatMessage[];
    callback(messages);
  });
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
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { isRead: true });
  });
  
  await batch.commit();
  
  // Reset unread count in conversation
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    [`unreadCount.${userId}`]: 0,
  });
}

// Delete Message
export async function deleteMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(db, 'messages', messageId));
}

// Get Total Unread Count for User
export async function getTotalUnreadCount(userId: string): Promise<number> {
  const conversations = await getUserConversations(userId);
  return conversations.reduce((total, conv) => {
    return total + (conv.unreadCount[userId] || 0);
  }, 0);
}

// Listen to Total Unread Count (Real-time)
export function subscribeToTotalUnreadCount(
  userId: string,
  callback: (count: number) => void
) {
  return subscribeToUserConversations(userId, (conversations) => {
    const total = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount[userId] || 0);
    }, 0);
    callback(total);
  });
}

// Search Messages
export async function searchMessages(
  conversationId: string,
  searchTerm: string
): Promise<ChatMessage[]> {
  const messages = await getConversationMessages(conversationId, 1000);
  return messages.filter(msg => 
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
    // Convertir les Timestamps en Dates
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    lastMessage: data.lastMessage ? {
      ...data.lastMessage,
      createdAt: data.lastMessage.createdAt?.toDate ? data.lastMessage.createdAt.toDate() : new Date(data.lastMessage.createdAt),
    } : undefined,
  } as Conversation;
}
