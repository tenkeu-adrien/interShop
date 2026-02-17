/**
 * Script pour nettoyer les produits avec des fournisseurId invalides
 * 
 * Usage:
 * npx ts-node scripts/cleanInvalidProducts.ts
 */

import { collection, getDocs, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

interface CleanupStats {
  totalProducts: number;
  invalidProducts: number;
  deletedProducts: number;
  updatedProducts: number;
  errors: number;
}

async function cleanInvalidProducts(mode: 'check' | 'delete' | 'update' = 'check', realFournisseurId?: string) {
  const stats: CleanupStats = {
    totalProducts: 0,
    invalidProducts: 0,
    deletedProducts: 0,
    updatedProducts: 0,
    errors: 0,
  };

  console.log(`\n🔍 Starting cleanup in ${mode.toUpperCase()} mode...\n`);

  try {
    // Récupérer tous les produits
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    stats.totalProducts = productsSnapshot.size;

    console.log(`📦 Found ${stats.totalProducts} products\n`);

    // Vérifier chaque produit
    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      const productId = productDoc.id;
      const fournisseurId = productData.fournisseurId;

      try {
        // Vérifier si le fournisseur existe
        const fournisseurDoc = await getDoc(doc(db, 'users', fournisseurId));

        if (!fournisseurDoc.exists()) {
          stats.invalidProducts++;
          
          console.log(`❌ Invalid product found:`);
          console.log(`   ID: ${productId}`);
          console.log(`   Name: ${productData.name}`);
          console.log(`   FournisseurId: ${fournisseurId}`);

          if (mode === 'delete') {
            // Supprimer le produit
            await deleteDoc(productDoc.ref);
            stats.deletedProducts++;
            console.log(`   ✅ Deleted\n`);
          } else if (mode === 'update' && realFournisseurId) {
            // Mettre à jour avec un vrai ID
            await updateDoc(productDoc.ref, {
              fournisseurId: realFournisseurId,
              updatedAt: new Date(),
            });
            stats.updatedProducts++;
            console.log(`   ✅ Updated to ${realFournisseurId}\n`);
          } else {
            console.log(`   ⚠️  Would be ${mode === 'check' ? 'checked' : 'updated'}\n`);
          }
        }
      } catch (error) {
        stats.errors++;
        console.error(`❌ Error processing product ${productId}:`, error);
      }
    }

    // Afficher les statistiques
    console.log('\n📊 Cleanup Statistics:');
    console.log(`   Total products: ${stats.totalProducts}`);
    console.log(`   Invalid products: ${stats.invalidProducts}`);
    
    if (mode === 'delete') {
      console.log(`   Deleted products: ${stats.deletedProducts}`);
    } else if (mode === 'update') {
      console.log(`   Updated products: ${stats.updatedProducts}`);
    }
    
    if (stats.errors > 0) {
      console.log(`   Errors: ${stats.errors}`);
    }

    console.log('\n✅ Cleanup complete!\n');

    if (mode === 'check' && stats.invalidProducts > 0) {
      console.log('💡 To delete invalid products, run:');
      console.log('   npx ts-node scripts/cleanInvalidProducts.ts delete\n');
      console.log('💡 To update invalid products with a real fournisseur ID, run:');
      console.log('   npx ts-node scripts/cleanInvalidProducts.ts update <fournisseurId>\n');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
const mode = (args[0] as 'check' | 'delete' | 'update') || 'check';
const realFournisseurId = args[1];

if (mode === 'update' && !realFournisseurId) {
  console.error('❌ Error: fournisseurId is required in update mode');
  console.log('Usage: npx ts-node scripts/cleanInvalidProducts.ts update <fournisseurId>');
  process.exit(1);
}

if (!['check', 'delete', 'update'].includes(mode)) {
  console.error('❌ Error: Invalid mode. Use "check", "delete", or "update"');
  process.exit(1);
}

// Exécuter le nettoyage
cleanInvalidProducts(mode, realFournisseurId);
