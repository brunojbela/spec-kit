import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');

export function standardsCatalog() {
  const spec = JSON.parse(readFileSync(join(ROOT, 'spec-kit.orchestration.json'), 'utf8'));
  return spec.standards;
}

export function renderStandardsMd(std) {
  const L = ['# Padrões vigentes do projeto (.spec/standards.json)', '', '> Selecionados pelo PO na entrevista; update reescreve a partir do catálogo do kit. Consulta: spec-kit.orchestration.json:standards.', ''];
  L.push(`- **Commit:** ${std.commit.convention} (${std.commit.types.join(', ')}) — ${std.commit.rule}`);
  L.push(`- **Branch:** ${std.branch.strategy}`);
  L.push(`- **Naming:** functions ${std.naming.functions}; enums ${std.naming.enums}; files ${std.naming.files}`);
  L.push(`- **Code review:** ${std.codeReview.rule}`);
  L.push(`- **Testing:** ${std.testing.tdd} — ${std.testing.rule}`);
  L.push(`- **Concisão:** ${std.conciseness.rule}`);
  L.push(`- **Docs:** ${std.docsAlwaysOn.rule}`);
  L.push('');
  return L.join('\n');
}

// Cria/atualiza .spec/ (padrões + memória de consultas + specs de feature).
export function initSpecFolder(dir, { stack, mode = 'greenfield' } = {}) {
  mkdirSync(join(dir, '.spec', 'queries'), { recursive: true });
  mkdirSync(join(dir, '.spec', 'features'), { recursive: true });
  const std = standardsCatalog();
  const sel = {
    selecionadosEm: new Date().toISOString(),
    modo: mode,
    stack: stack ?? [],
    commit: std.commit,
    branch: std.branch,
    naming: std.naming,
    codeReview: std.codeReview,
    testing: std.testing,
    conciseness: std.conciseness.rule,
    docsAlwaysOn: std.docsAlwaysOn.rule,
  };
  writeFileSync(join(dir, '.spec', 'standards.json'), JSON.stringify(sel, null, 2) + '\n');
  writeFileSync(join(dir, '.spec', 'standards.md'), renderStandardsMd(std));
  const qf = join(dir, '.spec', 'queries', 'queries.jsonl');
  if (!existsSync(qf)) writeFileSync(qf, '');
  return { standards: join(dir, '.spec', 'standards.json'), queries: qf, features: join(dir, '.spec', 'features') };
}

// Memória de consultas Context7 — agents/skills registram ANTES de agir.
export function recordQuery(dir, { agent, skill = null, harness = 'unknown', libraryId, query, sources = [] }) {
  if (!agent || !libraryId || !query) throw new Error('recordQuery exige agent, libraryId e query');
  const qf = join(dir, '.spec', 'queries', 'queries.jsonl');
  mkdirSync(join(dir, '.spec', 'queries'), { recursive: true });
  const rec = { ts: new Date().toISOString(), agent, skill, harness, libraryId, query, sources };
  appendFileSync(qf, JSON.stringify(rec) + '\n');
  return rec;
}

export function readQueries(dir) {
  const qf = join(dir, '.spec', 'queries', 'queries.jsonl');
  if (!existsSync(qf)) return [];
  return readFileSync(qf, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

// Fase spec/plan do SDD: artefatos por feature.
export function writeFeatureSpec(dir, featureId, kind, content) {
  if (!['spec', 'plan'].includes(kind)) throw new Error("kind deve ser 'spec' ou 'plan'");
  const f = join(dir, '.spec', 'features', `${featureId}.${kind}.md`);
  mkdirSync(join(dir, '.spec', 'features'), { recursive: true });
  writeFileSync(f, content);
  return f;
}
