// scripts/seedFirebase.ts
/**
 * Script pour générer et insérer des fausses données dans Firebase Firestore
 * 
 * Usage: npx tsx scripts/seedFirebase.ts
 */

import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import {
  createMockProduct,
  createMockClient,
  createMockFournisseur,
  createMockMarketiste,
  createMockOrder,
  createMockUser,
  createMockReview,
  createMockMarketingCode
} from '../lib/factories';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function seedProducts(count: number = 50, fournisseurIds: string[] = []) {
  log(`\n📦 Génération de ${count} produits...`, 'blue');
  
  const productIds: string[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const fournisseurId =
        fournisseurIds.length > 0
          ? fournisseurIds[Math.floor(Math.random() * fournisseurIds.length)]
          : undefined;
      const product = createMockProduct(
        fournisseurId ? { fournisseurId, fournisseurVerified: true } : {}
      );
      
      // Convertir les dates en Timestamp pour Firebase
      const productData = {
        ...product,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      productIds.push(docRef.id);
      
      if ((i + 1) % 10 === 0) {
        log(`  ✓ ${i + 1}/${count} produits créés`, 'green');
      }
    } catch (error) {
      log(`  ✗ Erreur lors de la création du produit ${i + 1}: ${error}`, 'red');
    }
  }
  
  log(`✅ ${productIds.length} produits créés avec succès!`, 'green');
  return productIds;
}

async function seedUsers(count: number = 10) {
  log(`\n👥 Génération de ${count} utilisateurs...`, 'blue');
  
  const userIds: string[] = [];
  const userTypes = [
    { type: 'client', count: 4 },
    { type: 'fournisseur', count: 3 },
    { type: 'marketiste', count: 2 },
    { type: 'admin', count: 1 }
  ];
  
  for (const { type, count: typeCount } of userTypes) {
    for (let i = 0; i < typeCount; i++) {
      try {
        let user;
        
        switch (type) {
          case 'client':
            user = createMockClient();
            break;
          case 'fournisseur':
            user = createMockFournisseur({ approvalStatus: 'approved' });
            break;
          case 'marketiste':
            user = createMockMarketiste({ approvalStatus: 'approved' });
            break;
          case 'admin':
            user = createMockUser({ role: 'admin', approvalStatus: 'approved' });
            break;
          default:
            user = createMockClient();
        }
        
        // Convertir les dates en Timestamp pour Firebase
        const userData = {
          ...user,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          approvedAt: user.approvedAt || null
        };
        
        // Utiliser l'ID généré comme ID du document
        await setDoc(doc(db, 'users', user.id), userData);
        userIds.push(user.id);
        
        log(`  ✓ ${type} créé: ${user.email}`, 'green');
      } catch (error) {
        log(`  ✗ Erreur lors de la création de l'utilisateur ${type}: ${error}`, 'red');
      }
    }
  }
  
  log(`✅ ${userIds.length} utilisateurs créés avec succès!`, 'green');
  return userIds;
}

async function seedOrders(count: number = 20, productIds: string[], userIds: string[]) {
  log(`\n🛒 Génération de ${count} commandes...`, 'blue');
  
  const orderIds: string[] = [];
  const clientIds = userIds.slice(0, 4); // Les 4 premiers sont des clients
  const fournisseurIds = userIds.slice(4, 7); // Les 3 suivants sont des fournisseurs
  
  for (let i = 0; i < count; i++) {
    try {
      const tempOrder = createMockOrder();
      const order = createMockOrder({
        clientId: clientIds[Math.floor(Math.random() * clientIds.length)],
        fournisseurId: fournisseurIds[Math.floor(Math.random() * fournisseurIds.length)],
        products: tempOrder.products.map(p => ({
          ...p,
          productId: productIds[Math.floor(Math.random() * productIds.length)]
        }))
      });
      
      // Convertir les dates en Timestamp pour Firebase
      const orderData = {
        ...order,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paidAt: order.paidAt || null,
        shippedAt: order.shippedAt || null,
        deliveredAt: order.deliveredAt || null
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      orderIds.push(docRef.id);
      
      if ((i + 1) % 5 === 0) {
        log(`  ✓ ${i + 1}/${count} commandes créées`, 'green');
      }
    } catch (error) {
      log(`  ✗ Erreur lors de la création de la commande ${i + 1}: ${error}`, 'red');
    }
  }
  
  log(`✅ ${orderIds.length} commandes créées avec succès!`, 'green');
  return orderIds;
}

async function seedReviews(count: number = 30, productIds: string[], userIds: string[]) {
  log(`\n⭐ Génération de ${count} avis...`, 'blue');
  
  const reviewIds: string[] = [];
  const clientIds = userIds.slice(0, 4);
  
  for (let i = 0; i < count; i++) {
    try {
      const review = createMockReview({
        productId: productIds[Math.floor(Math.random() * productIds.length)],
        clientId: clientIds[Math.floor(Math.random() * clientIds.length)]
      });
      
      // Convertir les dates en Timestamp pour Firebase
      const reviewData = {
        ...review,
        createdAt: review.createdAt,
        response: review.response ? {
          ...review.response,
          createdAt: review.response.createdAt
        } : null
      };
      
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      reviewIds.push(docRef.id);
      
      if ((i + 1) % 10 === 0) {
        log(`  ✓ ${i + 1}/${count} avis créés`, 'green');
      }
    } catch (error) {
      log(`  ✗ Erreur lors de la création de l'avis ${i + 1}: ${error}`, 'red');
    }
  }
  
  log(`✅ ${reviewIds.length} avis créés avec succès!`, 'green');
  return reviewIds;
}

async function seedMarketingCodes(count: number = 10, userIds: string[]) {
  log(`\n🎫 Génération de ${count} codes marketing...`, 'blue');
  
  const codeIds: string[] = [];
  const marketisteIds = userIds.slice(7, 9); // Les 2 marketistes
  
  for (let i = 0; i < count; i++) {
    try {
      const code = createMockMarketingCode({
        marketisteId: marketisteIds[Math.floor(Math.random() * marketisteIds.length)]
      });
      
      // Convertir les dates en Timestamp pour Firebase
      const codeData = {
        ...code,
        validFrom: code.validFrom,
        validUntil: code.validUntil || null
      };
      
      const docRef = await addDoc(collection(db, 'marketingCodes'), codeData);
      codeIds.push(docRef.id);
      
      log(`  ✓ Code créé: ${code.code}`, 'green');
    } catch (error) {
      log(`  ✗ Erreur lors de la création du code ${i + 1}: ${error}`, 'red');
    }
  }
  
  log(`✅ ${codeIds.length} codes marketing créés avec succès!`, 'green');
  return codeIds;
}

async function main() {
  log('\n🚀 Démarrage du seeding de Firebase Firestore...', 'cyan');
  log('================================================\n', 'cyan');
  
  try {
    // 1. Créer les utilisateurs d'abord
    const userIds = await seedUsers(10);
    
    // 2. Créer les produits
    const fournisseurIds = userIds.slice(4, 7); // Les 3 fournisseurs créés
    const productIds = await seedProducts(50, fournisseurIds);
    
    // 3. Créer les commandes
    const orderIds = await seedOrders(20, productIds, userIds);
    
    // 4. Créer les avis
    const reviewIds = await seedReviews(30, productIds, userIds);
    
    // 5. Créer les codes marketing
    const codeIds = await seedMarketingCodes(10, userIds);
    
    // Résumé
    log('\n================================================', 'cyan');
    log('✨ SEEDING TERMINÉ AVEC SUCCÈS! ✨', 'cyan');
    log('================================================\n', 'cyan');
    
    log('📊 Résumé:', 'yellow');
    log(`  • ${userIds.length} utilisateurs`, 'yellow');
    log(`  • ${productIds.length} produits`, 'yellow');
    log(`  • ${orderIds.length} commandes`, 'yellow');
    log(`  • ${reviewIds.length} avis`, 'yellow');
    log(`  • ${codeIds.length} codes marketing`, 'yellow');
    log('\n✅ Toutes les données ont été insérées dans Firebase!\n', 'green');
    
  } catch (error) {
    log(`\n❌ Erreur lors du seeding: ${error}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
main().then(() => {
  log('🎉 Script terminé!', 'green');
  process.exit(0);
}).catch((error) => {
  log(`❌ Erreur fatale: ${error}`, 'red');
  console.error(error);
  process.exit(1);
});
