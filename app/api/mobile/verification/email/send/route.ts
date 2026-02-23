import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    console.log('📨 API /api/mobile/verification/email/send appelée');

    // Vérifier Firebase Admin
    if (!isFirebaseAdminAvailable || !adminDb) {
      console.error('❌ Firebase Admin non disponible');
      return NextResponse.json(
        { success: false, error: 'Firebase Admin non configuré' },
        { status: 503 }
      );
    }

    // Vérifier Email
    if (!isEmailConfigured || !transporter) {
      console.error('❌ Email non configuré');
      return NextResponse.json(
        { success: false, error: 'Email non configuré' },
        { status: 503 }
      );
    }

    const { userId, email, displayName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'userId et email requis' },
        { status: 400 }
      );
    }

    console.log("📧 Envoi code pour:", email, "userId:", userId);

    // Générer le code
    const code = generateOTP();
    const now = Date.now();
    const expiresAt = now + (4 * 60 * 1000); // +4 minutes

    console.log("🔑 Code généré:", code);

    // Sauvegarder dans Firestore avec Firebase Admin
    try {
      const verificationData = {
        code,
        email: email.toLowerCase(),
        userId,
        createdAt: now,
        expiresAt: expiresAt,
        attempts: 1,
        verified: false
      };

      await adminDb.collection('emailVerifications').doc(userId).set(verificationData);
      console.log("✅ Document créé dans Firestore");

    } catch (firestoreError: any) {
      console.error("❌ Erreur Firestore:", firestoreError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la sauvegarde du code' },
        { status: 500 }
      );
    }

    // Envoyer l'email
    try {
      console.log("📤 Envoi de l'email...");
      
      await transporter.sendMail({
        from: `"Intershop Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Code de vérification Intershop',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
              <h1>🔐 Vérification de votre compte</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px;">
              <p>Bonjour <strong>${displayName || 'Utilisateur'}</strong>,</p>
              <p>Voici votre code de vérification :</p>
              <div style="background: white; border: 2px dashed #10B981; padding: 20px; text-align: center; margin: 20px 0;">
                <div style="font-size: 32px; font-weight: bold; color: #10B981; letter-spacing: 8px;">${code}</div>
              </div>
              <p><strong>⏰ Ce code expire dans 4 minutes.</strong></p>
              <p>Cordialement,<br>L'équipe Intershop</p>
            </div>
          </div>
        `,
      });

      console.log("✅ Email envoyé avec succès");

    } catch (emailError: any) {
      console.error("❌ Erreur email:", emailError);
      // Ne pas échouer si l'email ne part pas, le code est déjà sauvegardé
    }

    return NextResponse.json({
      success: true,
      message: 'Code envoyé',
      // En dev, retourner le code pour faciliter les tests
      ...(process.env.NODE_ENV === 'development' && { code })
    });

  } catch (error: any) {
    console.error('❌ Erreur globale:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
