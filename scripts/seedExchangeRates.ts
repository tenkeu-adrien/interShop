/**
 * Script pour initialiser les taux de change manuels dans Firestore
 * Exécuter avec : npx tsx scripts/seedExchangeRates.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyADAhwcJqTy6uLzDXEzGwcF2JrxvknrD3g",
  authDomain: "interappshop-52f59.firebaseapp.com",
  projectId: "interappshop-52f59",
  storageBucket: "interappshop-52f59.firebasestorage.app",
  messagingSenderId: "181356461519",
  appId: "1:181356461519:web:997de951f20a2537a926ba",
  measurementId: "G-3Y3FCTGP6F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Taux de change par défaut (approximatifs, basés sur les valeurs de marché)
 * L'admin pourra les modifier ensuite via l'interface
 */
const defaultExchangeRates = [
  {
    currency: 'USD',
    currencyName: 'Dollar Américain',
    symbol: '$',
    flag: 'US',
    rateToUSD: 1,
    isActive: true
  },
  {
    currency: 'CDF',
    currencyName: 'Franc Congolais',
    symbol: 'FC',
    flag: 'CD',
    rateToUSD: 2800,
    isActive: true
  },
  {
    currency: 'XOF',
    currencyName: 'Franc CFA (BCEAO)',
    symbol: 'CFA',
    flag: 'SN',
    rateToUSD: 600,
    isActive: true
  },
  {
    currency: 'XAF',
    currencyName: 'Franc CFA (BEAC)',
    symbol: 'FCFA',
    flag: 'CM',
    rateToUSD: 600,
    isActive: true
  },
  {
    currency: 'GHS',
    currencyName: 'Cedi Ghanéen',
    symbol: '₵',
    flag: 'GH',
    rateToUSD: 12,
    isActive: true
  },
  {
    currency: 'NGN',
    currencyName: 'Naira Nigérian',
    symbol: '₦',
    flag: 'NG',
    rateToUSD: 1500,
    isActive: true
  },
  {
    currency: 'KES',
    currencyName: 'Shilling Kenyan',
    symbol: 'KSh',
    flag: 'KE',
    rateToUSD: 130,
    isActive: true
  },
  {
    currency: 'TZS',
    currencyName: 'Shilling Tanzanien',
    symbol: 'TSh',
    flag: 'TZ',
    rateToUSD: 2500,
    isActive: true
  },
  {
    currency: 'UGX',
    currencyName: 'Shilling Ougandais',
    symbol: 'USh',
    flag: 'UG',
    rateToUSD: 3700,
    isActive: true
  },
  {
    currency: 'ZAR',
    currencyName: 'Rand Sud-Africain',
    symbol: 'R',
    flag: 'ZA',
    rateToUSD: 18,
    isActive: true
  },
  {
    currency: 'MAD',
    currencyName: 'Dirham Marocain',
    symbol: 'DH',
    flag: 'MA',
    rateToUSD: 10,
    isActive: true
  },
  {
    currency: 'EGP',
    currencyName: 'Livre Égyptienne',
    symbol: 'E£',
    flag: 'EG',
    rateToUSD: 48,
    isActive: true
  },
  {
    currency: 'ETB',
    currencyName: 'Birr Éthiopien',
    symbol: 'Br',
    flag: 'ET',
    rateToUSD: 120,
    isActive: true
  },
  {
    currency: 'GNF',
    currencyName: 'Franc Guinéen',
    symbol: 'FG',
    flag: 'GN',
    rateToUSD: 8600,
    isActive: true
  },
  {
    currency: 'RWF',
    currencyName: 'Franc Rwandais',
    symbol: 'RF',
    flag: 'RW',
    rateToUSD: 1300,
    isActive: true
  },
  {
    currency: 'MGA',
    currencyName: 'Ariary Malgache',
    symbol: 'Ar',
    flag: 'MG',
    rateToUSD: 4500,
    isActive: true
  },
  {
    currency: 'MUR',
    currencyName: 'Roupie Mauricienne',
    symbol: '₨',
    flag: 'MU',
    rateToUSD: 45,
    isActive: true
  }
];

async function seedExchangeRates() {
  console.log('💰 Initialisation des taux de change dans Firestore...\n');

  try {
    let created = 0;
    let updated = 0;

    for (const rate of defaultExchangeRates) {
      const docRef = doc(db, 'adminExchangeRates', rate.currency);
      
      const data = {
        currency: rate.currency,
        currencyName: rate.currencyName,
        symbol: rate.symbol,
        flag: rate.flag,
        rateToUSD: rate.rateToUSD,
        isActive: rate.isActive,
        updatedAt: Timestamp.now(),
        updatedBy: 'system',
        updatedByName: 'System (Seed)',
        createdAt: Timestamp.now()
      };

      await setDoc(docRef, data, { merge: true });
      
      console.log(`✅ ${rate.currency.padEnd(5)} - ${rate.currencyName.padEnd(30)} | 1 USD = ${rate.rateToUSD.toLocaleString().padStart(10)} ${rate.symbol}`);
      created++;
    }

    console.log('\n' + '='.repeat(80));
    console.log(`🎉 ${created} taux de change initialisés avec succès !`);
    console.log('='.repeat(80));
    console.log('\n📍 Accédez à la page admin pour les modifier :');
    console.log('   👉 http://localhost:3000/fr/dashboard/admin/exchange-rates');
    console.log('   👉 http://localhost:3000/en/dashboard/admin/exchange-rates');
    console.log('\n💡 Ces taux sont approximatifs. Modifiez-les selon vos besoins.\n');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des taux:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Exécuter le script
seedExchangeRates();
