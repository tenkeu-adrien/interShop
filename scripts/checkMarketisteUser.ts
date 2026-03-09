import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

async function checkMarketisteUser() {
  try {
    console.log('🔍 Recherche des utilisateurs marketistes...\n');

    // Récupérer tous les utilisateurs
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`📊 Total utilisateurs: ${usersSnapshot.size}\n`);

    const marketistes = usersSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.role === 'marketiste' || data.role === 'admin';
    });

    console.log(`✅ Utilisateurs marketistes/admin trouvés: ${marketistes.length}\n`);

    for (const doc of marketistes) {
      const data = doc.data();
      console.log('👤 Utilisateur:');
      console.log(`   - ID: ${doc.id}`);
      console.log(`   - Email: ${data.email}`);
      console.log(`   - Nom: ${data.displayName}`);
      console.log(`   - Rôle: ${data.role}`);
      console.log(`   - Statut: ${data.accountStatus}`);
      console.log(`   - Email vérifié: ${data.emailVerified}`);
      
      // Vérifier dans Firebase Auth
      try {
        const authUser = await auth.getUser(doc.id);
        console.log(`   - Existe dans Auth: ✅`);
        console.log(`   - Auth Email: ${authUser.email}`);
      } catch (error) {
        console.log(`   - Existe dans Auth: ❌`);
      }
      
      // Vérifier les codes marketing
      const codesSnapshot = await db.collection('marketingCodes')
        .where('marketisteId', '==', doc.id)
        .get();
      console.log(`   - Codes marketing: ${codesSnapshot.size}`);
      
      // Vérifier les commandes
      const ordersSnapshot = await db.collection('orders')
        .where('marketisteId', '==', doc.id)
        .get();
      console.log(`   - Commandes: ${ordersSnapshot.size}`);
      
      console.log('');
    }

    if (marketistes.length === 0) {
      console.log('⚠️  Aucun utilisateur marketiste trouvé!');
      console.log('💡 Pour créer un utilisateur marketiste, modifiez le rôle d\'un utilisateur existant dans Firestore.');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkMarketisteUser();
