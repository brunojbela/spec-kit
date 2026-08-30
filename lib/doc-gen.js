import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadDocSync, markDocumented, coverage } from './doc-sync.js';

function slug(i) {
  return [i.module, i.class, i.method].filter(Boolean).join('-').replace(/\W+/g, '-').toLowerCase();
}

// T22 — doc-gen Fase 2: cada subagent documenta 1 funcionalidade do DOC_SYNC (1 func por agente).
export function documentItem(dir, itemId) {
  const doc = loadDocSync(dir);
  const item = doc.items.find((i) => i.id === itemId);
  if (!item) throw new Error(`item ${itemId} não existe`);
  if (item.status === 'documentado') return item;
  const kind = item.kind;
  const rel = `docs/${kind}/${slug(item)}.md`;
  const file = join(dir, rel);
  mkdirSync(join(dir, `docs/${kind}`), { recursive: true });
  const body = kind === 'technical'
    ? `# ${item.class ?? item.module}${item.method ? `.${item.method}()` : ''}\n\n- **Módulo:** ${item.module}\n- **Classe:** ${item.class ?? '—'}\n- **Method:** ${item.method ?? '—'}\n- **Imports:** ${(item.imports ?? []).join(', ') || '—'}\n- **Requests:** ${(item.requests ?? []).join(', ') || '—'}\n\n## Responsabilidade\nImplementação de ${item.method ?? item.class ?? item.module} em ${item.file ?? item.module}.\n`
    : `# Caso de uso: ${item.case ?? item.module}\n\n- **Feature:** ${item.feature ?? '—'}\n- **Component/Classe:** ${item.class ?? '—'}\n- **Method:** ${item.method ?? '—'}\n\n## Fluxo\n1. Usuário aciona ${item.case ?? item.module}.\n2. Component/orquestrador processa.\n3. Resultado documentado.\n`;
  writeFileSync(file, body);
  return markDocumented(dir, itemId, rel);
}

export async function runDocPipeline(dir) {
  const doc = loadDocSync(dir);
  const pend = doc.items.filter((i) => i.status === 'pendente');
  for (const i of pend) {
    await new Promise((r) => setImmediate(r));
    documentItem(dir, i.id);
  }
  return coverage(dir);
}
