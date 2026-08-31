import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { installSquad } from '../generators/squad.js';
import { installSkills, wireAgentsSkills } from '../generators/skills.js';
import { validateOrThrow } from '../schemas.js';
import { writeMirrored, renderLedgerMd, renderSecurityMd, renderPrdMd } from '../governance.js';
import { scanProject, writeDocSync } from '../doc-sync.js';
import { emitEvent } from '../events.js';
import { ensureSession } from '../session.js';
import { concisenessRule } from '../materialize.js';
import { layoutOf, HARNESS_IDS } from '../harnesses/registry.js';
import { installCommands, installHooks } from '../harnesses/installer.js';
import { writeStamp } from '../installed.js';
import { initSpecFolder } from '../spec-folder.js';

export function seedPrd({ project, stack, goal, mode }) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    metadata: { project, displayName: project, version: '0.1.0', owner: 'unknown', language: 'pt-BR', createdAt: today, harness: 'multi', status: `PRD gerado por spec-kit (${mode})`, source: 'spec-kit init' },
    sharedContext: { objetivo: goal ?? `Projeto ${project} (stack: ${stack.join(', ')}) — specs a completar via entrevista PO.`, principios: ['TDD obrigatório', 'docs 100%', 'QA forte', 'pentest reverso'], harnesses: ['opencode', 'claude-code', 'cursor', 'codex', 'gemini-cli', 'antigravity-2.0', 'antigravity-cli (agy)', 'antigravity-ide'], governance: 'PRD/ORCHESTRATION/SECURITY_LOG JSON+MD espelhados', docSync: 'DOC_SYNC.json guia → multisubagents → technical/functional', modelSelection: 'PO usa models/catalog.json; central pendente' },
    features: [{ id: 'F01', name: mode === 'legacy' ? 'Regularização do legado' : 'Setup e specs', goal: 'Completar entrevista PO e detalhar specs com critérios de aceite' }],
    tasks: [{ id: 'T01', feature: 'F01', what: 'PO conduz entrevista (13 dimensões) e materializa specs completas no PRD', why: 'PRD atual é seed; specs reais vêm da entrevista', acceptanceCriteria: 'PRD.json com features e tasks completas, cada task com critério de aceite testável', difficulty: 'médio', model: 'claude-sonnet-4-6', dependsOn: [], status: 'pendente' }],
  };
}

export function scaffoldProject({ dir, stack, goal, mode = 'greenfield', harnesses }) {
  if (!stack?.length) throw new Error('stack vazio — rode a entrevista PO ou passe --stack (ex: --stack laravel,react)');
  mkdirSync(join(dir, 'docs'), { recursive: true });
  const project = basename(dir);

  const prd = seedPrd({ project, stack, goal, mode });
  validateOrThrow('prd', prd);
  writeFileSync(join(dir, 'docs', 'PRD.json'), JSON.stringify(prd, null, 2) + '\n');
  writeFileSync(join(dir, 'docs', 'PRD.md'), renderPrdMd(prd));

  const ctx = { stack, conventions: ['clean architecture', 'eslint', concisenessRule()], structure: ['src', 'tests', 'docs'], gates: ['security-gate', 'docs-check', 'ledger-record'], mode };
  validateOrThrow('project-context', ctx);
  writeFileSync(join(dir, 'PROJECT_CONTEXT.json'), JSON.stringify(ctx, null, 2) + '\n');
  if (!existsSync(join(dir, 'AGENTS.md'))) {
    writeFileSync(join(dir, 'AGENTS.md'), `# ${project}\n\nStack: ${stack.join(', ')}\nGates: ${ctx.gates.join(', ')}\nSDD: siga docs/PRD.json (fonte) e docs/PRD.md (humano).\nPadrões vigentes: .spec/standards.md · Memória de consultas: .spec/queries/queries.jsonl · Specs/planos: .spec/features/\n`);
  }

  writeMirrored(join(dir, 'docs'), 'ORCHESTRATION', { project, updatedAt: new Date().toISOString(), entries: [] }, renderLedgerMd);
  writeMirrored(join(dir, 'docs'), 'SECURITY_LOG', { project, updatedAt: new Date().toISOString(), violations: [] }, renderSecurityMd);

  const doc = scanProject(dir, project);
  writeDocSync(dir, doc);
  initSpecFolder(dir, { stack, mode });

  const squadRes = installSquad({ stack, dir, harnesses });
  const skillsRes = installSkills({ stack, dir, harnesses });
  wireAgentsSkills({ dir, squad: squadRes.squad, skills: skillsRes.skills });
  const targets = harnesses ?? HARNESS_IDS;
  for (const h of targets) {
    installCommands({ dir, harness: h });
    installHooks({ dir, harness: h, home: process.env.HOME });
  }

  ensureSession(dir, { harness: harnesses?.[0] ?? 'spec-kit' });
  writeStamp(dir, { stack, harnesses: harnesses ?? HARNESS_IDS });
  emitEvent(dir, 'project.instantiated', { stack, squad: squadRes.squad.map((a) => a.id) });
  return { project, prd, squad: squadRes.squad, docSyncItems: doc.items.length, written: squadRes.written.length + skillsRes.written.length };
}

export async function run(opts) {
  let harnesses = (opts.harnesses ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  for (const h of harnesses) layoutOf(h);
  if (!harnesses.length && !opts.yes && process.stdin.isTTY) {
    const { selectHarnesses } = await import('../harness-selector.js');
    harnesses = await selectHarnesses();
  }
  return scaffoldProject({ dir: opts.dir, stack: Array.isArray(opts.stack) ? opts.stack : (opts.stack ?? '').split(',').map((x)=>x.trim()).filter(Boolean), goal: undefined, mode: 'greenfield', harnesses: harnesses.length ? harnesses : undefined });
}
