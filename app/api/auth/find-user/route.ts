import { NextResponse } from 'next/server';

// Import conditionnel de Firebase Admin
let adminDb: any = null;
let adminAuth: any = null;
let isFirebaseAdminAvailable = false;

try {
  const firebaseAdmin = require('@/lib/firebase-admin');
  adminDb = firebaseAdmin.adminDb;
  adminAuth = firebaseAdmin.adminAuth;
  isFirebaseAdminAvailable = true;
} catch (error) {
  console.error('⚠️ Firebase Admin non disponible:', error);
}

export async function GET(request: Request) {
  try {
    console.log('🔍 API /api/auth/find-user appelée');
    
    // Vérifier Firebase Admin
    if (!isFirebaseAdminAvailable || !adminDb || !adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin non configuré' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    console.log('📧 Recherche de l\'utilisateur avec email:', email);
    console.log('   Email normalisé:', email.toLowerCase().trim());

    // Méthode 1 : Chercher dans Firebase Auth directement (PRIORITAIRE)
    try {
      console.log('🔍 Tentative de recherche dans Firebase Auth...');
      const userRecord = await adminAuth.getUserByEmail(email);
      console.log('✅ Utilisateur trouvé dans Firebase Auth');
      console.log('   - UID:', userRecord.uid);
      console.log('   - Email:', userRecord.email);
      console.log('   - DisplayName:', userRecord.displayName);
      console.log('   - EmailVerified:', userRecord.emailVerified);
      
      // Vérifier si l'utilisateur existe aussi dans Firestore avec le même UID
      const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('✅ Utilisateur trouvé aussi dans Firestore avec le même UID');
        
        return NextResponse.json({
          userId: userRecord.uid, // UID de Firebase Auth (le bon)
          email: userRecord.email,
          displayName: userRecord.displayName || userData.displayName || userData.fullName || 'Utilisateur'
        });
      } else {
        console.log('⚠️ Utilisateur existe dans Auth mais pas dans Firestore avec le même UID');
        console.log('   Vérification si un document Firestore existe avec un autre ID...');
        
        // Chercher dans Firestore par email
        const usersSnapshot = await adminDb
          .collection('users')
          .where('email', '==', email.toLowerCase())
          .limit(1)
          .get();
        
        if (!usersSnapshot.empty) {
          const firestoreDoc = usersSnapshot.docs[0];
          console.log('⚠️ ATTENTION: Document Firestore trouvé avec un ID différent !');
          console.log('   - Firebase Auth UID:', userRecord.uid);
          console.log('   - Firestore Doc ID:', firestoreDoc.id);
          console.log('   💡 Utilisation de l\'UID Firebase Auth (correct)');
        }
        
        // Toujours retourner l'UID de Firebase Auth
        return NextResponse.json({
          userId: userRecord.uid, // UID de Firebase Auth (le bon)
          email: userRecord.email,
          displayName: userRecord.displayName || 'Utilisateur'
        });
      }
    } catch (authError: any) {
      console.log('❌ Utilisateur non trouvé dans Firebase Auth');
      console.log('   - Code erreur:', authError.code);
      console.log('   - Message:', authError.message);
      console.log('   - Email recherché:', email);
      
      // Vérifier si c'est vraiment une erreur "user not found"
      if (authError.code === 'auth/user-not-found') {
        console.log('⚠️ Aucun utilisateur avec cet email dans Firebase Auth');
        console.log('💡 L\'utilisateur doit s\'inscrire ou utiliser le bon email');
      }
      
      // Si l'utilisateur n'existe pas dans Firebase Auth, c'est un problème
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec cet email. Veuillez vous inscrire.' },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error('❌ Erreur find-user:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
