#!/usr/bin/env node
/**
 * Writes an MD5 sidecar next to every binary in `public/download/`.
 *
 * Installed clients poll the sidecar to notice a new build, so it MUST always match
 * the binary sitting beside it. That is why this runs from `prebuild` rather than by
 * hand: replacing the exe and forgetting the hash would leave every installed copy
 * either blind to the update or chasing a build that does not exist. Cloudflare runs
 * `npm run build`, so the hash is regenerated there too and cannot drift.
 *
 * Format: the bare lowercase 32-character hex digest plus a newline — nothing else, so
 * a client can compare it with `(await res.text()).trim()` and no parsing is needed.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, 'public', 'download');

if (!existsSync(dir)) {
  console.log('[download-hash] no public/download — nothing to hash');
  process.exit(0);
}

const BINARY = /\.(exe|dmg|AppImage|msi|zip|deb|tar\.gz)$/i;
const binaries = readdirSync(dir).filter((f) => BINARY.test(f));

if (!binaries.length) {
  console.warn('[download-hash] public/download has no binaries — no sidecars written');
  process.exit(0);
}

for (const name of binaries) {
  const file = path.join(dir, name);
  const digest = createHash('md5').update(readFileSync(file)).digest('hex');
  const sidecar = `${file}.md5`;
  const existing = existsSync(sidecar) ? readFileSync(sidecar, 'utf8').trim() : null;
  writeFileSync(sidecar, `${digest}\n`);
  const state = existing === digest ? 'unchanged' : existing ? `updated from ${existing}` : 'created';
  console.log(`[download-hash] ${name}.md5 ${state} — ${digest}`);
}
