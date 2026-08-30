import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const spec = JSON.parse(readFileSync(join(ROOT, 'spec-kit.orchestration.json'), 'utf8'));

export function specCommands() {
  return spec.commands.planned.map((c) => ({
    slug: c.id.replace(/^spec-kit\s+/, '').replace(/\s+/g, '-'),
    signature: c.signature,
    description: c.behavior.slice(0, 80),
    behavior: c.behavior,
  }));
}
