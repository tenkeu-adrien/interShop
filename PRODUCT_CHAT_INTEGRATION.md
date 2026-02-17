# Intégration du Chat Professionnel avec Contexte Produit

## Vue d'Ensemble

Le système de chat a été amélioré pour inclure le contexte du produit dans les conversations. Quand un client contacte un fournisseur depuis une page produit, le produit est automatiquement lié à la conversation.

## 🎯 Fonctionnalités

### 1. Deux Options de Contact
- **Discuter avec le vendeur** - Ouvre une conversation normale avec le produit en contexte
- **Demander un devis** - Envoie automatiquement une demande de devis formelle

### 2. Contexte Produit
- Le produit est affiché dans le header de la conversation
- Chaque message lié au produit affiche une carte cliquable
- Le fournisseur voit immédiatement de quel produit il s'agit

### 3. Messages Spéciaux
- **Message Produit** - Affiche une carte du produit avec image, nom et prix
- **Demande de Devis** - Badge spécial "Demande de devis" avec le produit

## 📝 Intégration dans une Page Produit

### Exemple Complet

```tsx
// app/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductChatActions } from '@/components/products/ProductChatActions';
import { getProduct } from '@/lib/firebase/products';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [fournisseur, setFournisseur] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      // Charger le produit
      const productData = await getProduct(params.id as string);
      setProduct(productData);

      // Charger les infos du fournisseur
      const fournisseurDoc = await getDoc(doc(db, 'users', productData.fournisseurId));
      if (fournisseurDoc.exists()) {
        setFournisseur({
          name: fournisseurDoc.data().displayName || fournisseurDoc.data().shopName,
          photo: fournisseurDoc.data().photoURL || fournisseurDoc.data().shopLogo,
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!product || !fournisseur) return <div>Produit non trouvé</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images du produit */}
        <div>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full rounded-lg"
          />
        </div>

        {/* Informations du produit */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="mb-6">
            <p className="text-2xl font-bold text-blue-600">
              {product.prices[0].price} {product.prices[0].currency}
            </p>
            <p className="text-sm text-gray-600">
              MOQ: {product.moq} unités
            </p>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Boutons de Chat */}
          <ProductChatActions
            product={product}
            fournisseur={fournisseur}
            className="mb-6"
          />

          {/* Autres boutons */}
          <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600">
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Personnalisation

### Modifier les Messages Automatiques

```tsx
// Dans ProductChatActions.tsx

// Message pour "Discuter"
const messageDiscuter = `Bonjour, je suis intéressé par ce produit.`;

// Message pour "Demander un devis"
const messageDevis = `Je souhaiterais recevoir un devis détaillé pour ce produit. Merci de me communiquer vos meilleures conditions.`;
```

### Ajouter des Informations Supplémentaires

```tsx
// Ajouter la quantité souhaitée
const messageDevis = `Je souhaiterais recevoir un devis pour ${quantity} unités de ce produit.`;

// Ajouter des spécifications
const messageDevis = `Bonjour, je suis intéressé par ce produit.
Quantité souhaitée: ${quantity} unités
Délai de livraison souhaité: ${deliveryTime}
Destination: ${destination}

Merci de me communiquer votre meilleur prix.`;
```

## 📱 Affichage dans le Chat

### Pour le Client
```
┌─────────────────────────────────────┐
│ [Photo] Nom du Fournisseur          │
│ En ligne                             │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ 📦 Nom du Produit               │ │
│ │ Voir le produit →               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

[Message avec carte produit]
┌─────────────────────────────────────┐
│ ┌───────────────────────────────┐   │
│ │ [Image] Nom du Produit        │   │
│ │ 1000 USD                      │   │
│ │ Voir le produit →             │   │
│ └───────────────────────────────┘   │
│                                      │
│ Bonjour, je suis intéressé par      │
│ ce produit.                          │
└─────────────────────────────────────┘
```

### Pour le Fournisseur
```
┌─────────────────────────────────────┐
│ [Photo] Nom du Client                │
│ En ligne                             │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ 📦 Nom du Produit               │ │
│ │ Voir le produit →               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

[Message avec demande de devis]
┌─────────────────────────────────────┐
│ ┌───────────────────────────────┐   │
│ │ [Image] Nom du Produit        │   │
│ │ 1000 USD                      │   │
│ │ Voir le produit →             │   │
│ └───────────────────────────────┘   │
│                                      │
│ ┌─────────────────────────────┐     │
│ │ 💰 Demande de devis         │     │
│ └─────────────────────────────┘     │
│                                      │
│ Je souhaiterais recevoir un devis   │
│ détaillé pour ce produit.           │
└─────────────────────────────────────┘
```

## 🔄 Flux Utilisateur

### Scénario 1: Discussion Simple

1. Client visite la page produit
2. Clique sur "Discuter avec le vendeur"
3. Une conversation s'ouvre avec:
   - Le produit affiché dans le header
   - Un message automatique avec la carte du produit
4. Le client peut continuer la discussion normalement

### Scénario 2: Demande de Devis

1. Client visite la page produit
2. Clique sur "Demander un devis"
3. Une conversation s'ouvre avec:
   - Le produit affiché dans le header
   - Un message automatique avec badge "Demande de devis"
   - La carte du produit
4. Le fournisseur voit immédiatement qu'il s'agit d'une demande de devis
5. Le fournisseur peut répondre avec son devis

## 🎯 Cas d'Usage

### E-commerce
```tsx
<ProductChatActions
  product={{
    id: product.id,
    name: product.name,
    images: product.images,
    fournisseurId: product.fournisseurId,
    prices: product.prices,
  }}
  fournisseur={{
    name: fournisseur.shopName,
    photo: fournisseur.shopLogo,
  }}
/>
```

### Restaurant
```tsx
<ProductChatActions
  product={{
    id: restaurant.id,
    name: restaurant.name,
    images: restaurant.images,
    fournisseurId: restaurant.fournisseurId,
  }}
  fournisseur={{
    name: restaurant.name,
    photo: restaurant.images[0],
  }}
/>
```

### Hôtel
```tsx
<ProductChatActions
  product={{
    id: hotel.id,
    name: hotel.name,
    images: hotel.images,
    fournisseurId: hotel.fournisseurId,
  }}
  fournisseur={{
    name: hotel.name,
    photo: hotel.images[0],
  }}
/>
```

### Profil de Rencontre
```tsx
<ProductChatActions
  product={{
    id: profile.id,
    name: `Profil de ${profile.firstName}`,
    images: profile.images,
    fournisseurId: profile.fournisseurId,
  }}
  fournisseur={{
    name: 'Intermédiaire',
  }}
/>
```

## 🔧 Configuration Avancée

### Désactiver le Message Automatique

```tsx
// Modifier ProductChatActions.tsx
const handleStartChat = async () => {
  // ... code existant ...
  
  const conversationId = await getOrCreateConversation(
    user.id,
    product.fournisseurId,
    userData,
    fournisseurData,
    productReference
  );

  // Ne pas envoyer de message automatique
  // await sendTextMessage(...);

  router.push(`/chat/${conversationId}`);
};
```

### Ajouter un Formulaire de Devis

```tsx
const [showQuoteForm, setShowQuoteForm] = useState(false);
const [quantity, setQuantity] = useState(1);
const [message, setMessage] = useState('');

const handleRequestQuote = async () => {
  // ... créer la conversation ...
  
  const customMessage = `Demande de devis:
  
Produit: ${product.name}
Quantité: ${quantity} unités
Message: ${message}

Merci de me communiquer votre meilleur prix.`;

  await sendTextMessage(
    conversationId,
    user.id,
    user.displayName,
    user.photoURL,
    product.fournisseurId,
    customMessage,
    'quote_request',
    undefined,
    undefined,
    undefined,
    undefined,
    productReference
  );
};
```

## 📊 Analytics

### Tracker les Interactions

```tsx
// Dans ProductChatActions.tsx
import { analytics } from '@/lib/firebase/config';

const handleStartChat = async () => {
  // ... code existant ...
  
  // Track l'événement
  analytics.logEvent('chat_started', {
    product_id: product.id,
    product_name: product.name,
    fournisseur_id: product.fournisseurId,
  });
};

const handleRequestQuote = async () => {
  // ... code existant ...
  
  // Track l'événement
  analytics.logEvent('quote_requested', {
    product_id: product.id,
    product_name: product.name,
    fournisseur_id: product.fournisseurId,
  });
};
```

## ✅ Checklist d'Intégration

- [ ] Importer `ProductChatActions` dans la page produit
- [ ] Charger les données du produit
- [ ] Charger les données du fournisseur
- [ ] Passer les props correctement
- [ ] Tester le bouton "Discuter"
- [ ] Tester le bouton "Demander un devis"
- [ ] Vérifier l'affichage du produit dans le chat
- [ ] Vérifier les notifications
- [ ] Tester sur mobile
- [ ] Tester sur desktop

## 🎉 Résultat

Le système de chat est maintenant professionnel avec:
- ✅ Contexte produit visible
- ✅ Deux options de contact
- ✅ Messages automatiques intelligents
- ✅ Cartes produit cliquables
- ✅ Badge "Demande de devis"
- ✅ Navigation fluide
- ✅ Expérience utilisateur optimale

Prêt pour la production!
