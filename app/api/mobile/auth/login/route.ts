import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Authentification Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Générer un token personnalisé
    const idToken = await user.getIdToken();

    return NextResponse.json({
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        displayName: userData.displayName,
        role: userData.role,
        accountStatus: userData.accountStatus,
        emailVerified: user.emailVerified,
        phoneVerified: userData.phoneVerified,
        photoURL: userData.photoURL,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      token: idToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur de connexion' },
      { status: 401 }
    );
  }
}
