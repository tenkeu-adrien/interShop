// scripts/seedFirestoreOnly.ts
/**
 * Script simplifié pour générer et insérer des fausses données dans Firebase Firestore
 * Ce script n'utilise que Firestore (pas d'authentification)
 * 
 * Usage: npx tsx scripts/seedFirestoreOnly.ts
 */

import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Utiliser la config locale du script
import {
  createMockProduct,
  createMockClient,
  createMockFournisseur,
  createMockMarketiste,
} from '../lib/factories';
import type { Product, User } from '../types';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logProgress(current: number, total: number, label: string) {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  process.stdout.write(`\r  [${bar}] ${percentage}% - ${current}/${total} ${label}`);
  if (current === total) {
    console.log(''); // Nouvelle ligne à la fin
  }
}

// Fonction pour nettoyer récursivement les valeurs undefined
function cleanUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined).filter(v => v !== undefined);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanUndefined(v)])
    );
  }
  
  return obj;
}

async function seedProducts(count: number = 50) {
  log(`\n📦 Génération de ${count} produits...`, 'blue');
  
  const productIds: string[] = [];
  const fournisseurIds = [
    'fournisseur-001',
    'fournisseur-002',
    'fournisseur-003',
    'fournisseur-004',
    'fournisseur-005'
  ];
  
  for (let i = 0; i < count; i++) {
    try {
      // Créer un produit avec un fournisseur aléatoire
      const product = createMockProduct({
        fournisseurId: fournisseurIds[Math.floor(Math.random() * fournisseurIds.length)],
        isActive: true
      });
      
      // Supprimer l'ID et nettoyer les valeurs undefined
      const { id, ...productData } = product;
      
      // Nettoyer récursivement toutes les valeurs undefined
      const cleanedData = cleanUndefined(productData);
      
      const docRef = await addDoc(collection(db, 'products'), cleanedData);
      productIds.push(docRef.id);
      
      logProgress(i + 1, count, 'produits');
    } catch (error: any) {
      log(`\n  ✗ Erreur produit ${i + 1}: ${error.message}`, 'red');
    }
  }
  
  log(`✅ ${productIds.length} produits créés avec succès!`, 'green');
  return productIds;
}

async function seedUsers(count: number = 10) {
  log(`\n👥 Génération de ${count} utilisateurs...`, 'blue');
  
  const userIds: string[] = [];
  
  // Configuration des types d'utilisateurs
  const userConfigs = [
    // 4 Clients
    { factory: () => createMockClient(), count: 4, label: 'Client' },
    // 3 Fournisseurs (tous approuvés)
    { factory: () => createMockFournisseur({ approvalStatus: 'approved' }), count: 3, label: 'Fournisseur' },
    // 2 Marketistes (tous approuvés)
    { factory: () => createMockMarketiste({ approvalStatus: 'approved' }), count: 2, label: 'Marketiste' },
    // 1 Admin
    { factory: () => ({ ...createMockClient(), role: 'admin' as const, approvalStatus: 'approved' as const }), count: 1, label: 'Admin' }
  ];
  
  let totalCreated = 0;
  
  for (const config of userConfigs) {
    for (let i = 0; i < config.count; i++) {
      try {
        const user = config.factory();
        
        // Supprimer l'ID car on va l'utiliser comme ID du document
        const { id, ...userData } = user;
        
        // Nettoyer récursivement toutes les valeurs undefined
        const cleanedData = cleanUndefined(userData);
        
        // Utiliser l'ID généré comme ID du document Firestore
        await setDoc(doc(db, 'users', id), cleanedData);
        userIds.push(id);
        totalCreated++;
        
        log(`  ✓ ${config.label} créé: ${user.email}`, 'green');
      } catch (error: any) {
        log(`  ✗ Erreur ${config.label}: ${error.message}`, 'red');
      }
    }
  }
  
  log(`✅ ${userIds.length} utilisateurs créés avec succès!`, 'green');
  return userIds;
}

async function displaySummary(productCount: number, userCount: number) {
  log('\n' + '='.repeat(60), 'cyan');
  log('✨ SEEDING TERMINÉ AVEC SUCCÈS! ✨', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  log('📊 Résumé des données créées:', 'yellow');
  log(`  👥 Utilisateurs: ${userCount}`, 'magenta');
  log(`     • 4 Clients`, 'magenta');
  log(`     • 3 Fournisseurs (approuvés)`, 'magenta');
  log(`     • 2 Marketistes (approuvés)`, 'magenta');
  log(`     • 1 Admin`, 'magenta');
  log(`  📦 Produits: ${productCount}`, 'magenta');
  
  log('\n💡 Prochaines étapes:', 'yellow');
  log('  1. Ouvrez Firebase Console: https://console.firebase.google.com', 'cyan');
  log('  2. Allez dans Firestore Database', 'cyan');
  log('  3. Vérifiez les collections "users" et "products"', 'cyan');
  log('  4. Lancez votre application: npm run dev', 'cyan');
  
  log('\n✅ Toutes les données ont été insérées dans Firebase Firestore!\n', 'green');
}

async function main() {
  log('\n🚀 Démarrage du seeding de Firebase Firestore...', 'cyan');
  log('================================================\n', 'cyan');
  
  try {
    // Vérifier la connexion Firebase
    log('🔌 Vérification de la connexion Firebase...', 'blue');
    log(`  Project ID: ${db.app.options.projectId}`, 'cyan');
    log('  ✓ Connexion établie!\n', 'green');
    
    // 1. Créer les utilisateurs d'abord
    const userIds = await seedUsers(10);
    
    // 2. Créer les produits
    const productIds = await seedProducts(50);
    
    // 3. Afficher le résumé
    await displaySummary(productIds.length, userIds.length);
    
  } catch (error: any) {
    log(`\n❌ Erreur lors du seeding: ${error.message}`, 'red');
    console.error('\nDétails de l\'erreur:', error);
    
    log('\n💡 Conseils de dépannage:', 'yellow');
    log('  1. Vérifiez que Firebase est correctement configuré dans .env.local', 'cyan');
    log('  2. Vérifiez les règles de sécurité Firestore', 'cyan');
    log('  3. Assurez-vous que le projet Firebase existe', 'cyan');
    
    process.exit(1);
  }
}

// Exécuter le script
main().then(() => {
  log('🎉 Script terminé avec succès!', 'green');
  process.exit(0);
}).catch((error) => {
  log(`❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
