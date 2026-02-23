import { NextRequest, NextResponse } from 'next/server';

// Import conditionnel de Firebase Admin
let adminDb: any = null;
let isFirebaseAdminAvailable = false;

try {
  const firebaseAdmin = require('@/lib/firebase-admin');
  adminDb = firebaseAdmin.adminDb;
  isFirebaseAdminAvailable = true;
} catch (error) {
  console.error('⚠️ Firebase Admin non disponible:', error);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API /api/mobile/verification/email/verify appelée');

    // Vérifier Firebase Admin
    if (!isFirebaseAdminAvailable || !adminDb) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin non configuré' },
        { status: 503 }
      );
    }

    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { success: false, error: 'userId et code requis' },
        { status: 400 }
      );
    }

    console.log('🔍 Vérification code pour userId:', userId);

    // Récupérer l'utilisateur
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Vérifier si déjà vérifié
    if (userData.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email déjà vérifié'
      });
    }

    // Récupérer le code depuis la collection emailVerifications
    const verificationDoc = await adminDb.collection('emailVerifications').doc(userId).get();

    if (!verificationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Aucun code de vérification trouvé' },
        { status: 404 }
      );
    }

    const verificationData = verificationDoc.data();

    // Vérifier le code
    if (verificationData.code !== code) {
      return NextResponse.json(
        { success: false, error: 'Code de vérification incorrect' },
        { status: 400 }
      );
    }

    // Vérifier l'expiration
    const now = Date.now();
    if (now > verificationData.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Le code de vérification a expiré' },
        { status: 400 }
      );
    }

    // Vérifier si déjà utilisé
    if (verificationData.verified) {
      return NextResponse.json(
        { success: false, error: 'Ce code a déjà été utilisé' },
        { status: 400 }
      );
    }

    // Déterminer le nouveau statut selon le rôle
    let newStatus = 'active';
    if (userData.role === 'fournisseur' || userData.role === 'marketiste') {
      newStatus = 'phone_unverified';
    }

    // Mettre à jour l'utilisateur
    await adminDb.collection('users').doc(userId).update({
      emailVerified: true,
      accountStatus: newStatus,
      updatedAt: new Date()
    });

    // Marquer la vérification comme utilisée
    await adminDb.collection('emailVerifications').doc(userId).update({
      verified: true,
      verifiedAt: new Date()
    });

    console.log('✅ Email vérifié avec succès');

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur globale:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
