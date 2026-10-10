'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, MessageCircle, ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useCartStore } from '@/store/cartStore';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

export default function MobileNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useAuthStore();
  const { totalUnreadCount } = useChatStore();
  const cartCount = useCartStore((s) => s.items.length);
  const tNav = useTranslations('nav');

  const navItems = [
    { href: '/', icon: Home, label: tNav('home') },
    { href: '/categories', icon: LayoutGrid, label: tNav('categories') },
    { href: '/chat', icon: MessageCircle, label: tNav('messages'), badge: totalUnreadCount },
    { href: '/cart', icon: ShoppingCart, label: tNav('cart'), badge: cartCount },
    { href: user ? '/dashboard' : '/login', icon: User, label: tNav('profile') },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === `/${locale}` || pathname === '/';
    }
    return pathname.includes(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-full ${
                active ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <motion.div whileTap={{ scale: 0.9 }} className="flex items-center justify-center">
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                </motion.div>
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center z-10">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium truncate max-w-full px-0.5 ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobileActiveTab"
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