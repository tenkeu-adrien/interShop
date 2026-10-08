// Vérifie les traductions sans build : (1) clés de fr.json absentes des autres
// langues, (2) clés utilisées dans le code mais absentes de fr.json.
// Usage : node scripts/checkI18n.mjs [--verbose]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const REFERENCE = 'fr';
const LOCALES = ['en', 'sw', 'ar'];
const SOURCE_DIRS = ['app', 'components', 'hooks', 'lib', 'store'];
const verbose = process.argv.includes('--verbose');

const load = (locale) => JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8'));

const flatten = (obj, prefix = '', out = new Set()) => {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) flatten(value, path, out);
    else out.add(path);
  }
  return out;
};

const walk = (dir, files = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (['.ts', '.tsx'].includes(extname(name))) files.push(full);
  }
  return files;
};

const reference = flatten(load(REFERENCE));
let problems = 0;

for (const locale of LOCALES) {
  const keys = flatten(load(locale));
  const missing = [...reference].filter((k) => !keys.has(k));
  problems += missing.length;
  console.log(`[${locale}] ${missing.length} clé(s) manquante(s) par rapport à ${REFERENCE}`);
  if (verbose) missing.forEach((k) => console.log(`   - ${k}`));
}

const hookRe = /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:['"]([^'"]*)['"])?\s*\)/g;
const usedButMissing = new Map();
let dynamicCalls = 0;

for (const file of SOURCE_DIRS.flatMap((d) => walk(d))) {
  const source = readFileSync(file, 'utf8');
  for (const [, variable, namespace] of source.matchAll(hookRe)) {
    const callRe = new RegExp(`(?<![\\w.])${variable}(?:\\.(?:rich|raw|markup|has))?\\(\\s*(['"\`])([^'"\`]*)\\1`, 'g');
    for (const [, quote, key] of source.matchAll(callRe)) {
      if (quote === '`' && key.includes('${')) { dynamicCalls++; continue; }
      const full = namespace ? `${namespace}.${key}` : key;
      const isLeaf = reference.has(full);
      const isBranch = [...reference].some((k) => k.startsWith(`${full}.`));
      if (!isLeaf && !isBranch) {
        if (!usedButMissing.has(full)) usedButMissing.set(full, new Set());
        usedButMissing.get(full).add(file.replace(/\\/g, '/'));
      }
    }
  }
}

problems += usedButMissing.size;
console.log(`[code] ${usedButMissing.size} clé(s) utilisée(s) dans le code mais absente(s) de ${REFERENCE}.json`);
for (const [key, files] of [...usedButMissing].sort()) {
  console.log(`   - ${key}  (${[...files].join(', ')})`);
}
if (dynamicCalls) console.log(`[code] ${dynamicCalls} appel(s) à clé dynamique non vérifiable(s)`);

process.exit(problems ? 1 : 0);
