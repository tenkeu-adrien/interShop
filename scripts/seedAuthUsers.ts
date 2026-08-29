// scripts/seedAuthUsers.ts
/**
 * Crée, pour chaque utilisateur présent dans Firestore (collection "users"),
 * un compte correspondant dans Firebase Authentication (même uid).
 *
 * Usage: npx tsx scripts/seedAuthUsers.ts
 * Nécessite les variables Admin dans .env (FIREBASE_PROJECT_ID,
 * FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).
 */

import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Variables Admin manquantes (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
  process.exit(1);
}

// Mot de passe par défaut pour les comptes créés
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'InterShop@2026';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};
const log = (m: string, c: keyof typeof colors = 'reset') => console.log(`${colors[c]}${m}${colors.reset}`);

async function main() {
  log('\n🚀 Synchronisation Firestore -> Firebase Auth...', 'cyan');
  log('==================================================\n', 'cyan');

  const snapshot = await db.collection('users').get();
  const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  log(`👥 ${users.length} utilisateurs trouvés dans Firestore.\n`, 'yellow');

  let created = 0;
  let already = 0;
  let failed = 0;

  for (const user of users as any[]) {
    const uid = user.id;
    const email = user.email;
    if (!email) {
      log(`  ✗ ${uid}: pas d'email, ignoré`, 'red');
      failed++;
      continue;
    }

    try {
      // Vérifier si le compte Auth existe déjà
      try {
        await auth.getUser(uid);
        already++;
        continue;
      } catch (e: any) {
        // n'existe pas -> on le crée
      }

      // Firebase Auth exige un numéro de téléphone au format E.164 (+[code pays][numéro]).
      // Les numéros mockés ne le respectent pas toujours -> on l'omet si invalide.
      const rawPhone = user.phoneNumber;
      const phoneNumber = typeof rawPhone === 'string' && /^\+[1-9]\d{6,14}$/.test(rawPhone)
        ? rawPhone
        : undefined;

      await auth.createUser({
        uid,
        email,
        password: DEFAULT_PASSWORD,
        displayName: user.displayName || '',
        disabled: false,
        emailVerified: user.emailVerified === true,
        phoneNumber,
      });

      created++;
      log(`  ✓ ${email} (${user.role || ''})`, 'green');
    } catch (e: any) {
      if (e?.code === 'auth/email-already-exists') {
        // le compte existe avec un autre uid -> on récupère son uid et on renseigne
        log(`  ~ ${email}: email déjà utilisé (${e.message})`, 'yellow');
        already++;
      } else {
        log(`  ✗ ${email}: ${e.message}`, 'red');
        failed++;
      }
    }
  }

  log('\n==================================================', 'cyan');
  log(`✨ Terminé! Créés: ${created} | Déjà présents: ${already} | Échecs: ${failed}`, 'green');
  log(`🔑 Mot de passe par défaut: ${DEFAULT_PASSWORD}`, 'yellow');
  log('\n', 'reset');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
