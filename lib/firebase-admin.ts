import * as admin from 'firebase-admin';

// Initialiser Firebase Admin SDK de façon robuste :
// si les variables d'environnement du compte de service ne sont pas
// renseignées, le module ne doit pas planter (build / démarrage).
let adminApp: admin.app.App | null = null;

if (!admin.apps.length) {
  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log('✅ Firebase Admin initialisé avec succès');
  } catch (error: any) {
    console.error('❌ Erreur initialisation Firebase Admin:', error?.message || error);
  }
} else {
  adminApp = admin.app();
}

// null si Firebase Admin n'a pas pu être initialisé (env manquantes)
export const adminDb = adminApp ? admin.firestore(adminApp) : null;
export const adminAuth = adminApp ? admin.auth(adminApp) : null;
export const auth = adminApp ? admin.auth(adminApp) : null; // Gardé pour compatibilité
export default admin;
