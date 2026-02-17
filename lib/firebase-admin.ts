import * as admin from 'firebase-admin';

// Initialiser Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log('✅ Firebase Admin initialisé');
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase Admin:', error);
  }
}

export const adminDb = admin.firestore();
export const auth = admin.auth();
export default admin;
