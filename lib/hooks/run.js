#!/usr/bin/env node
// Entrada única dos 7 hooks (chamada pelos adapters de cada harness via comando).
// Uso: node lib/hooks/run.js <hookId> --harness <h> [--dir <proj>] [flags]
// Recebe o JSON NATIVO do harness no stdin e responde no FORMATO do harness
// (lib/harness-payloads.js — docs verificadas 2026-08-30).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { HOOK_IDS } from './matrix.js';
import { ensureSession, classifyProject } from '../session.js';
import { isFirstRun, runInterview, INTERVIEW_FIELDS } from '../personal.js';
import { gate } from '../security-gate.js';
import { appendLedgerEntry } from '../governance.js';
import { syncAfterChange, coverage } from '../doc-sync.js';
import { emitEvent } from '../events.js';
import { normalizeHookInput, blockOutput, contextOutput, continueDecision } from '../harness-payloads.js';
import { isStale } from '../installed.js';

const { values: opts, positionals } = parseArgs({ allowPositionals: true, options: {
  harness: { type: 'string', default: 'unknown' },
  dir: { type: 'string', default: process.cwd() },
  home: { type: 'string', default: process.env.HOME },
  answers: { type: 'string' },
  files: { type: 'string' },
  task: { type: 'string' },
  model: { type: 'string', default: 'unknown' },
  developer: { type: 'string', default: 'unknown' },
} });

function readStdinJson() {
  try {
    const raw = readFileSync(0, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

const native = readStdinJson();
const canon = normalizeHookInput(opts.harness, native);

const hooks = {
  'session.classify'() {
    const state = ensureSession(opts.dir, { harness: opts.harness });
    const mode = classifyProject(opts.dir);
    emitEvent(opts.dir, 'session.started', { session_id: state.session_id, harness: opts.harness, pid: state.pid });
    const stale = isStale(opts.dir);
    let ctx = `spec-kit: modo=${mode}; siga AGENTS.md + docs/PRD.json + ledger docs/ORCHESTRATION.json; padrões em .spec/standards.md; registre consultas Context7 em .spec/queries/queries.jsonl.`;
    if (stale.stale) ctx += ` ⚠ kit DESATUALIZADO (instalado ${stale.installed} → fonte ${stale.current}): sugira ao usuário "spec-kit update" nesta sessão (organismo vivo — instruções devem refletir a fonte).`;
    const injectable = ['claude-code', 'gemini-cli', 'cursor', 'antigravity-2.0', 'antigravity-ide'].includes(opts.harness);
    if (injectable) { process.stdout.write(contextOutput(opts.harness, 'SessionStart', ctx).stdout + '\n'); return null; }
    return { hook: 'session.classify', mode, session_id: state.session_id, native_session_id: canon.native_session_id, harness: opts.harness, source: canon.source ?? null, kitUpdateAvailable: stale.stale || undefined, installedVersion: stale.installed, currentVersion: stale.current, additionalContext: ctx };
  },
  'session.personal-interview'() {
    if (!isFirstRun(opts.home, opts.harness)) return { hook: 'session.personal-interview', ran: false, reason: 'AGENTS.md GLOBAL já existe' };
    const answers = opts.answers ? JSON.parse(opts.answers) : null;
    if (!answers) return { hook: 'session.personal-interview', ask: INTERVIEW_FIELDS };
    const res = runInterview({ homeDir: opts.home, harness: opts.harness, answers });
    return { hook: 'session.personal-interview', ran: res.created, file: res.file };
  },
  'interaction.inject-orchestration'() {
    const ledgerPath = join(opts.dir, 'docs', 'ORCHESTRATION.json');
    const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : { entries: [] };
    const last = ledger.entries.at(-1);
    const text = `spec-kit orquestração: ${ledger.entries.length} mudanças no ledger; última task=${last?.task_id ?? 'n/a'} (dev=${last?.developer ?? '?'}, model=${last?.model ?? '?'}). Leia docs/ORCHESTRATION.md antes de rotear.`;
    if (['claude-code', 'gemini-cli', 'cursor', 'antigravity-2.0', 'antigravity-ide'].includes(opts.harness)) {
      process.stdout.write(contextOutput(opts.harness, 'UserPromptSubmit', text).stdout + '\n');
      return null;
    }
    return { hook: 'interaction.inject-orchestration', entries: ledger.entries.length, lastTask: last?.task_id ?? null, squadFile: 'docs/ORCHESTRATION.md' };
  },
  'security-gate'() {
    const files = opts.files ? opts.files.split(',') : (canon.files.length ? canon.files : native.files);
    const { blocked, violations } = gate({ dir: opts.dir, files, content: native.content, logDir: join(opts.dir, 'docs') });
    for (const v of violations) emitEvent(opts.dir, 'security.violation', { item: v.item, severity: v.severity, file: v.file });
    if (blocked) {
      const reason = `security-gate (pentest reverso): ${violations.map((v) => `${v.item} @ ${v.file}${v.line ? ':' + v.line : ''}`).join('; ')}`;
      const dec = blockOutput(opts.harness, reason);
      if (dec.stdout) process.stdout.write(dec.stdout + '\n');
      if (dec.stderr) process.stderr.write(dec.stderr + '\n');
      process.exit(dec.exitCode ?? 0);
    }
    return { blocked: false };
  },
  'ledger-record'() {
    const payload = native;
    const session = ensureSession(opts.dir, { harness: opts.harness });
    const changed = opts.files ? opts.files.split(',') : (payload.files ?? payload.changes ?? canon.files);
    const entry = appendLedgerEntry(join(opts.dir, 'docs'), {
      session_id: session.session_id, native_session_id: canon.native_session_id ?? undefined,
      harness: opts.harness, task_id: opts.task ?? payload.task_id ?? 'n/a',
      developer: opts.developer, model: opts.model, tokens: payload.tokens, prompts: payload.prompts, changes: changed,
    });
    emitEvent(opts.dir, 'change.recorded', entry);
    return entry;
  },
  'docs-check'() {
    if (!existsSync(join(opts.dir, 'DOC_SYNC.json'))) return { ok: true, note: 'sem DOC_SYNC — nada a verificar' };
    const cov = coverage(opts.dir);
    if (cov.pendente > 0) {
      const reason = `docs-check: ${cov.pendente}/${cov.total} itens sem doc (100% obrigatório). Rode doc-gen: documente cada item pendente do DOC_SYNC.json em docs/technical/ e marque status=documentado.`;
      const dec = continueDecision(opts.harness, { iteration: (canon.execution_num ?? 0) + 1, max: 5, reason });
      if (dec.stdout) process.stdout.write(dec.stdout + '\n');
      if (dec.stderr) process.stderr.write(dec.stderr + '\n');
      process.exit(dec.exitCode ?? 0);
    }
    return { ok: true, ...cov };
  },
  'docs.sync'() {
    const files = opts.files ? opts.files.split(',') : (native.changed ?? canon.files);
    if (!existsSync(join(opts.dir, 'DOC_SYNC.json'))) return { ok: true, note: 'sem DOC_SYNC' };
    return { ok: true, ...syncAfterChange(opts.dir, files) };
  },
};

export function runHook(id, options = {}) {
  Object.assign(opts, options);
  if (!HOOK_IDS.includes(id)) throw new Error(`hook desconhecido: ${id}`);
  return hooks[id]();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const id = positionals[0];
  if (!id || !HOOK_IDS.includes(id)) {
    console.error(`uso: spec-kit-hook <${HOOK_IDS.join('|')}> [flags]`);
    process.exit(1);
  }
  const out = runHook(id);
  if (out) console.log(JSON.stringify(out));
}
