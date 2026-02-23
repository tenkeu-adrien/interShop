import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, role } = await request.json();

    if (!email || !password || !displayName || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Créer l'utilisateur Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Créer le document utilisateur dans Firestore
    const userData = {
      id: user.uid,
      email,
      displayName,
      role,
      accountStatus: 'email_unverified',
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    // Générer un token
    const idToken = await user.getIdToken();

    return NextResponse.json({
      success: true,
      user: userData,
      token: idToken,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur d\'inscription' },
      { status: 400 }
    );
  }
}
