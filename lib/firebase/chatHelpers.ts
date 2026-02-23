import { ConversationType, ConversationContext } from '@/types/chat';
import { getOrCreateConversation } from './chat';

/**
 * Créer une conversation pour une commande
 */
export async function createOrderConversation(
  clientId: string,
  fournisseurId: string,
  clientData: { name: string; photo?: string; role: string },
  fournisseurData: { name: string; photo?: string; role: string },
  orderId: string,
  orderNumber: string
): Promise<string> {
  const context: ConversationContext = {
    type: 'order',
    orderId,
    metadata: {
      orderNumber,
    },
  };

  // Utiliser la fonction existante mais avec le contexte
  const conversationId = await getOrCreateConversation(
    clientId,
    fournisseurId,
    clientData,
    fournisseurData
  );

  // Mettre à jour le contexte
  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./config');
  await updateDoc(doc(db, 'conversations', conversationId), {
    context,
    updatedAt: new Date(),
  });

  return conversationId;
}

/**
 * Créer une conversation pour un produit
 */
export async function createProductInquiryConversation(
  clientId: string,
  fournisseurId: string,
  clientData: { name: string; photo?: string; role: string },
  fournisseurData: { name: string; photo?: string; role: string },
  productId: string,
  productName: string,
  productImage?: string
): Promise<string> {
  const context: ConversationContext = {
    type: 'product_inquiry',
    productId,
    metadata: {
      productName,
    },
  };

  const conversationId = await getOrCreateConversation(
    clientId,
    fournisseurId,
    clientData,
    fournisseurData,
    productImage ? {
      productId,
      productName,
      productImage,
    } : undefined
  );

  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./config');
  await updateDoc(doc(db, 'conversations', conversationId), {
    context,
    updatedAt: new Date(),
  });

  return conversationId;
}

/**
 * Créer une conversation pour un profil de rencontre
 */
export async function createDatingInquiryConversation(
  clientId: string,
  profileOwnerId: string,
  clientData: { name: string; photo?: string; role: string },
  profileOwnerData: { name: string; photo?: string; role: string },
  datingProfileId: string,
  profileName: string
): Promise<string> {
  const context: ConversationContext = {
    type: 'dating_inquiry',
    datingProfileId,
    metadata: {
      profileName,
    },
  };

  const conversationId = await getOrCreateConversation(
    clientId,
    profileOwnerId,
    clientData,
    profileOwnerData
  );

  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./config');
  await updateDoc(doc(db, 'conversations', conversationId), {
    context,
    updatedAt: new Date(),
  });

  return conversationId;
}

/**
 * Créer une conversation pour un hôtel
 */
export async function createHotelInquiryConversation(
  clientId: string,
  hotelOwnerId: string,
  clientData: { name: string; photo?: string; role: string },
  hotelOwnerData: { name: string; photo?: string; role: string },
  hotelId: string,
  hotelName: string
): Promise<string> {
  const context: ConversationContext = {
    type: 'hotel_inquiry',
    hotelId,
    metadata: {
      hotelName,
    },
  };

  const conversationId = await getOrCreateConversation(
    clientId,
    hotelOwnerId,
    clientData,
    hotelOwnerData
  );

  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./config');
  await updateDoc(doc(db, 'conversations', conversationId), {
    context,
    updatedAt: new Date(),
  });

  return conversationId;
}

/**
 * Créer une conversation pour un restaurant
 */
export async function createRestaurantInquiryConversation(
  clientId: string,
  restaurantOwnerId: string,
  clientData: { name: string; photo?: string; role: string },
  restaurantOwnerData: { name: string; photo?: string; role: string },
  restaurantId: string,
  restaurantName: string
): Promise<string> {
  const context: ConversationContext = {
    type: 'restaurant_inquiry',
    restaurantId,
    metadata: {
      restaurantName,
    },
  };

  const conversationId = await getOrCreateConversation(
    clientId,
    restaurantOwnerId,
    clientData,
    restaurantOwnerData
  );

  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./config');
  await updateDoc(doc(db, 'conversations', conversationId), {
    context,
    updatedAt: new Date(),
  });

  return conversationId;
}

/**
 * Créer une conversation générale
 */
export async function createGeneralConversation(
  user1Id: string,
  user2Id: string,
  user1Data: { name: string; photo?: string; role: string },
  user2Data: { name: string; photo?: string; role: string }
): Promise<string> {
  const context: ConversationContext = {
    type: 'general',
  };

  const conversationId = await getOrCreateConversation(
    user1Id,
    user2Id,
    user1Data,
    user2Data
  );

  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./config');
  await updateDoc(doc(db, 'conversations', conversationId), {
    context,
    updatedAt: new Date(),
  });

  return conversationId;
}
