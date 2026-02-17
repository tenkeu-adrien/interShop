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
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import { DatingProfile, DatingContactRequest } from '@/types/dating';

// Create Dating Profile
export async function createDatingProfile(
  profileData: Omit<DatingProfile, 'id'>
): Promise<string> {
  const profilesRef = collection(db, 'datingProfiles');
  const docRef = await addDoc(profilesRef, {
    ...profileData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

// Get Dating Profile by ID
export async function getDatingProfile(profileId: string): Promise<DatingProfile | null> {
  const docRef = doc(db, 'datingProfiles', profileId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as DatingProfile;
}

// Get All Active Dating Profiles with Filters
export async function getDatingProfiles(filters?: {
  city?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  userLocation?: { latitude: number; longitude: number };
  maxDistance?: number;
}): Promise<DatingProfile[]> {
  const profilesRef = collection(db, 'datingProfiles');
  const constraints: QueryConstraint[] = [
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  ];
  
  const q = query(profilesRef, ...constraints);
  const snapshot = await getDocs(q);
  
  let profiles = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as DatingProfile[];
  
  // Apply filters
  if (filters?.city) {
    profiles = profiles.filter(p => 
      p.location?.city.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  
  if (filters?.gender) {
    profiles = profiles.filter(p => p.gender === filters.gender);
  }
  
  if (filters?.minAge !== undefined) {
    profiles = profiles.filter(p => p.age >= filters.minAge!);
  }
  
  if (filters?.maxAge !== undefined) {
    profiles = profiles.filter(p => p.age <= filters.maxAge!);
  }
  
  // Calculate distances if user location provided
  if (filters?.userLocation) {
    profiles = profiles.map(p => {
      if (p.location) {
        const distance = calculateDistance(
          filters.userLocation!.latitude,
          filters.userLocation!.longitude,
          p.location.latitude,
          p.location.longitude
        );
        return { ...p, distance } as any;
      }
      return p;
    });
    
    // Filter by max distance
    if (filters.maxDistance) {
      profiles = profiles.filter(p => 
        (p as any).distance !== undefined && (p as any).distance <= filters.maxDistance!
      );
    }
    
    // Sort by distance
    profiles.sort((a, b) => ((a as any).distance || Infinity) - ((b as any).distance || Infinity));
  }
  
  return profiles;
}

// Get Dating Profiles by Fournisseur
export async function getFournisseurDatingProfiles(fournisseurId: string): Promise<DatingProfile[]> {
  const profilesRef = collection(db, 'datingProfiles');
  const q = query(
    profilesRef,
    where('fournisseurId', '==', fournisseurId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as DatingProfile[];
}

// Update Dating Profile
export async function updateDatingProfile(
  profileId: string,
  updates: Partial<DatingProfile>
): Promise<void> {
  const docRef = doc(db, 'datingProfiles', profileId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date()
  });
}

// Delete Dating Profile
export async function deleteDatingProfile(profileId: string): Promise<void> {
  await deleteDoc(doc(db, 'datingProfiles', profileId));
}

// Increment Profile Views
export async function incrementProfileViews(profileId: string): Promise<void> {
  const docRef = doc(db, 'datingProfiles', profileId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const currentViews = docSnap.data().views || 0;
    await updateDoc(docRef, {
      views: currentViews + 1
    });
  }
}

// Contact Request Functions
export async function createContactRequest(
  requestData: Omit<DatingContactRequest, 'id'>
): Promise<string> {
  const requestsRef = collection(db, 'datingContactRequests');
  const docRef = await addDoc(requestsRef, {
    ...requestData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

export async function getContactRequestsByIntermediary(
  intermediaryId: string
): Promise<DatingContactRequest[]> {
  const requestsRef = collection(db, 'datingContactRequests');
  const q = query(
    requestsRef,
    where('intermediaryId', '==', intermediaryId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as DatingContactRequest[];
}

export async function updateContactRequestStatus(
  requestId: string,
  status: DatingContactRequest['status']
): Promise<void> {
  const docRef = doc(db, 'datingContactRequests', requestId);
  const updates: any = {
    status,
    updatedAt: new Date()
  };
  
  if (status === 'shared') {
    updates.sharedAt = new Date();
  }
  
  await updateDoc(docRef, updates);
}

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
