/**
 * Script de synchronisation Firestore → Algolia
 * Usage: npm run algolia:sync
 * 
 * Ce script lit tous les produits actifs de Firestore
 * et les indexe dans Algolia pour la recherche full-text.
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { algoliasearch } from 'algoliasearch';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const algoliaAdminKey = process.env.ALGOLIA_ADMIN_KEY || '';

if (!algoliaAppId || !algoliaAdminKey) {
    console.error('❌ Variables Algolia manquantes dans .env.local');
    console.error('   NEXT_PUBLIC_ALGOLIA_APP_ID et ALGOLIA_ADMIN_KEY requis');
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const client = algoliasearch(algoliaAppId, algoliaAdminKey);
const index = client.initIndex('products');

async function syncProducts() {
    console.log('🔄 Démarrage de la synchronisation Firestore → Algolia...');

    // Configurer l'index Algolia (attributs searchables, tri, facettes)
    await index.setSettings({
        searchableAttributes: [
            'name',
            'description',
            'category',
            'subcategory',
            'tags',
            'country',
        ],
        attributesForFaceting: [
            'searchable(category)',
            'searchable(country)',
            'isActive',
        ],
        ranking: [
            'desc(sales)',
            'desc(rating)',
            'desc(reviewCount)',
            'typo',
            'geo',
            'words',
            'filters',
            'proximity',
            'attribute',
            'exact',
            'custom',
        ],
        customRanking: ['desc(sales)', 'desc(rating)'],
    });
    console.log('⚙️  Index configuré');

    // Récupérer tous les produits actifs de Firestore
    const productsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true)
    );

    const snapshot = await getDocs(productsQuery);
    console.log(`📦 ${snapshot.size} produits trouvés dans Firestore`);

    if (snapshot.empty) {
        console.log('ℹ️  Aucun produit à indexer');
        return;
    }

    // Préparer les objets Algolia
    const records = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            objectID: doc.id,
            name: data.name || '',
            description: data.description || '',
            category: data.category || '',
            subcategory: data.subcategory || '',
            tags: data.tags || [],
            images: data.images || [],
            prices: data.prices || [],
            moq: data.moq || 1,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            sales: data.sales || 0,
            stock: data.stock || 0,
            country: data.country || '',
            deliveryTime: data.deliveryTime || '',
            fournisseurId: data.fournisseurId || '',
            isActive: data.isActive || false,
        };
    });

    // Envoyer par lots de 1000 (limite Algolia)
    const batchSize = 1000;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await index.saveObjects(batch);
        console.log(`✅ Lot ${Math.floor(i / batchSize) + 1} indexé : ${batch.length} produits`);
    }

    console.log(`\n🎉 Synchronisation terminée ! ${records.length} produits indexés dans Algolia.`);
    console.log('   Index: products');
    console.log(`   App ID: ${algoliaAppId}`);
}

syncProducts().catch((error) => {
    console.error('❌ Erreur de synchronisation:', error);
    process.exit(1);
});
