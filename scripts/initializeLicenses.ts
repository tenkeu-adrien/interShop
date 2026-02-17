import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { LicenseConfig } from '../types';

const licenses: Omit<LicenseConfig, 'id'>[] = [
  {
    tier: 'free',
    name: 'Free',
    productQuota: 5,
    priceUSD: 0,
    features: [
      '5 produits maximum',
      'Support par email',
      'Statistiques de base',
      'Accès aux 4 catégories'
    ],
    isActive: true
  },
  {
    tier: 'basic',
    name: 'Basic',
    productQuota: 50,
    priceUSD: 99,
    features: [
      '50 produits maximum',
      'Support prioritaire',
      'Statistiques avancées',
      'Accès aux 4 catégories',
      'Badge vérifié'
    ],
    isActive: true
  },
  {
    tier: 'premium',
    name: 'Premium',
    productQuota: 200,
    priceUSD: 299,
    features: [
      '200 produits maximum',
      'Support prioritaire 24/7',
      'Analytics complets',
      'Accès aux 4 catégories',
      'Badge vérifié',
      'Mise en avant des produits',
      'API access'
    ],
    isActive: true
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    productQuota: -1, // Unlimited
    priceUSD: 999,
    features: [
      'Produits illimités',
      'Support dédié 24/7',
      'Analytics personnalisés',
      'Accès aux 4 catégories',
      'Badge vérifié premium',
      'Mise en avant prioritaire',
      'API access complet',
      'Multi-utilisateurs',
      'Formation personnalisée'
    ],
    isActive: true
  }
];

async function initializeLicenses() {
  console.log('🚀 Initialisation des licences...');
  
  try {
    const licensesRef = collection(db, 'licenses');
    
    for (const license of licenses) {
      const licenseId = license.tier;
      const licenseDoc = doc(licensesRef, licenseId);
      
      await setDoc(licenseDoc, {
        ...license,
        id: licenseId
      });
      
      console.log(`✅ Licence ${license.name} créée avec succès`);
    }
    
    console.log('🎉 Toutes les licences ont été initialisées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des licences:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  initializeLicenses()
    .then(() => {
      console.log('✨ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { initializeLicenses };
