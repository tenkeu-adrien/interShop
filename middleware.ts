import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedRoutes = ['/dashboard', '/cart', '/checkout', '/orders', '/messages'];

// Routes réservées aux fournisseurs
const fournisseurRoutes = ['/dashboard/fournisseur'];

// Routes réservées aux marketistes
const marketisteRoutes = ['/dashboard/marketiste'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Pour l'instant, on laisse passer toutes les requêtes
  // La vérification d'authentification se fait côté client avec AuthProvider
  // et ProtectedRoute component

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
