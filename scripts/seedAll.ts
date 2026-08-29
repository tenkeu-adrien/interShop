// scripts/seedAll.ts
/**
 * Génère des profils utilisateurs et les crée en MÊME TEMPS dans :
 *   - Firebase Authentication (compte email/mot de passe, même uid)
 *   - Firestore (collection "users", document avec le même uid)
 *
 * Répartition par défaut : 4 clients, 3 fournisseurs, 2 marketistes, 1 admin.
 *
 * Usage: npm run seed:all
 * Nécessite les variables Admin dans .env (FIREBASE_PROJECT_ID,
 * FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) pour Firebase Auth.
 */

import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import {
  createMockClient,
  createMockFournisseur,
  createMockMarketiste,
} from '../lib/factories';
import type { User } from '../types';

// Nettoie récursivement les undefined (Firestore les refuse)
function cleanUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined).filter((v) => v !== undefined);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanUndefined(v)])
    );
  }
  return obj;
}

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Mot de passe commun pour tous les comptes créés
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'InterShop@2026';

// uid générés automatiquement par Firebase Auth (on ne force pas d'uid personnalisé)
async function createOrUpdateAuthUser(
  auth: admin.auth.Auth,
  email: string,
  displayName: string,
): Promise<string> {
  // Peut-être déjà existant (même email après une ré-exécution)
  try {
    const existing = await auth.getUserByEmail(email);
    return existing.uid;
  } catch (e: any) {
    if (e?.code !== 'auth/user-not-found') throw e;
  }
  const userRecord = await auth.createUser({
    email,
    password: DEFAULT_PASSWORD,
    displayName,
    emailVerified: true,
    disabled: false,
  });
  return userRecord.uid;
}

function makeEmail(role: string, index: number): string {
  return `seed.${role}.${index}@interappshop.test`;
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};
const log = (m: string, c: keyof typeof colors = 'reset') => console.log(`${colors[c]}${m}${colors.reset}`);

function toE164(phone?: string | null): string | undefined {
  return typeof phone === 'string' && /^\+[1-9]\d{6,14}$/.test(phone) ? phone : undefined;
}

async function initAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Variables Admin manquantes dans .env (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
    );
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  return {
    auth: admin.auth(),
    db: admin.firestore(),
  };
}

interface Spec {
  role: string;
  count: number;
  factory: (overrides?: Partial<User>) => User;
}

async function main() {
  log('\n🚀 Génération des profils (Firestore + Firebase Auth)...', 'cyan');
  log('==========================================================\n', 'cyan');

  const { auth, db } = await initAdmin();

  const specs: Spec[] = [
    { role: 'client', count: 4, factory: (o) => createMockClient() as User },
    { role: 'fournisseur', count: 3, factory: (o) => createMockFournisseur({ approvalStatus: 'approved' }) as User },
    { role: 'marketiste', count: 2, factory: (o) => createMockMarketiste({ approvalStatus: 'approved' }) as User },
  ];

  let created = 0;
  let updated = 0;
  let failed = 0;

  // Admin
  const adminSpec: Spec = { role: 'admin', count: 1, factory: (o) => createMockClient() as User };

  for (const spec of [...specs, adminSpec]) {
    for (let i = 1; i <= spec.count; i++) {
      const email = makeEmail(spec.role, i);

      try {
        const base = spec.factory() as any;
        const role = spec.role === 'admin' ? 'admin' : base.role;

        // 1) Créer (ou retrouver) le compte Firebase Auth -> uid généré par Firebase
        const uid = await createOrUpdateAuthUser(auth, email, base.displayName || `${spec.role} ${i}`);

        const userFields = cleanUndefined({
          ...base,
          id: uid,
          email,
          role,
          displayName: base.displayName || `${spec.role} ${i}`,
          photoURL: null,
          approvedAt: ['fournisseur', 'marketiste', 'admin'].includes(role) ? Timestamp.fromDate(new Date()) : null,
          approvalStatus: 'approved',
          accountStatus: 'active',
          isActive: true,
          isVerified: true,
          emailVerified: true,
          phoneVerified: false,
          phoneVerificationAttempts: 0,
          emailVerificationAttempts: 0,
          verificationHistory: [],
          addresses: [],
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        });

        // 2) Écrire le document Firestore avec le MÊME uid que le compte Auth
        await db.collection('users').doc(uid).set(userFields, { merge: true });

        created++;
        log(`  ✓ ${email} (${role}) — uid: ${uid}`, 'green');
      } catch (e: any) {
        log(`  ✗ ${email}: ${e.message}`, 'red');
        failed++;
      }
    }
  }

  log('\n==========================================================', 'cyan');
  log(`✨ Terminé! Créés/Mis à jour: ${created} | Échecs: ${failed}`, 'green');
  log(`🔑 Mot de passe commun: ${DEFAULT_PASSWORD}`, 'yellow');
  log('', 'reset');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
