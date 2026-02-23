# Liens Contextuels dans le Chat - Documentation

## Vue d'ensemble

Le système de chat affiche maintenant des liens cliquables vers les produits, profils, hôtels, restaurants et commandes directement dans l'interface de chat. Cela permet aux utilisateurs de naviguer facilement vers les éléments concernés par la conversation.

## Fonctionnalités Implémentées

### 1. Liens Contextuels dans l'En-tête du Chat

Chaque conversation affiche maintenant un lien cliquable vers l'élément concerné dans l'en-tête du `ChatWindow`.

#### Types de Liens Supportés

| Type de Conversation | Lien | Icône | Couleur |
|---------------------|------|-------|---------|
| `product_inquiry` | `/products/[id]` | 📦 Package | Bleu |
| `dating_inquiry` | `/dating/[id]` | ❤️ Heart | Rose |
| `hotel_inquiry` | `/hotels/[id]` | 🏨 Hotel | Violet |
| `restaurant_inquiry` | `/restaurants/[id]` | 🍽️ Utensils | Orange |
| `order` | `/orders/[id]` | 📦 Package | Vert |

#### Exemple Visuel

```
┌─────────────────────────────────────────┐
│ ← [Avatar] Jean Dupont                  │
│    En ligne                             │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [📦] iPhone 15 Pro Max 256GB       │ │
│ │ 🔗 Voir le produit                  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. Affichage Dynamique selon le Contexte

Le composant `ChatWindow` détecte automatiquement le type de conversation et affiche le lien approprié:

```typescript
const getContextInfo = () => {
  if (!conversation?.context) return null;

  const { context } = conversation;
  
  switch (context.type) {
    case 'product_inquiry':
      return {
        link: `/products/${context.productId}`,
        icon: <Package />,
        label: 'Voir le produit',
        name: context.metadata?.productName
      };
    
    case 'dating_inquiry':
      return {
        link: `/dating/${context.datingProfileId}`,
        icon: <Heart />,
        label: 'Voir le profil',
        name: context.metadata?.profileName
      };
    
    // ... autres types
  }
};
```

### 3. Design Amélioré

Le lien contextuel utilise un design moderne avec:
- **Gradient de fond**: De bleu à violet pour attirer l'attention
- **Icône dans un cercle blanc**: Pour une meilleure visibilité
- **Effet hover**: Ombre portée au survol
- **Texte tronqué**: Pour les noms longs
- **Icône de lien externe**: Pour indiquer la navigation

### 4. Compatibilité Rétroactive

Le système maintient la compatibilité avec l'ancien format `productContext`:

```typescript
{/* Legacy Product Context (for backward compatibility) */}
{!contextInfo && productContext && (
  <Link href={`/products/${productContext.productId}`}>
    {/* Ancien format */}
  </Link>
)}
```

### 5. Liens dans les Messages

Les références de produits dans les messages individuels sont également cliquables et s'ouvrent dans un nouvel onglet:

```typescript
<Link
  href={`/products/${message.productReference.productId}`}
  target="_blank"
  className="..."
>
  {/* Contenu du message avec produit */}
</Link>
```

## Flux Utilisateur

### Scénario 1: Client consulte une conversation sur un produit

1. Client ouvre une conversation depuis `/chat`
2. Voit le lien vers le produit dans l'en-tête
3. Clique sur "Voir le produit"
4. Est redirigé vers `/products/[id]`
5. Peut consulter les détails du produit
6. Utilise le bouton retour du navigateur pour revenir au chat

### Scénario 2: Fournisseur répond à une demande d'hôtel

1. Fournisseur ouvre la conversation
2. Voit le lien vers l'hôtel concerné
3. Clique pour vérifier les détails de l'hôtel
4. Revient au chat pour répondre au client

### Scénario 3: Navigation depuis un message avec produit

1. Utilisateur voit un message avec référence produit
2. Clique sur la carte produit dans le message
3. Le produit s'ouvre dans un nouvel onglet
4. Peut comparer les informations sans perdre la conversation

## Modifications Apportées

### Fichiers Modifiés

#### 1. `components/chat/ChatWindow.tsx`

**Ajouts:**
- Import des icônes: `Heart`, `Hotel`, `UtensilsCrossed`
- Import du type `Conversation`
- Nouvelle prop `conversation?: Conversation`
- Fonction `getContextInfo()` pour déterminer le lien contextuel
- Section "Context Link" dans l'en-tête
- Attribut `target="_blank"` sur les liens de produits dans les messages

**Changements:**
```typescript
// Avant
interface ChatWindowProps {
  conversationId: string;
  receiverId: string;
  receiverName: string;
  receiverPhoto?: string;
  productContext?: {...};
}

// Après
interface ChatWindowProps {
  conversationId: string;
  receiverId: string;
  receiverName: string;
  receiverPhoto?: string;
  conversation?: Conversation;  // ✅ Nouveau
  productContext?: {...};
}
```

#### 2. `app/chat/[id]/page.tsx`

**Ajouts:**
- Passage de la prop `conversation` au `ChatWindow`

**Changements:**
```typescript
// Avant
<ChatWindow
  conversationId={conversation.id}
  receiverId={otherUserId!}
  receiverName={otherUser.name}
  receiverPhoto={otherUser.photo}
  productContext={conversation.productContext}
/>

// Après
<ChatWindow
  conversationId={conversation.id}
  receiverId={otherUserId!}
  receiverName={otherUser.name}
  receiverPhoto={otherUser.photo}
  conversation={conversation}  // ✅ Nouveau
  productContext={conversation.productContext}
/>
```

## Avantages

### Pour les Utilisateurs
- ✅ **Navigation facile**: Un clic pour accéder au produit/service
- ✅ **Contexte toujours visible**: Savoir de quoi on parle
- ✅ **Gain de temps**: Pas besoin de chercher le produit
- ✅ **Expérience fluide**: Navigation intuitive

### Pour les Fournisseurs
- ✅ **Vérification rapide**: Consulter les détails avant de répondre
- ✅ **Meilleure réactivité**: Réponses plus précises
- ✅ **Professionnalisme**: Interface soignée

### Pour les Développeurs
- ✅ **Code réutilisable**: Fonction `getContextInfo()` centralisée
- ✅ **Extensible**: Facile d'ajouter de nouveaux types
- ✅ **Type-safe**: TypeScript pour éviter les erreurs
- ✅ **Rétrocompatible**: Supporte l'ancien format

## Exemples de Code

### Ajouter un Nouveau Type de Contexte

Pour ajouter un nouveau type de contexte (par exemple, "service"):

1. **Ajouter le type dans `types/chat.ts`:**
```typescript
export type ConversationType = 
  | 'order'
  | 'product_inquiry'
  | 'dating_inquiry'
  | 'hotel_inquiry'
  | 'restaurant_inquiry'
  | 'service_inquiry'  // ✅ Nouveau
  | 'general'
  | 'support';

export interface ConversationContext {
  type: ConversationType;
  // ... autres champs
  serviceId?: string;  // ✅ Nouveau
  metadata?: {
    // ... autres champs
    serviceName?: string;  // ✅ Nouveau
  };
}
```

2. **Ajouter le cas dans `getContextInfo()`:**
```typescript
case 'service_inquiry':
  if (context.serviceId) {
    link = `/services/${context.serviceId}`;
    icon = <Wrench size={14} className="text-teal-600" />;
    label = 'Voir le service';
    name = context.metadata?.serviceName || 'Service';
  }
  break;
```

3. **Créer la fonction helper dans `chatHelpers.ts`:**
```typescript
export async function createServiceInquiryConversation(
  clientId: string,
  providerId: string,
  clientData: {...},
  providerData: {...},
  serviceId: string,
  serviceName: string
): Promise<string> {
  const context: ConversationContext = {
    type: 'service_inquiry',
    serviceId,
    metadata: { serviceName },
  };
  
  // ... reste du code
}
```

## Tests Recommandés

### Tests Manuels

1. ✅ **Test de navigation produit**
   - Créer une conversation sur un produit
   - Vérifier que le lien apparaît dans l'en-tête
   - Cliquer et vérifier la redirection

2. ✅ **Test de navigation rencontre**
   - Créer une conversation sur un profil
   - Vérifier l'icône cœur et le lien
   - Cliquer et vérifier la redirection

3. ✅ **Test de navigation hôtel**
   - Créer une conversation sur un hôtel
   - Vérifier l'icône hôtel et le lien
   - Cliquer et vérifier la redirection

4. ✅ **Test de navigation restaurant**
   - Créer une conversation sur un restaurant
   - Vérifier l'icône restaurant et le lien
   - Cliquer et vérifier la redirection

5. ✅ **Test de compatibilité rétroactive**
   - Tester avec une ancienne conversation (productContext)
   - Vérifier que le lien fonctionne toujours

6. ✅ **Test de messages avec produits**
   - Envoyer un message avec référence produit
   - Vérifier que le lien s'ouvre dans un nouvel onglet

### Tests Automatisés (À Implémenter)

```typescript
describe('ChatWindow Context Links', () => {
  it('should display product link for product_inquiry', () => {
    const conversation = {
      context: {
        type: 'product_inquiry',
        productId: '123',
        metadata: { productName: 'Test Product' }
      }
    };
    
    render(<ChatWindow conversation={conversation} {...props} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Voir le produit')).toHaveAttribute('href', '/products/123');
  });
  
  it('should display dating link for dating_inquiry', () => {
    // Test logic
  });
  
  it('should display hotel link for hotel_inquiry', () => {
    // Test logic
  });
  
  it('should display restaurant link for restaurant_inquiry', () => {
    // Test logic
  });
  
  it('should fallback to productContext if no context', () => {
    // Test logic
  });
});
```

## Prochaines Améliorations

### Court Terme
1. **Prévisualisation au survol**: Afficher un aperçu du produit/service au survol du lien
2. **Indicateur de disponibilité**: Afficher si le produit est en stock
3. **Prix dans le lien**: Afficher le prix actuel du produit
4. **Badge "Nouveau"**: Pour les nouveaux produits/services

### Moyen Terme
1. **Historique de navigation**: Garder trace des produits consultés depuis le chat
2. **Comparaison rapide**: Comparer plusieurs produits depuis le chat
3. **Ajout au panier direct**: Bouton pour ajouter au panier depuis le chat
4. **Partage de lien**: Partager le lien du produit avec d'autres contacts

### Long Terme
1. **Aperçu enrichi**: Afficher plus d'informations (avis, stock, délai)
2. **Recommandations**: Suggérer des produits similaires
3. **Négociation de prix**: Interface de négociation intégrée
4. **Suivi de commande**: Lien vers le suivi de livraison

## Conclusion

Les liens contextuels dans le chat améliorent significativement l'expérience utilisateur en permettant une navigation fluide entre les conversations et les produits/services concernés. Le système est extensible, type-safe et rétrocompatible, ce qui facilite son évolution future.

## Support

Pour toute question ou problème:
1. Vérifier que la conversation a bien un `context` défini
2. Vérifier que l'ID de l'élément (productId, hotelId, etc.) est présent
3. Vérifier que les métadonnées contiennent le nom de l'élément
4. Consulter les logs de la console pour les erreurs

## Changelog

### Version 1.0.0 (Actuelle)
- ✅ Ajout des liens contextuels pour tous les types de conversations
- ✅ Design moderne avec gradient et icônes
- ✅ Compatibilité rétroactive avec productContext
- ✅ Ouverture des liens produits dans les messages en nouvel onglet
- ✅ Documentation complète
