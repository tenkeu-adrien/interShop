/**
 * Script de diagnostic pour vérifier l'état d'un produit
 * 
 * Usage:
 * npx ts-node scripts/checkProduct.ts [productId]
 * 
 * Ou pour vérifier tous les produits d'un fournisseur:
 * npx ts-node scripts/checkProduct.ts --fournisseur [fournisseurId]
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Configuration Firebase (à adapter selon votre .env)
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

async function checkProduct(productId: string) {
  console.log('\n🔍 Vérification du produit:', productId);
  console.log('='.repeat(60));
  
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('❌ Produit non trouvé dans Firestore');
      return;
    }
    
    const product = docSnap.data();
    
    console.log('\n✅ Produit trouvé!');
    console.log('\n📋 Informations:');
    console.log('  - Nom:', product.name);
    console.log('  - Catégorie:', product.category);
    console.log('  - Fournisseur ID:', product.fournisseurId);
    console.log('  - Actif:', product.isActive ? '✅ OUI' : '❌ NON');
    console.log('  - Stock:', product.stock);
    console.log('  - Prix:', product.prices?.[0]?.price, product.prices?.[0]?.currency);
    console.log('  - MOQ:', product.moq);
    console.log('  - Images:', product.images?.length || 0);
    console.log('  - Vidéos:', product.videos?.length || 0);
    console.log('  - Vues:', product.views || 0);
    console.log('  - Ventes:', product.sales || 0);
    console.log('  - Note:', product.rating || 0);
    console.log('  - Avis:', product.reviewCount || 0);
    
    if (product.createdAt) {
      const createdAt = product.createdAt.toDate ? product.createdAt.toDate() : new Date(product.createdAt);
      console.log('  - Créé le:', createdAt.toLocaleString('fr-FR'));
    }
    
    if (product.updatedAt) {
      const updatedAt = product.updatedAt.toDate ? product.updatedAt.toDate() : new Date(product.updatedAt);
      console.log('  - Modifié le:', updatedAt.toLocaleString('fr-FR'));
    }
    
    console.log('\n🔍 Diagnostic:');
    
    // Vérifications
    const issues: string[] = [];
    const warnings: string[] = [];
    
    if (!product.isActive) {
      issues.push('Le produit est INACTIF - il ne sera pas visible sur le site');
    }
    
    if (!product.images || product.images.length === 0) {
      issues.push('Aucune image - le produit ne s\'affichera pas correctement');
    }
    
    if (!product.prices || product.prices.length === 0) {
      issues.push('Aucun prix défini');
    }
    
    if (product.stock === 0) {
      warnings.push('Stock à 0 - le produit sera marqué "Rupture de stock"');
    }
    
    if (product.views === 0 && product.sales === 0 && product.rating === 0) {
      warnings.push('Nouveau produit sans statistiques - normal pour un produit récent');
    }
    
    if (!product.fournisseurId) {
      issues.push('Pas de fournisseurId - le produit est orphelin');
    }
    
    if (issues.length > 0) {
      console.log('\n❌ PROBLÈMES DÉTECTÉS:');
      issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  AVERTISSEMENTS:');
      warnings.forEach((warning, i) => console.log(`  ${i + 1}. ${warning}`));
    }
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('  ✅ Aucun problème détecté - le produit devrait être visible');
    }
    
    // Vérifier la visibilité dans les requêtes
    console.log('\n🔎 Test de visibilité:');
    
    // Test 1: Requête "Nouveautés"
    const newArrivalsQuery = query(
      collection(db, 'products'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const newArrivalsSnapshot = await getDocs(newArrivalsQuery);
    const newArrivalsIds = newArrivalsSnapshot.docs.map(d => d.id);
    const inNewArrivals = newArrivalsIds.includes(productId);
    console.log('  - Dans "Nouveautés" (100 premiers):', inNewArrivals ? '✅ OUI' : '❌ NON');
    if (inNewArrivals) {
      const position = newArrivalsIds.indexOf(productId) + 1;
      console.log(`    Position: ${position}/100`);
    }
    
    // Test 2: Requête "Meilleures offres"
    if (product.sales > 0) {
      const bestDealsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        orderBy('sales', 'desc'),
        limit(24)
      );
      const bestDealsSnapshot = await getDocs(bestDealsQuery);
      const bestDealsIds = bestDealsSnapshot.docs.map(d => d.id);
      const inBestDeals = bestDealsIds.includes(productId);
      console.log('  - Dans "Meilleures offres" (24 premiers):', inBestDeals ? '✅ OUI' : '❌ NON');
    }
    
    // Test 3: Requête "Top classement"
    if (product.rating > 0) {
      const topRankedQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        orderBy('rating', 'desc'),
        limit(24)
      );
      const topRankedSnapshot = await getDocs(topRankedQuery);
      const topRankedIds = topRankedSnapshot.docs.map(d => d.id);
      const inTopRanked = topRankedIds.includes(productId);
      console.log('  - Dans "Top classement" (24 premiers):', inTopRanked ? '✅ OUI' : '❌ NON');
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
    if (error.code === 'failed-precondition') {
      console.log('\n⚠️  Index Firestore manquant!');
      console.log('Déployez les index avec: firebase deploy --only firestore:indexes');
    }
  }
}

async function checkFournisseurProducts(fournisseurId: string) {
  console.log('\n🔍 Vérification des produits du fournisseur:', fournisseurId);
  console.log('='.repeat(60));
  
  try {
    const q = query(
      collection(db, 'products'),
      where('fournisseurId', '==', fournisseurId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    console.log(`\n✅ ${snapshot.docs.length} produit(s) trouvé(s)\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const product = doc.data();
      const status = product.isActive ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${product.name}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Catégorie: ${product.category}`);
      console.log(`   Stock: ${product.stock} | Vues: ${product.views || 0} | Ventes: ${product.sales || 0}`);
      console.log('');
    });
    
    const activeCount = snapshot.docs.filter(d => d.data().isActive).length;
    const inactiveCount = snapshot.docs.length - activeCount;
    
    console.log('📊 Résumé:');
    console.log(`  - Total: ${snapshot.docs.length}`);
    console.log(`  - Actifs: ${activeCount}`);
    console.log(`  - Inactifs: ${inactiveCount}`);
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
  }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  npx ts-node scripts/checkProduct.ts [productId]');
  console.log('  npx ts-node scripts/checkProduct.ts --fournisseur [fournisseurId]');
  process.exit(1);
}

if (args[0] === '--fournisseur' && args[1]) {
  checkFournisseurProducts(args[1]).then(() => process.exit(0));
} else {
  checkProduct(args[0]).then(() => process.exit(0));
}
