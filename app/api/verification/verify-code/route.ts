import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  try {
    console.log('🔍 API /api/verification/verify-code appelée');

    if (!isFirebaseAdminAvailable || !adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin non configuré' },
        { status: 503 }
      );
    }

    const { userId, code, type } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'userId et code requis' },
        { status: 400 }
      );
    }

    console.log('🔍 Vérification du code pour userId:', userId);

    // Récupérer le document de vérification
    const verificationDoc = await adminDb
      .collection('emailVerifications')
      .doc(userId)
      .get();

    if (!verificationDoc.exists) {
      return NextResponse.json(
        { error: 'Code non trouvé ou expiré' },
        { status: 404 }
      );
    }

    const verificationData = verificationDoc.data();
    const now = Date.now();

    // Vérifier si le code a expiré
    if (now > verificationData.expiresAt) {
      return NextResponse.json(
        { error: 'Code expiré. Veuillez demander un nouveau code.' },
        { status: 400 }
      );
    }

    // Vérifier si le code a déjà été vérifié
    if (verificationData.verified) {
      return NextResponse.json(
        { error: 'Ce code a déjà été utilisé' },
        { status: 400 }
      );
    }

    // Vérifier si le code correspond
    if (verificationData.code !== code) {
      // Incrémenter le nombre de tentatives
      await adminDb
        .collection('emailVerifications')
        .doc(userId)
        .update({
          attempts: (verificationData.attempts || 0) + 1
        });

      // Bloquer après 5 tentatives
      if ((verificationData.attempts || 0) >= 5) {
        await adminDb
          .collection('emailVerifications')
          .doc(userId)
          .delete();
        
        return NextResponse.json(
          { error: 'Trop de tentatives. Veuillez demander un nouveau code.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      );
    }

    // Code valide
    // Si c'est pour un reset de mot de passe, créer un document dans passwordResets
    if (type === 'password_reset') {
      await adminDb
        .collection('passwordResets')
        .doc(userId)
        .set({
          code: code,
          email: verificationData.email,
          createdAt: now,
          expiresAt: now + (10 * 60 * 1000), // 10 minutes pour changer le mot de passe
          attempts: 0,
          used: false
        });
    }

    // Marquer comme vérifié
    await adminDb
      .collection('emailVerifications')
      .doc(userId)
      .update({
        verified: true,
        verifiedAt: now
      });

    console.log('✅ Code vérifié avec succès');

    return NextResponse.json({
      success: true,
      message: 'Code vérifié avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
