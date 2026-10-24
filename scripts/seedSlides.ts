import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

const slides = [
  {
    title: "Soldes d'été jusqu'à -50%",
    description: "Profitez de réductions exceptionnelles sur une sélection de produits de qualité",
    buttonText: "Voir les promotions",
    buttonLink: "/products",
    buttonColor: "#FF5722",
    backgroundColor: "#FFF3E0",
    imageUrl: "/slide1.jpeg",
    isActive: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "system"
  },
  {
    title: "Découvrez nos nouveautés",
    description: "Les derniers produits ajoutés par nos fournisseurs de confiance",
    buttonText: "Explorer",
    buttonLink: "/products",
    buttonColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
    imageUrl: "/slide2.jpeg",
    isActive: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "system"
  },
  {
    title: "High-Tech & Électronique",
    description: "Smartphones, ordinateurs, accessoires et bien plus encore à prix imbattables",
    buttonText: "Voir la catégorie",
    buttonLink: "/products",
    buttonColor: "#2196F3",
    backgroundColor: "#E3F2FD",
    imageUrl: "/slide3.jpeg",
    isActive: true,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "system"
  }
];

async function seedSlides() {
  console.log('🎨 Création des slides par défaut...');
  
  try {
    for (const slide of slides) {
      const docRef = await addDoc(collection(db, 'heroSlides'), slide);
      console.log(`✅ Slide créé: ${slide.title} (ID: ${docRef.id})`);
    }
    
    console.log('\n🎉 3 slides créés avec succès !');
    console.log('📍 Allez sur http://localhost:3000/fr pour voir le résultat');
    console.log('⚙️ Gérez les slides sur http://localhost:3000/fr/dashboard/admin/slides');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des slides:', error);
  }
  
  process.exit(0);
}

seedSlides();
