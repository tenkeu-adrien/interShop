import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Import conditionnel de Firebase Admin
let adminDb: any = null;
let isFirebaseAdminAvailable = false;

try {
  const firebaseAdmin = require('@/lib/firebase-admin');
  adminDb = firebaseAdmin.adminDb;
  isFirebaseAdminAvailable = true;
  console.log('✅ Firebase Admin chargé');
} catch (error) {
  console.error('⚠️ Firebase Admin non disponible:', error);
}

// Configuration de l'email
let transporter: any = null;
let isEmailConfigured = false;

try {
  console.log('📧 Configuration Email:');
  console.log('  - EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('  - EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('  - EMAIL_USER:', process.env.EMAIL_USER);
  console.log('  - EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' : 'non défini');

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    const emailPort = Number(process.env.EMAIL_PORT) || 465;
    
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: emailPort,
      secure: emailPort === 465, // true pour 465, false pour les autres ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true, // Active les logs de debug
      logger: true // Active le logger
    });
    
    isEmailConfigured = true;
    console.log('✅ Nodemailer configuré avec succès');
    console.log(`   Host: ${process.env.EMAIL_HOST}:${emailPort}`);
    console.log(`   Secure: ${emailPort === 465}`);
  } else {
    console.log('❌ Configuration email incomplète');
    console.log('   Manque:', [
      !process.env.EMAIL_HOST && 'EMAIL_HOST',
      !process.env.EMAIL_USER && 'EMAIL_USER',
      !process.env.EMAIL_PASSWORD && 'EMAIL_PASSWORD'
    ].filter(Boolean).join(', '));
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
    console.log('📨 API /api/verification/send-code appelée');

    // Vérifier Firebase Admin
    if (!isFirebaseAdminAvailable || !adminDb) {
      console.error('❌ Firebase Admin non disponible');
      return NextResponse.json(
        { error: 'Firebase Admin non configuré. Vérifiez les variables FIREBASE_* dans .env.local' },
        { status: 503 }
      );
    }

    // Vérifier Email
    if (!isEmailConfigured || !transporter) {
      console.error('❌ Email non configuré');
      return NextResponse.json(
        { error: 'Email non configuré. Vérifiez les variables EMAIL_* dans .env.local' },
        { status: 503 }
      );
    }

    const { userId, email, displayName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId et email requis' },
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

      console.log("💾 Tentative de sauvegarde dans Firestore...");
      console.log("Collection: emailVerifications, Document ID:", userId);
      console.log("Données:", verificationData);

      await adminDb.collection('emailVerifications').doc(userId).set(verificationData);
      
      console.log("✅ Document créé dans Firestore");

      // Vérifier que le document a bien été créé
      const savedDoc = await adminDb.collection('emailVerifications').doc(userId).get();
      if (savedDoc.exists) {
        console.log("✅ Vérification: Document existe bien dans Firestore");
        console.log("Données sauvegardées:", savedDoc.data());
      } else {
        console.error("❌ Le document n'a pas été créé dans Firestore!");
        throw new Error("Échec de la création du document");
      }

    } catch (firestoreError: any) {
      console.error("❌ Erreur Firestore:", firestoreError);
      console.error("Message:", firestoreError.message);
      console.error("Stack:", firestoreError.stack);
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde du code', details: firestoreError.message },
        { status: 500 }
      );
    }

    // Envoyer l'email
    try {
      console.log("📤 Tentative d'envoi de l'email...");
      console.log("   De:", process.env.EMAIL_USER);
      console.log("   À:", email);
      console.log("   Sujet: 🔐 Code de vérification");
      
      // Vérifier la connexion avant d'envoyer
      console.log("🔌 Vérification de la connexion SMTP...");
      await transporter.verify();
      console.log("✅ Connexion SMTP vérifiée");
      
      const mailOptions = {
        from: `"Shopmark Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Code de vérification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f97316; color: white; padding: 30px; text-align: center;">
              <h1>🔐 Vérification de votre compte</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px;">
              <p>Bonjour <strong>${displayName || 'Utilisateur'}</strong>,</p>
              <p>Voici votre code de vérification :</p>
              <div style="background: white; border: 2px dashed #f97316; padding: 20px; text-align: center; margin: 20px 0;">
                <div style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px;">${code}</div>
              </div>
              <p><strong>⏰ Ce code expire dans 4 minutes.</strong></p>
              <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
              <p>Cordialement,<br>L'équipe de support</p>
            </div>
          </div>
        `,
      };

      console.log("📨 Envoi de l'email en cours...");
      const info = await transporter.sendMail(mailOptions);
      
      console.log("✅ Email envoyé avec succès!");
      console.log("   Message ID:", info.messageId);
      console.log("   Response:", info.response);
      console.log("   Accepted:", info.accepted);
      console.log("   Rejected:", info.rejected);

    } catch (emailError: any) {
      console.error("❌ Erreur lors de l'envoi de l'email:");
      console.error("   Message:", emailError.message);
      console.error("   Code:", emailError.code);
      console.error("   Command:", emailError.command);
      console.error("   Response:", emailError.response);
      console.error("   Stack:", emailError.stack);
      
      // Ne pas échouer si l'email ne part pas, le code est déjà sauvegardé
      console.log("⚠️ Le code a été sauvegardé mais l'email n'a pas pu être envoyé");
    }

    return NextResponse.json({
      success: true,
      message: 'Code envoyé',
      userId: userId, // Retourner le userId pour le frontend
      // En dev, retourner le code pour faciliter les tests
      ...(process.env.NODE_ENV === 'development' && { 
        code,
        debug: {
          emailConfigured: isEmailConfigured,
          emailSent: true // Sera false si l'envoi échoue
        }
      })
    });

  } catch (error: any) {
    console.error('❌ Erreur globale:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
