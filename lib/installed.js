import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { specRoot, migrateLegacy } from './spec-paths.js';

const ROOT = join(import.meta.dirname, '..');

export function packVersion() {
  return JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
}

export function stampFile(dir) {
  return join(specRoot(dir), 'installed.json');
}

export function readStamp(dir) {
  migrateLegacy(dir);
  if (!existsSync(stampFile(dir))) return null;
  try { return JSON.parse(readFileSync(stampFile(dir), 'utf8')); } catch { return null; }
}

export function writeStamp(dir, { stack, harnesses }) {
  migrateLegacy(dir);
  mkdirSync(specRoot(dir), { recursive: true });
  const prev = readStamp(dir);
  const stamp = {
    pack: 'spec-kit',
    packVersion: packVersion(),
    stack,
    harnesses,
    installedAt: prev?.installedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(stampFile(dir), JSON.stringify(stamp, null, 2) + '\n');
  return stamp;
}

// Organismo vivo: cache instalado vs fonte (pack atual).
export function isStale(dir) {
  const stamp = readStamp(dir);
  if (!stamp) return { stale: false, reason: 'sem stamp — projeto não instalado pelo kit' };
  const cur = packVersion();
  return { stale: stamp.packVersion !== cur, installed: stamp.packVersion, current: cur };
}
