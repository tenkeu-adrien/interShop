# Exemples d'Intégration du Chat

## 1. Page de Détail de Produit

Ajoutez le bouton de chat dans la page de détail d'un produit:

```tsx
// app/products/[id]/page.tsx
import { ChatButton } from '@/components/products/ChatButton';

export default function ProductDetailPage() {
  const product = // ... charger le produit
  const fournisseur = // ... charger le fournisseur

  return (
    <div>
      {/* Informations du produit */}
      
      {/* Boutons d'action */}
      <div className="flex gap-4">
        <button className="btn-primary">
          Ajouter au panier
        </button>
        
        <ChatButton
          fournisseurId={product.fournisseurId}
          fournisseurName={fournisseur.shopName}
          fournisseurPhoto={fournisseur.shopLogo}
          productName={product.name}
        />
      </div>
    </div>
  );
}
```

## 2. Page de Profil de Rencontre

Ajoutez le bouton pour contacter l'intermédiaire:

```tsx
// app/dating/[id]/page.tsx
import { ChatButton } from '@/components/products/ChatButton';

export default function DatingProfilePage() {
  const profile = // ... charger le profil
  
  return (
    <div>
      {/* Informations du profil */}
      
      {/* Bouton de contact */}
      <ChatButton
        fournisseurId={profile.fournisseurId}
        fournisseurName="Intermédiaire"
        productName={`Profil de ${profile.firstName}`}
        className="w-full"
      />
    </div>
  );
}
```

## 3. Page de Restaurant

```tsx
// app/restaurants/[id]/page.tsx
import { ChatButton } from '@/components/products/ChatButton';

export default function RestaurantPage() {
  const restaurant = // ... charger le restaurant
  
  return (
    <div>
      {/* Informations du restaurant */}
      
      {/* Bouton de contact */}
      <ChatButton
        fournisseurId={restaurant.fournisseurId}
        fournisseurName={restaurant.name}
        fournisseurPhoto={restaurant.images[0]}
        productName={restaurant.name}
      />
    </div>
  );
}
```

## 4. Page d'Hôtel

```tsx
// app/hotels/[id]/page.tsx
import { ChatButton } from '@/components/products/ChatButton';

export default function HotelPage() {
  const hotel = // ... charger l'hôtel
  
  return (
    <div>
      {/* Informations de l'hôtel */}
      
      {/* Bouton de contact */}
      <ChatButton
        fournisseurId={hotel.fournisseurId}
        fournisseurName={hotel.name}
        fournisseurPhoto={hotel.images[0]}
        productName={hotel.name}
      />
    </div>
  );
}
```

## 5. Liste de Produits (Carte)

Ajoutez un petit bouton de chat sur chaque carte de produit:

```tsx
// components/products/ProductCard.tsx
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getOrCreateConversation } from '@/lib/firebase/chat';
import { useAuthStore } from '@/store/authStore';

export function ProductCard({ product }) {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const handleQuickChat = async (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la navigation vers le produit
    e.stopPropagation();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    const conversationId = await getOrCreateConversation(
      user.id,
      product.fournisseurId,
      {
        name: user.displayName,
        photo: user.photoURL || undefined,
        role: user.role,
      },
      {
        name: product.fournisseurName,
        photo: product.fournisseurPhoto,
        role: 'fournisseur',
      }
    );
    
    router.push(`/chat/${conversationId}`);
  };
  
  return (
    <div className="product-card">
      {/* Contenu de la carte */}
      
      {/* Bouton de chat rapide */}
      <button
        onClick={handleQuickChat}
        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
        title="Contacter le vendeur"
      >
        <MessageCircle size={20} className="text-blue-500" />
      </button>
    </div>
  );
}
```

## 6. Dashboard Fournisseur

Ajoutez un lien vers les messages dans le dashboard:

```tsx
// app/dashboard/fournisseur/page.tsx
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

export default function FournisseurDashboard() {
  const { totalUnreadCount } = useChatStore();
  
  return (
    <div>
      {/* Autres widgets */}
      
      {/* Widget Messages */}
      <Link
        href="/chat"
        className="dashboard-card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={32} className="text-blue-500" />
            <div>
              <h3 className="font-bold">Messages</h3>
              <p className="text-sm text-gray-600">
                {totalUnreadCount > 0 
                  ? `${totalUnreadCount} nouveau(x) message(s)`
                  : 'Aucun nouveau message'
                }
              </p>
            </div>
          </div>
          {totalUnreadCount > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {totalUnreadCount}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
```

## 7. Notification Toast

Affichez une notification toast quand un nouveau message arrive:

```tsx
// components/layout/ChatNotificationListener.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MessageCircle } from 'lucide-react';

export function ChatNotificationListener() {
  const { user } = useAuthStore();
  const { conversations } = useChatStore();
  const router = useRouter();
  const prevCountRef = useRef(0);
  
  useEffect(() => {
    if (!user) return;
    
    const totalUnread = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount[user.id] || 0);
    }, 0);
    
    // Si le nombre de messages non lus augmente
    if (totalUnread > prevCountRef.current) {
      const newConv = conversations.find(conv => 
        conv.unreadCount[user.id] > 0 && 
        conv.lastMessage?.senderId !== user.id
      );
      
      if (newConv) {
        const otherUserId = newConv.participants.find(id => id !== user.id);
        const otherUser = newConv.participantsData[otherUserId!];
        
        toast.custom((t) => (
          <div
            onClick={() => {
              router.push(`/chat/${newConv.id}`);
              toast.dismiss(t.id);
            }}
            className="bg-white p-4 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="text-blue-500" size={24} />
              <div>
                <p className="font-semibold">{otherUser.name}</p>
                <p className="text-sm text-gray-600">
                  {newConv.lastMessage?.content}
                </p>
              </div>
            </div>
          </div>
        ), {
          duration: 5000,
          position: 'top-right',
        });
      }
    }
    
    prevCountRef.current = totalUnread;
  }, [conversations, user]);
  
  return null;
}
```

Puis ajoutez-le dans le layout:

```tsx
// app/layout.tsx
import { ChatNotificationListener } from '@/components/layout/ChatNotificationListener';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <ChatNotificationListener />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 8. Recherche de Conversations

Ajoutez une barre de recherche dans la liste des conversations:

```tsx
// components/chat/ChatList.tsx
import { useState } from 'react';
import { Search } from 'lucide-react';

export function ChatList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { conversations } = useChatStore();
  
  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherParticipant(conv);
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  return (
    <div>
      {/* Barre de recherche */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Liste des conversations */}
      {filteredConversations.map(conv => (
        // ...
      ))}
    </div>
  );
}
```

## 9. Bouton Flottant de Chat

Ajoutez un bouton flottant sur toutes les pages:

```tsx
// components/layout/FloatingChatButton.tsx
'use client';

import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export function FloatingChatButton() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { totalUnreadCount } = useChatStore();
  
  if (!user) return null;
  
  return (
    <button
      onClick={() => router.push('/chat')}
      className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 z-50"
    >
      <MessageCircle size={24} />
      {totalUnreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
        </span>
      )}
    </button>
  );
}
```

## 10. Message Pré-rempli

Démarrez une conversation avec un message pré-rempli:

```tsx
// Exemple: Depuis une page de produit
const handleContactWithMessage = async () => {
  const conversationId = await getOrCreateConversation(
    user.id,
    product.fournisseurId,
    userData,
    fournisseurData
  );
  
  // Envoyer un message automatique
  await sendMessage(
    conversationId,
    user.id,
    user.displayName,
    user.photoURL,
    product.fournisseurId,
    `Bonjour, je suis intéressé par votre produit "${product.name}". Pouvez-vous me donner plus d'informations ?`,
    'text'
  );
  
  router.push(`/chat/${conversationId}`);
};
```

Ces exemples montrent comment intégrer le système de chat dans différentes parties de votre application!
