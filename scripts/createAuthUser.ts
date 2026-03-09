const admin = require('firebase-admin');

// Configuration Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

async function createAuthUser(email: string, temporaryPassword: string) {
  try {
    console.log('🔍 Recherche de l\'utilisateur dans Firestore...');
    
    // Chercher l'utilisateur dans Firestore
    const usersSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ Utilisateur non trouvé dans Firestore');
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const firestoreUserId = userDoc.id;

    console.log('✅ Utilisateur trouvé dans Firestore:');
    console.log('   - Document ID:', firestoreUserId);
    console.log('   - Email:', userData.email);
    console.log('   - DisplayName:', userData.displayName);

    // Vérifier si l'utilisateur existe déjà dans Firebase Auth
    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      console.log('⚠️ Utilisateur existe déjà dans Firebase Auth');
      console.log('   - UID:', existingUser.uid);
      
      if (existingUser.uid !== firestoreUserId) {
        console.log('❌ PROBLÈME: Les IDs ne correspondent pas !');
        console.log('   - Firebase Auth UID:', existingUser.uid);
        console.log('   - Firestore Doc ID:', firestoreUserId);
        console.log('\n💡 Solution: Supprimez le document Firestore et réinscrivez-vous');
      }
      return;
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      console.log('✅ Utilisateur n\'existe pas dans Firebase Auth, création...');
    }

    // Créer l'utilisateur dans Firebase Auth avec l'UID du document Firestore
    const newUser = await adminAuth.createUser({
      uid: firestoreUserId, // Utiliser le même ID que Firestore
      email: userData.email,
      password: temporaryPassword,
      displayName: userData.displayName || 'Utilisateur',
      emailVerified: userData.emailVerified || false
    });

    console.log('✅ Utilisateur créé dans Firebase Auth !');
    console.log('   - UID:', newUser.uid);
    console.log('   - Email:', newUser.email);
    console.log('   - Mot de passe temporaire:', temporaryPassword);
    console.log('\n🎉 Vous pouvez maintenant:');
    console.log('   1. Vous connecter avec:', email);
    console.log('   2. Mot de passe:', temporaryPassword);
    console.log('   3. Puis utiliser "Mot de passe oublié" pour le changer');

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    console.error('   Code:', error.code);
  }
}

// Utilisation
const email = 'devagencyweb@gmail.com';
const temporaryPassword = 'Temp123456!'; // Changez ce mot de passe

console.log('🚀 Création de l\'utilisateur dans Firebase Auth...');
console.log('   Email:', email);
console.log('   Mot de passe temporaire:', temporaryPassword);
console.log('');

createAuthUser(email, temporaryPassword)
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
