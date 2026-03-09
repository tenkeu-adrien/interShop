'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserData } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { registerServiceWorker } from '@/lib/firebase/registerServiceWorker';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const { subscribeTotalUnreadCount, unsubscribeTotalUnreadCount } = useChatStore();

  // Enregistrer le Service Worker au chargement
  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid);
        setUser(userData);
        
        console.log('🔔 Souscription au compteur de messages non lus pour:', firebaseUser.uid);
        // Souscrire au compteur de messages non lus
        subscribeTotalUnreadCount(firebaseUser.uid);
      } else {
        setUser(null);
        
        console.log('🔕 Désinscription du compteur de messages non lus');
        // Se désabonner quand l'utilisateur se déconnecte
        unsubscribeTotalUnreadCount();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeTotalUnreadCount();
    };
  }, [setUser, subscribeTotalUnreadCount, unsubscribeTotalUnreadCount]);

  return <>{children}</>;
}
