import { NextResponse } from 'next/server';

// Import conditionnel de Firebase Admin
let adminAuth: any = null;
let adminDb: any = null;
let isFirebaseAdminAvailable = false;

try {
  console.log('🔄 Tentative de chargement de Firebase Admin...');
  const firebaseAdmin = require('@/lib/firebase-admin');
  adminAuth = firebaseAdmin.adminAuth;
  adminDb = firebaseAdmin.adminDb;
  
  if (adminAuth && adminDb) {
    isFirebaseAdminAvailable = true;
    console.log('✅ Firebase Admin chargé avec succès (reset-password)');
  } else {
    console.error('❌ Firebase Admin chargé mais adminAuth ou adminDb est null');
    console.error('   adminAuth:', !!adminAuth);
    console.error('   adminDb:', !!adminDb);
  }
} catch (error: any) {
  console.error('❌ Erreur lors du chargement de Firebase Admin:', error.message);
  console.error('   Stack:', error.stack);
}

export async function POST(request: Request) {
  try {
    console.log('🔐 API /api/auth/reset-password appelée');
    console.log('   Firebase Admin disponible:', isFirebaseAdminAvailable);
    console.log('   adminAuth:', !!adminAuth);
    console.log('   adminDb:', !!adminDb);

    if (!isFirebaseAdminAvailable || !adminAuth || !adminDb) {
      console.error('❌ Firebase Admin non configuré');
      console.error('   Variables d\'environnement:');
      console.error('   - FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
      console.error('   - FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
      console.error('   - FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
      
      return NextResponse.json(
        { 
          error: 'Firebase Admin non configuré',
          details: 'Vérifiez les variables FIREBASE_* dans .env'
        },
        { status: 503 }
      );
    }

    const { userId, code, newPassword } = await request.json();
    console.log('📝 Données reçues:');
    console.log('   - userId:', userId);
    console.log('   - code:', code);
    console.log('   - newPassword:', newPassword ? '***' : 'non fourni');

    if (!userId || !code || !newPassword) {
      return NextResponse.json(
        { error: 'userId, code et newPassword requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    console.log('🔍 Vérification du code pour userId:', userId);

    // Récupérer le document de réinitialisation
    const resetDoc = await adminDb
      .collection('passwordResets')
      .doc(userId)
      .get();

    if (!resetDoc.exists) {
      console.log('❌ Document passwordResets non trouvé pour userId:', userId);
      return NextResponse.json(
        { error: 'Code non trouvé ou expiré' },
        { status: 404 }
      );
    }

    const resetData = resetDoc.data();
    console.log('📄 Document passwordResets trouvé:', {
      code: resetData.code,
      expiresAt: new Date(resetData.expiresAt).toISOString(),
      used: resetData.used,
      attempts: resetData.attempts
    });

    const now = Date.now();

    // Vérifier si le code a expiré
    if (now > resetData.expiresAt) {
      console.log('⏰ Code expiré');
      return NextResponse.json(
        { error: 'Code expiré. Veuillez demander un nouveau code.' },
        { status: 400 }
      );
    }

    // Vérifier si le code a déjà été utilisé
    if (resetData.used) {
      console.log('🔒 Code déjà utilisé');
      return NextResponse.json(
        { error: 'Ce code a déjà été utilisé' },
        { status: 400 }
      );
    }

    // Vérifier si le code correspond
    if (resetData.code !== code) {
      console.log('❌ Code incorrect. Attendu:', resetData.code, 'Reçu:', code);
      
      // Incrémenter le nombre de tentatives
      await adminDb
        .collection('passwordResets')
        .doc(userId)
        .update({
          attempts: (resetData.attempts || 0) + 1
        });

      // Bloquer après 5 tentatives
      if ((resetData.attempts || 0) >= 5) {
        console.log('🚫 Trop de tentatives, suppression du document');
        await adminDb
          .collection('passwordResets')
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

    console.log('✅ Code valide, mise à jour du mot de passe...');

    // Code valide - réinitialiser le mot de passe
    await adminAuth.updateUser(userId, {
      password: newPassword
    });

    console.log('✅ Mot de passe mis à jour dans Firebase Auth');

    // Marquer le code comme utilisé
    await adminDb
      .collection('passwordResets')
      .doc(userId)
      .update({
        used: true,
        usedAt: now
      });

    console.log('✅ Document passwordResets marqué comme utilisé');
    console.log('✅ Mot de passe réinitialisé avec succès');

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur dans reset-password:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
