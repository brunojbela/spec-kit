import { existsSync } from 'node:fs';
import { refresh } from '../models.js';

// T33 — spec-kit models refresh (--offline força fallback do último catálogo válido)
export async function run(opts) {
  return refresh({ offline: opts.offline });
}
