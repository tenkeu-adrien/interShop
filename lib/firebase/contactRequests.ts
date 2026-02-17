import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './config';
import { ContactRequest, Notification } from '@/types';

export async function createContactRequest(
  profileId: string,
  clientId: string,
  intermediaryId: string,
  message?: string
): Promise<string> {
  const requestsRef = collection(db, 'contactRequests');
  const request: Omit<ContactRequest, 'id'> = {
    profileId,
    clientId,
    intermediaryId,
    status: 'pending',
    message,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const docRef = await addDoc(requestsRef, request);
  
  // Create notification for intermediary
  const notificationsRef = collection(db, 'notifications');
  const notification: Omit<Notification, 'id'> = {
    userId: intermediaryId,
    type: 'message_received',
    title: 'Nouvelle demande de contact',
    message: `Un client souhaite obtenir les coordonnées d'un profil`,
    data: { requestId: docRef.id, profileId },
    isRead: false,
    createdAt: new Date(),
  };
  await addDoc(notificationsRef, notification);
  
  return docRef.id;
}

export async function getContactRequestsByIntermediary(
  intermediaryId: string
): Promise<ContactRequest[]> {
  const requestsRef = collection(db, 'contactRequests');
  const q = query(requestsRef, where('intermediaryId', '==', intermediaryId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ContactRequest[];
}

export async function updateContactRequestStatus(
  requestId: string,
  status: ContactRequest['status']
): Promise<void> {
  const requestRef = doc(db, 'contactRequests', requestId);
  await updateDoc(requestRef, {
    status,
    updatedAt: new Date(),
    ...(status === 'shared' && { sharedAt: new Date() }),
  });
}
