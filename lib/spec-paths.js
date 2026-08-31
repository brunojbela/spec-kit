import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// Unificação: tudo do kit no projeto vive em .spec/ (padrões, consultas, features, runtime).
export function specRoot(dir) {
  return join(dir, '.spec');
}

// Migra layout antigo .spec-kit/ → .spec/ (idempotente; nunca sobrescreve destino existente).
export function migrateLegacy(dir) {
  const legacy = join(dir, '.spec-kit');
  if (!existsSync(legacy)) return false;
  mkdirSync(specRoot(dir), { recursive: true });
  for (const entry of readdirSync(legacy)) {
    const dest = join(specRoot(dir), entry);
    if (!existsSync(dest)) renameSync(join(legacy, entry), dest);
  }
  if (readdirSync(legacy).length === 0) rmSync(legacy, { recursive: true });
  return true;
}
