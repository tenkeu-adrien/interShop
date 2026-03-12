/**
 * Script pour mettre à jour les frais de retrait de 2% à 0.5%
 * 
 * Usage: npx ts-node scripts/updateWithdrawalFees.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

// Initialiser Firebase Admin
if (getApps().length === 0) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

async function updateWithdrawalFees() {
  console.log('🔄 Mise à jour des frais de retrait...\n');

  try {
    // Référence au document des paramètres wallet
    const settingsRef = db.collection('walletSettings').doc('global');
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      console.log('⚠️  Aucun paramètre wallet trouvé. Les paramètres par défaut seront créés lors de la première utilisation.');
      return;
    }

    const currentSettings = settingsDoc.data();
    console.log('📊 Paramètres actuels:');
    console.log(`   - Frais de retrait: ${currentSettings?.withdrawalFeePercent}%`);
    console.log(`   - Frais minimum: ${currentSettings?.withdrawalFeeMin} FCFA`);
    console.log(`   - Frais maximum: ${currentSettings?.withdrawalFeeMax} FCFA\n`);

    // Mettre à jour les frais de retrait
    await settingsRef.update({
      withdrawalFeePercent: 0.5,
      updatedAt: new Date(),
      updatedBy: 'system-script'
    });

    console.log('✅ Frais de retrait mis à jour avec succès!');
    console.log('📊 Nouveaux paramètres:');
    console.log('   - Frais de retrait: 0.5%');
    console.log('   - Frais minimum: ' + currentSettings?.withdrawalFeeMin + ' FCFA');
    console.log('   - Frais maximum: ' + currentSettings?.withdrawalFeeMax + ' FCFA\n');

    // Afficher un exemple de calcul
    const exampleAmount = 100000;
    const oldFees = exampleAmount * 0.02; // 2%
    const newFees = exampleAmount * 0.005; // 0.5%
    
    console.log('💡 Exemple de calcul pour un retrait de 100,000 FCFA:');
    console.log(`   - Anciens frais (2%): ${oldFees.toLocaleString('fr-FR')} FCFA`);
    console.log(`   - Nouveaux frais (0.5%): ${newFees.toLocaleString('fr-FR')} FCFA`);
    console.log(`   - Économie: ${(oldFees - newFees).toLocaleString('fr-FR')} FCFA\n`);

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  }
}

// Exécuter le script
updateWithdrawalFees()
  .then(() => {
    console.log('✨ Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
