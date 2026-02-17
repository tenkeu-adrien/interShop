// Types spécifiques pour les profils de rencontre
export interface DatingProfile {
  id: string;
  fournisseurId: string;
  firstName: string;
  age: number;
  gender: 'homme' | 'femme' | 'autre';
  description: string;
  images: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  height?: number; // in cm
  skinColor?: string;
  eyeColor?: string;
  profession?: string;
  interests?: string[];
  status: 'available' | 'unavailable' | 'archived';
  contactInfo: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  rating: number;
  reviewCount: number;
  views: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatingContactRequest {
  id: string;
  profileId: string;
  clientId: string;
  intermediaryId: string;
  status: 'pending' | 'approved' | 'rejected' | 'shared';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  sharedAt?: Date;
}
