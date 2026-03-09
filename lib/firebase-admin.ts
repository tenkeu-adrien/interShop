import * as admin from 'firebase-admin';

// Initialiser Firebase Admin SDK
if (!admin.apps.length) {
  try {
    console.log('🔧 Initialisation de Firebase Admin...');
    console.log('   - FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
    console.log('   - FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
    console.log('   - FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log('✅ Firebase Admin initialisé avec succès');
  } catch (error: any) {
    console.error('❌ Erreur initialisation Firebase Admin:', error.message);
    console.error('   Stack:', error.stack);
  }
} else {
  console.log('ℹ️ Firebase Admin déjà initialisé');
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth(); // Renommé de 'auth' à 'adminAuth'
export const auth = admin.auth(); // Gardé pour compatibilité
export default admin;
