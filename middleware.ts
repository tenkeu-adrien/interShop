import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

// Middleware next-intl pour la gestion des locales
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Assure la redirection de / vers /[locale] pour éviter les 404
});

// Routes qui nécessitent une authentification
const protectedRoutes = ['/dashboard', '/cart', '/checkout', '/orders', '/messages'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclure les routes API de l'i18n
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Pour l'instant, la vérification d'authentification se fait côté client
  // avec AuthProvider et ProtectedRoute component
  if (isProtectedRoute) {
    return intlMiddleware(request);
  }

  // Appliquer le middleware i18n sur toutes les autres routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match toutes les routes sauf les fichiers statiques et _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
