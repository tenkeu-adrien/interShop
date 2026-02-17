/**
 * Script de migration pour ajouter les champs de vérification aux utilisateurs existants
 * 
 * Usage:
 * npx ts-node scripts/migrateUsersVerification.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Configuration Firebase (à adapter selon votre .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUsers() {
  console.log('🚀 Début de la migration des utilisateurs...\n');

  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;
    let migratedCount = 0;
    let errorCount = 0;

    console.log(`📊 ${totalUsers} utilisateurs trouvés\n`);

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      try {
        // Vérifier si l'utilisateur a déjà les nouveaux champs
        if (userData.accountStatus) {
          console.log(`⏭️  Utilisateur ${userData.displayName} (${userId}) déjà migré`);
          continue;
        }

        // Déterminer le statut du compte selon le rôle
        let accountStatus = 'active';
        if (userData.role === 'fournisseur' || userData.role === 'marketiste') {
          // Pour les utilisateurs existants, on considère qu'ils sont déjà validés
          accountStatus = 'active';
        }

        // Préparer les données de mise à jour
        const updateData = {
          accountStatus,
          emailVerified: true, // Considérer les utilisateurs existants comme vérifiés
          emailVerificationAttempts: 0,
          phoneVerified: userData.role === 'client' ? false : true, // Fournisseurs/marketistes existants considérés comme vérifiés
          phoneVerificationAttempts: 0,
          verificationHistory: []
        };

        // Mettre à jour l'utilisateur
        await updateDoc(doc(db, 'users', userId), updateData);

        migratedCount++;
        console.log(`✅ Utilisateur ${userData.displayName} (${userId}) migré avec succès`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur lors de la migration de l'utilisateur ${userId}:`, error);
      }
    }

    console.log('\n📈 Résumé de la migration:');
    console.log(`   Total: ${totalUsers}`);
    console.log(`   Migrés: ${migratedCount}`);
    console.log(`   Erreurs: ${errorCount}`);
    console.log(`   Déjà migrés: ${totalUsers - migratedCount - errorCount}`);
    console.log('\n✨ Migration terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
