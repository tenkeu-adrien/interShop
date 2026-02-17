// scripts/firebaseConfig.ts
// Configuration Firebase spécifique pour les scripts (sans Auth)

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Vérifier que la configuration est valide
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Configuration Firebase invalide!');
  console.error('Vérifiez que le fichier .env.local contient toutes les variables nécessaires.');
  process.exit(1);
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export default app;
