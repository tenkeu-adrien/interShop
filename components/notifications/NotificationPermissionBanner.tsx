'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { 
  requestNotificationPermission, 
  areNotificationsSupported,
  getNotificationPermissionStatus 
} from '@/lib/firebase/messaging';
import toast from 'react-hot-toast';

export default function NotificationPermissionBanner() {
  const { user } = useAuthStore();
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si on doit afficher la bannière
    if (!user) return;
    
    const checkPermission = () => {
      // Vérifier si les notifications sont supportées
      if (!areNotificationsSupported()) {
        return;
      }

      const permission = getNotificationPermissionStatus();
      
      // Afficher la bannière seulement si la permission n'a pas encore été demandée
      // et que l'utilisateur n'a pas déjà refusé
      if (permission === 'default') {
        // Vérifier si l'utilisateur a déjà fermé la bannière (localStorage)
        const dismissed = localStorage.getItem('notification-banner-dismissed');
        if (!dismissed) {
          setShowBanner(true);
        }
      }
    };

    // Attendre un peu avant d'afficher (pour ne pas être trop intrusif)
    const timer = setTimeout(checkPermission, 3000);
    
    return () => clearTimeout(timer);
  }, [user]);

  const handleAllow = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await requestNotificationPermission(user.id);
      
      if (token) {
        toast.success('🔔 Notifications activées !');
        setShowBanner(false);
      } else {
        toast.error('Impossible d\'activer les notifications');
      }
    } catch (error) {
      console.error('Erreur activation notifications:', error);
      toast.error('Erreur lors de l\'activation');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Sauvegarder que l'utilisateur a fermé la bannière
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  const handleNotNow = () => {
    setShowBanner(false);
    // Ne pas sauvegarder dans localStorage pour redemander plus tard
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md mx-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-500 overflow-hidden">
            {/* Header avec icône */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bell size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Activer les notifications</h3>
                  <p className="text-white/90 text-sm">Restez informé en temps réel</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Recevez des notifications pour :
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-green-500" />
                  <span className="text-sm">Nouveaux messages</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-green-500" />
                  <span className="text-sm">Mises à jour de commandes</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-green-500" />
                  <span className="text-sm">Offres spéciales</span>
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check size={16} className="text-green-500" />
                  <span className="text-sm">Transactions wallet</span>
                </li>
              </ul>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAllow}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Activation...</span>
                    </>
                  ) : (
                    <>
                      <Bell size={18} />
                      <span>Activer</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleNotNow}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Plus tard
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                Vous pouvez modifier ce choix à tout moment dans les paramètres
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
