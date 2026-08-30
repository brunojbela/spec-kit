import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateOrThrow } from './schemas.js';

const ROOT = join(import.meta.dirname, '..');
export const CATALOG_PATH = join(ROOT, 'models', 'catalog.json');

export function loadCatalog(path = CATALOG_PATH) {
  const catalog = JSON.parse(readFileSync(path, 'utf8'));
  validateOrThrow('model-catalog', catalog);
  return catalog;
}

// T33 — refresh: busca benchmarks; em falha mantém última versão válida (fallback offline).
export async function refresh({ offline = false, url = process.env.SPEC_KIT_BENCH_URL, path = CATALOG_PATH } = {}) {
  const current = loadCatalog(path);
  if (offline || !url) return { updated: false, fallback: true, catalog: current };
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const remote = await res.json();
    validateOrThrow('model-catalog', remote);
    copyFileSync(path, `${path}.bak`);
    writeFileSync(path, JSON.stringify(remote, null, 2) + '\n');
    return { updated: true, fallback: false, catalog: remote };
  } catch {
    return { updated: false, fallback: true, catalog: current };
  }
}
