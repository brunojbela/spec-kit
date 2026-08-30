import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { scaffoldProject } from './init.js';
import { loadDocSync } from '../doc-sync.js';
import { detectStackFromFile } from '../stack-detect.js';

// T16 — spec-kit analyze: legado → DOC_SYNC + char-tests mock + squad (sem apagar código).
export function analyze({ dir, stack, harnesses }) {
  if (!existsSync(dir)) throw new Error(`repo não existe: ${dir}`);
  const detected = stack?.length ? stack : detectStackFromFile(dir);
  const res = scaffoldProject({ dir, stack: detected, mode: 'legacy', harnesses });

  const doc = loadDocSync(dir);
  const modules = [...new Set(doc.items.map((i) => i.module))];
  mkdirSync(join(dir, 'test', 'characterization'), { recursive: true });
  for (const mod of modules) {
    const items = doc.items.filter((i) => i.module === mod);
    const file = join(dir, 'test', 'characterization', `${mod.replace(/\W/g, '_')}.test.mjs`);
    writeFileSync(file, `import { test } from 'node:test';\n\n// Char-tests (mock) — comportamento ATUAL do módulo ${mod} antes de qualquer mudança.\n${items.map((i) => `test('caracteriza ${i.class ?? mod}.${i.method ?? 'default'} (comportamento atual)', { skip: 'preencher após leitura' }, () => {});`).join('\n')}\n`);
  }
  writeFileSync(join(dir, 'docs', 'CHAR_TESTS.md'), `# Char-tests — ${res.project}\n\nMódulos caracterizados: ${modules.join(', ') || 'nenhum'}\n\n> Testes de caracterização capturam o comportamento atual do legado ANTES de refatorar.\n`);
  return { ...res, charTestModules: modules };
}

export async function run(opts) {
  return analyze({ dir: opts.dir ?? opts.repo, stack: (opts.stack ?? '').split(',').filter(Boolean), harnesses: opts.harnesses });
}
