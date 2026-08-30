import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateOrThrow } from './schemas.js';

const esc = (s) => String(s).replace(/\|/g, '\\|');

export function renderPrdMd(prd) {
  const L = [];
  L.push(`# PRD — ${prd.metadata.displayName ?? prd.metadata.project} (\`${prd.metadata.project}\`) — ${prd.metadata.createdAt}`, '');
  L.push(`> Fonte: \`docs/PRD.json\` (máquina) — este MD é espelho humano, **sem truncamento**.`, '');
  L.push('## Metadata');
  for (const [k, v] of Object.entries(prd.metadata)) L.push(`- **${k}:** \`${v}\``);
  L.push('', '## Shared Context');
  const sc = prd.sharedContext;
  L.push(`- **Objetivo:** ${sc.objetivo}`);
  L.push(`- **Princípios:** ${sc.principios.join(', ')}`);
  if (sc.harnesses) L.push(`- **Harnesses:** ${sc.harnesses.join(', ')}`);
  if (sc.governance) L.push(`- **Governança:** ${sc.governance}`);
  if (sc.docSync) L.push(`- **DocSync:** ${sc.docSync}`);
  if (sc.modelSelection) L.push(`- **ModelSelection pendência:** ${sc.modelSelection}`);
  L.push('', `## Features (${prd.features.length})`);
  for (const ft of prd.features) L.push(`- **${ft.id} — ${ft.name}:** ${ft.goal}`);
  L.push('', `## Tasks (${prd.tasks.length})`, '');
  L.push('| # | Feature | O que faz (what) | Por que (why) | Critério de aceite | Dificuldade | Modelo | Deps | Status |');
  L.push('|---|---|---|---|---|---|---|---|---|');
  for (const t of prd.tasks) {
    L.push(`| ${t.id} | ${t.feature} | ${esc(t.what)} | ${esc(t.why)} | ${esc(t.acceptanceCriteria)} | ${t.difficulty} | ${t.model} | ${t.dependsOn?.length ? t.dependsOn.join(', ') : '—'} | ${t.status} |`);
  }
  L.push('');
  return L.join('\n');
}

export function renderLedgerMd(ledger) {
  const L = [`# ORCHESTRATION ledger — ${ledger.project}`, '', `Atualizado: ${ledger.updatedAt}`, `Entradas: ${ledger.entries.length}`, ''];
  L.push('| session_id | harness | task_id | developer | model | tokens | prompts | timestamp |');
  L.push('|---|---|---|---|---|---|---|---|');
  for (const e of ledger.entries) L.push(`| ${e.session_id} | ${e.harness} | ${e.task_id} | ${e.developer} | ${e.model} | ${e.tokens ?? '—'} | ${e.prompts ?? '—'} | ${e.timestamp} |`);
  L.push('');
  return L.join('\n');
}

export function renderSecurityMd(log) {
  const L = [`# SECURITY_LOG — ${log.project}`, '', `Atualizado: ${log.updatedAt}`, `Violações: ${log.violations.length}`, ''];
  L.push('| item | severidade | arquivo | linha | status | ação | timestamp |');
  L.push('|---|---|---|---|---|---|---|');
  for (const v of log.violations) L.push(`| ${esc(v.item)} | ${v.severity} | ${v.file} | ${v.line ?? '—'} | ${v.status} | ${v.action ?? '—'} | ${v.timestamp} |`);
  L.push('');
  return L.join('\n');
}

function readJsonOr(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}

const SCHEMA_BY_BASE = { PRD: 'prd', ORCHESTRATION: 'orchestration', SECURITY_LOG: 'security' };

export function writeMirrored(dir, base, data, renderer) {
  validateOrThrow(SCHEMA_BY_BASE[base], data);
  writeFileSync(join(dir, `${base}.json`), JSON.stringify(data, null, 2) + '\n');
  writeFileSync(join(dir, `${base}.md`), renderer(data));
}

export function loadOrchestration(dir) {
  return readJsonOr(join(dir, 'ORCHESTRATION.json'), { project: 'spec-kit', updatedAt: new Date().toISOString(), entries: [] });
}

export function appendLedgerEntry(dir, entry) {
  const ledger = loadOrchestration(dir);
  const full = { session_id: 'unknown', harness: 'unknown', task_id: 'n/a', developer: 'unknown', model: 'unknown', timestamp: new Date().toISOString(), ...entry };
  ledger.entries.push(full);
  ledger.updatedAt = full.timestamp;
  writeMirrored(dir, 'ORCHESTRATION', ledger, renderLedgerMd);
  return full;
}

export function loadSecurityLog(dir) {
  return readJsonOr(join(dir, 'SECURITY_LOG.json'), { project: 'spec-kit', updatedAt: new Date().toISOString(), violations: [] });
}

export function recordViolations(dir, violations) {
  const log = loadSecurityLog(dir);
  for (const v of violations) {
    log.violations.push({ status: 'aberta', timestamp: new Date().toISOString(), ...v });
  }
  log.updatedAt = new Date().toISOString();
  writeMirrored(dir, 'SECURITY_LOG', log, renderSecurityMd);
  return log;
}

export function setTaskStatus(prdPath, taskId, status) {
  const prd = JSON.parse(readFileSync(prdPath, 'utf8'));
  const t = prd.tasks.find((x) => x.id === taskId);
  if (!t) throw new Error(`task ${taskId} não existe`);
  t.status = status;
  validateOrThrow('prd', prd);
  writeFileSync(prdPath, JSON.stringify(prd, null, 2) + '\n');
  writeFileSync(prdPath.replace(/\.json$/, '.md'), renderPrdMd(prd));
  return prd;
}

export function isMirrored(jsonPath, mdPath, checkers) {
  if (!existsSync(mdPath)) return false;
  const md = readFileSync(mdPath, 'utf8');
  return checkers.every((c) => md.includes(c));
}
