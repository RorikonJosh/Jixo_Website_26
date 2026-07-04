#!/usr/bin/env node
/**
 * Checks whether admin RPC + site_settings are deployed on Supabase.
 * Usage: npm run verify:admin
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      let value = trimmed.slice(eq + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* .env optional if vars already exported */
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
};

async function check(label, fn) {
  try {
    const ok = await fn();
    console.log(ok ? `✓ ${label}` : `✗ ${label}`);
    return ok;
  } catch (err) {
    console.log(`✗ ${label}: ${err.message}`);
    return false;
  }
}

const siteSettings = await check('site_settings table', async () => {
  const res = await fetch(`${url}/rest/v1/site_settings?key=eq.maintenance&select=key`, {
    headers,
  });
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(await res.text());
  return true;
});

const adminRpc = await check('admin_password_ok RPC', async () => {
  const res = await fetch(`${url}/rest/v1/rpc/admin_password_ok`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ input_password: '' }),
  });
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(await res.text());
  return true;
});

if (siteSettings && adminRpc) {
  console.log('\nAdmin backend is ready. Open http://localhost:5173/admin');
  process.exit(0);
}

console.log(`
Admin backend is NOT deployed yet.

1. Open https://supabase.com/dashboard/project/gngrfmyucxyuutzlotre/sql/new
2. Paste all of supabase/admin-setup.sql
3. Click Run
4. Run: npm run verify:admin
`);
process.exit(1);
