#!/usr/bin/env node
/**
 * Upload portfolio images from src/assets to Supabase Storage (portfolio bucket).
 * Requires: supabase login + supabase link.
 *
 * Usage: npm run upload:portfolio
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative, resolve, sep } from 'node:path';

const root = process.cwd();

const sources = [
  { local: 'src/assets/artworks', prefix: 'artworks' },
  { local: 'src/assets/commissions', prefix: 'commissions' },
];

function walkFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }

  return files;
}

function uploadFile(localPath, storagePath) {
  const remote = `ss:///portfolio/${storagePath.replace(/\\/g, '/')}`;
  const quotedLocal = `"${localPath.replace(/"/g, '\\"')}"`;
  const quotedRemote = `"${remote.replace(/"/g, '\\"')}"`;
  const cmd = `npx supabase --experimental storage cp ${quotedLocal} ${quotedRemote} --linked`;
  const result = spawnSync(cmd, {
    stdio: 'pipe',
    cwd: root,
    shell: true,
    encoding: 'utf8',
  });

  const output = `${result.stdout || ''}${result.stderr || ''}`;
  const uploaded = output.includes('"uploaded"');
  const duplicate = output.includes('Duplicate') || output.includes('"409"');

  if (uploaded || duplicate) {
    console.log(`  ✓ ${storagePath}${duplicate && !uploaded ? ' (already exists)' : ''}`);
    return true;
  }

  console.error(`  ✗ ${storagePath}`);
  if (output.trim()) console.error(output.trim());
  return false;
}

console.log('Portfolio upload → Supabase bucket "portfolio"\n');

let uploaded = 0;
let failed = 0;

for (const { local, prefix } of sources) {
  const abs = resolve(root, local);
  if (!existsSync(abs)) {
    console.log(`⊘ skip (folder missing): ${local}`);
    continue;
  }

  console.log(`↑ ${local}`);
  const files = walkFiles(abs).filter((file) => statSync(file).isFile());

  for (const file of files) {
    const rel = relative(abs, file).split(sep).join('/');
    const storagePath = `${prefix}/${rel}`;
    const localRel = `${local}/${rel}`.replace(/\\/g, '/');
    if (uploadFile(localRel, storagePath)) uploaded += 1;
    else failed += 1;
  }
}

console.log(`\n${uploaded} file(s) uploaded${failed ? `, ${failed} failed` : ''}.`);

if (failed > 0) {
  console.error('Ensure: npx supabase login && npx supabase link --project-ref gngrfmyucxyuutzlotre');
  process.exit(1);
}
