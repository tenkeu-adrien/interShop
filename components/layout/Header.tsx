'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useChatStore } from '@/store/chatStore';
import {
  ShoppingCart,
  Search,
  Bell,
  MessageCircle,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  Package,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Hotel,
  Heart,
  Wallet,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { NotificationsModal } from '@/components/ui/NotificationsModal';
import { ImageSearchButton } from '@/components/search/ImageSearchButton';
import { useTranslations, useLocale } from 'next-intl';

export default function Header() {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');
  const tDashboard = useTranslations('dashboard');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { totalUnreadCount, subscribeTotalUnreadCount, unsubscribeTotalUnreadCount } = useChatStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Subscribe to unread count
  useEffect(() => {
    if (user) {
      subscribeTotalUnreadCount(user.id);
    }

    return () => {
      unsubscribeTotalUnreadCount();
    };
  }, [user]);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';

    switch (user.role) {
      case 'admin':
        return '/dashboard';
      case 'fournisseur':
        return '/dashboard/fournisseur';
      case 'marketiste':
        return '/dashboard/marketiste';
      case 'client':
        return '/dashboard/client';
      default:
        return '/dashboard';
    }
  };

  const getRoleLabel = () => {
    if (!user) return '';

    switch (user.role) {
      case 'admin':
        return tCommon('admin');
      case 'fournisseur':
        return tCommon('fournisseur');
      case 'marketiste':
        return tCommon('marketiste');
      case 'client':
        return tCommon('client');
      default:
        return user.role;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const changeLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setShowLangMenu(false);
  };

  return (
    <header className="bg-gradient-to-r from-yellow-400 via-green-400 to-yellow-500 text-gray-900 sticky top-0 z-50 shadow-lg px-2 py-3 md:p-5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="InterAppshop"
              className="object-contain"
              width={150}
              height={40}
              priority={true}
              sizes="(max-width: 768px) 120px, 150px"
            />
          </Link>

          {/* Barre de recherche */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tHome('search_placeholder')}
                className="w-full px-4 py-2.5 pr-24 rounded-full bg-white text-gray-900 border-2 border-green-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 shadow-sm transition-all"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <ImageSearchButton />
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                  aria-label={tCommon('search')}
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2 md:gap-4">
            {/* Lang Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1"
                aria-label={tCommon('language')}
              >
                <Globe size={20} className="text-gray-900" />
                <span className="hidden sm:inline text-xs font-bold uppercase">{locale}</span>
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden py-1"
                  >
                    <button onClick={() => changeLocale('fr')} className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${locale === 'fr' ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                      <span>🇫🇷</span> Français
                    </button>
                    <button onClick={() => changeLocale('en')} className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${locale === 'en' ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                      <span>🇺🇸</span> English
                    </button>
                    <button onClick={() => changeLocale('ar')} className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${locale === 'ar' ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                      <span>🇸🇦</span> العربية
                    </button>
                    <button onClick={() => changeLocale('sw')} className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${locale === 'sw' ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                      <span>🇰🇪</span> Kiswahili
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Currency Selector */}
            <div className="hidden lg:block">
              <CurrencySelector />
            </div>

            {/* Chat */}
            {user && (
              <Link
                href="/chat"
                className="hover:scale-110 transition-transform relative p-2 hover:bg-white/20 rounded-full"
                aria-label={tNav('messages')}
              >
                <MessageCircle size={22} className="text-gray-900" />
                {totalUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md">
                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {user && (
              <button
                onClick={() => setShowNotifications(true)}
                className="hover:scale-110 transition-transform relative p-2 hover:bg-white/20 rounded-full"
                aria-label={tNav('notifications')}
              >
                <Bell size={22} className="text-gray-900" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            )}

            {/* Panier */}
            <Link
              href="/cart"
              className="hover:scale-110 transition-transform relative p-2 hover:bg-white/20 rounded-full"
              aria-label={tNav('cart')}
            >
              <ShoppingCart size={22} className="text-gray-900" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md animate-bounce">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Menu Utilisateur */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-white/20 px-3 py-2 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block font-medium text-gray-900">
                    {user.displayName}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-900 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                    >
                      {/* User Info */}
                      <div className="bg-gradient-to-r from-yellow-400 to-green-400 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{user.displayName}</p>
                            <p className="text-sm text-gray-700">{getRoleLabel()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href={getDashboardLink()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <LayoutDashboard size={20} className="text-green-600" />
                          <span className="font-medium">{tNav('dashboard')}</span>
                        </Link>

                        {user.role === 'fournisseur' && (
                          <Link
                            href="/dashboard/fournisseur/products"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            <Package size={20} className="text-green-600" />
                            <span className="font-medium">{tDashboard('my_products')}</span>
                          </Link>
                        )}

                        {user.role === 'client' && (
                          <Link
                            href="/dashboard/client/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            <ShoppingBag size={20} className="text-green-600" />
                            <span className="font-medium">{tNav('orders')}</span>
                          </Link>
                        )}

                        {user.role === 'admin' && (
                          <Link
                            href="/dashboard/admin/users"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            <Users size={20} className="text-green-600" />
                            <span className="font-medium">{tCommon('users')}</span>
                          </Link>
                        )}

                        <Link
                          href="/wallet"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <Wallet size={20} className="text-green-600" />
                          <span className="font-medium">{tNav('wallet')}</span>
                        </Link>

                        <Link
                          href="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <Settings size={20} className="text-green-600" />
                          <span className="font-medium">{tCommon('settings')}</span>
                        </Link>

                        <div className="border-t border-gray-200 my-2"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                        >
                          <LogOut size={20} />
                          <span className="font-medium">{tCommon('logout')}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-md"
              >
                {tCommon('login')}
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Navigation secondaire */}
      <div className="bg-green-600 border-t border-green-500">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-4 md:gap-6 h-12 text-sm overflow-x-auto scrollbar-hide">
            <Link href="/products" className="text-white hover:text-yellow-300 font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">{tNav('products')}</span>
            </Link>
            <Link href="/restaurants" className="text-white hover:text-yellow-300 font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
              <UtensilsCrossed size={16} />
              <span className="hidden sm:inline">{tNav('restaurants')}</span>
            </Link>
            <Link href="/hotels" className="text-white hover:text-yellow-300 font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
              <Hotel size={16} />
              <span className="hidden sm:inline">{tNav('hotels')}</span>
            </Link>
            <Link href="/dating" className="text-white hover:text-yellow-300 font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
              <Heart size={16} />
              <span className="hidden sm:inline">{tNav('dating')}</span>
            </Link>
            <div className="hidden md:block h-6 w-px bg-green-500"></div>
            <Link href="/categories" className="text-white hover:text-yellow-300 font-medium transition-colors whitespace-nowrap">
              {tNav('categories')}
            </Link>
            <Link href="/suppliers" className="text-white hover:text-yellow-300 font-medium transition-colors whitespace-nowrap hidden md:inline">
              {tNav('suppliers')}
            </Link>
            <Link href="/deals" className="text-white hover:text-yellow-300 font-medium transition-colors whitespace-nowrap">
              {tNav('deals')}
            </Link>
            <Link href="/help" className="text-white hover:text-yellow-300 font-medium transition-colors whitespace-nowrap hidden lg:inline">
              {tNav('help')}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
