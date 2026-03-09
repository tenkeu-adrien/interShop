import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

// Configuration de l'email
let transporter: any = null;
let isEmailConfigured = false;

try {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    isEmailConfigured = true;
  }
} catch (error) {
  console.error('❌ Erreur Nodemailer:', error);
}

// Générer un code OTP à 6 chiffres
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request: Request) {
  try {
    console.log('🔐 API /api/auth/forgot-password appelée');

    if (!isFirebaseAdminAvailable || !adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin non configuré' },
        { status: 503 }
      );
    }

    if (!isEmailConfigured || !transporter) {
      return NextResponse.json(
        { error: 'Email non configuré' },
        { status: 503 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    console.log('📧 Recherche de l\'utilisateur:', email);

    // Chercher l'utilisateur par email
    const usersSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      // Ne pas révéler si l'email existe ou non pour la sécurité
      console.log('❌ Utilisateur non trouvé');
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe, un code de réinitialisation a été envoyé.'
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    console.log('✅ Utilisateur trouvé:', userId);

    // Générer le code
    const code = generateOTP();
    const now = Date.now();
    const expiresAt = now + (10 * 60 * 1000); // +10 minutes pour reset password

    console.log('🔑 Code généré:', code);

    // Sauvegarder dans Firestore
    await adminDb.collection('passwordResets').doc(userId).set({
      code,
      email: email.toLowerCase(),
      userId,
      createdAt: now,
      expiresAt: expiresAt,
      attempts: 0,
      used: false
    });

    console.log('✅ Code sauvegardé dans Firestore');

    // Envoyer l'email
    try {
      await transporter.sendMail({
        from: `"Shopmark Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Réinitialisation de votre mot de passe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f97316; color: white; padding: 30px; text-align: center;">
              <h1>🔐 Réinitialisation de mot de passe</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px;">
              <p>Bonjour <strong>${userData.displayName || 'Utilisateur'}</strong>,</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
              <p>Voici votre code de vérification :</p>
              <div style="background: white; border: 2px dashed #f97316; padding: 20px; text-align: center; margin: 20px 0;">
                <div style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px;">${code}</div>
              </div>
              <p><strong>⏰ Ce code expire dans 10 minutes.</strong></p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
              <p>Cordialement,<br>L'équipe de support</p>
            </div>
          </div>
        `,
      });

      console.log('✅ Email envoyé avec succès');
    } catch (emailError: any) {
      console.error('❌ Erreur email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe, un code de réinitialisation a été envoyé.',
      userId, // Nécessaire pour la vérification
      // En dev, retourner le code pour faciliter les tests
      ...(process.env.NODE_ENV === 'development' && { code })
    });

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
