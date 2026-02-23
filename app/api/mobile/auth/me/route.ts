import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    // Extraire l'userId du token (simplifié - en production, vérifier le token Firebase)
    const token = authHeader.substring(7);
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    // Récupérer les données utilisateur
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
        updatedAt: userData.updatedAt?.toDate?.() || userData.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
