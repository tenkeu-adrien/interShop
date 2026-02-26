'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, MessageCircle, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useChatStore } from '@/store/chatStore';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const { totalUnreadCount } = useChatStore();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const navItems = [
    { href: '/', icon: Home, label: tNav('home') },
    { href: '/products', icon: ShoppingBag, label: tNav('products') },
    { href: '/cart', icon: ShoppingCart, label: tNav('cart'), badge: items.length },
    { href: '/chat', icon: MessageCircle, label: tNav('messages'), badge: totalUnreadCount, requireAuth: true },
    { href: user ? '/dashboard' : '/login', icon: User, label: user ? tNav('profile') : tCommon('login') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          // Skip auth-required items if not logged in
          if (item.requireAuth && !user) return null;
          
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full relative ${
                isActive ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </motion.div>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-green-600 rounded-b-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
