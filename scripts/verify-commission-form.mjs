/**
 * Validates commission form module exports and i18n keys exist.
 * Run: node scripts/verify-commission-form.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['jp', 'zh', 'en'];
const requiredKeys = [
  'contact.form.openButton',
  'contact.form.title',
  'contact.form.submit',
  'contact.form.success',
  'contact.form.errorSubmit',
];

let failed = false;

for (const locale of locales) {
  const json = JSON.parse(
    readFileSync(join(root, 'src/i18n/locales', `${locale}.json`), 'utf8'),
  );
  for (const keyPath of requiredKeys) {
    const value = keyPath.split('.').reduce((acc, key) => acc?.[key], json);
    if (!value) {
      console.error(`Missing ${keyPath} in ${locale}.json`);
      failed = true;
    }
  }
}

const migration = readFileSync(
  join(root, 'supabase/migrations/20260329000000_commission_requests.sql'),
  'utf8',
);
if (!migration.includes('commission_requests')) {
  console.error('Migration missing commission_requests table');
  failed = true;
}

const edgeFn = readFileSync(
  join(root, 'supabase/functions/submit-commission/index.ts'),
  'utf8',
);
if (!edgeFn.includes('DISCORD_WEBHOOK_URL')) {
  console.error('Edge function missing Discord webhook integration');
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('Commission form verification passed.');
