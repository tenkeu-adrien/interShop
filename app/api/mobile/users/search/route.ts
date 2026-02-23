import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');
    const currentUserId = searchParams.get('currentUserId');
    
    console.log('🔍 [API] Search users:', { searchQuery, currentUserId });
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'La recherche doit contenir au moins 2 caractères'
      }, { status: 400 });
    }
    
    const searchTerm = searchQuery.trim().toLowerCase();
    const users: any[] = [];
    const seenIds = new Set<string>();
    
    // Recherche par email (exact match)
    try {
      const emailQuery = query(
        collection(db, 'users'),
        where('email', '==', searchTerm),
        limit(5)
      );
      const emailResults = await getDocs(emailQuery);
      emailResults.docs.forEach(doc => {
        if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          users.push({ id: doc.id, ...doc.data() });
        }
      });
    } catch (error) {
      console.error('Error searching by email:', error);
    }
    
    // Recherche par numéro de téléphone (exact match)
    try {
      const phoneQuery = query(
        collection(db, 'users'),
        where('phoneNumber', '==', searchTerm),
        limit(5)
      );
      const phoneResults = await getDocs(phoneQuery);
      phoneResults.docs.forEach(doc => {
        if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          users.push({ id: doc.id, ...doc.data() });
        }
      });
    } catch (error) {
      console.error('Error searching by phone:', error);
    }
    
    // Recherche par displayName (partial match)
    // Note: Firestore ne supporte pas les recherches LIKE, donc on récupère tous les users
    // et on filtre côté serveur (pas optimal pour grande base de données)
    if (users.length < 5) {
      try {
        const allUsersQuery = query(
          collection(db, 'users'),
          limit(50) // Limiter pour les performances
        );
        const allUsersResults = await getDocs(allUsersQuery);
        
        allUsersResults.docs.forEach(doc => {
          if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
            const userData = doc.data();
            const displayName = (userData.displayName || '').toLowerCase();
            const email = (userData.email || '').toLowerCase();
            
            // Recherche partielle dans displayName ou email
            if (displayName.includes(searchTerm) || email.includes(searchTerm)) {
              seenIds.add(doc.id);
              users.push({ id: doc.id, ...userData });
            }
          }
        });
      } catch (error) {
        console.error('Error searching by displayName:', error);
      }
    }
    
    // Limiter à 10 résultats
    const limitedUsers = users.slice(0, 10);
    
    console.log(`✅ [API] Found ${limitedUsers.length} users`);
    
    return NextResponse.json({
      success: true,
      users: limitedUsers
    });
  } catch (error: any) {
    console.error('❌ [API] Error searching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la recherche'
      },
      { status: 500 }
    );
  }
}
