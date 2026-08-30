#!/usr/bin/env node
// Entrada única dos 7 hooks (chamada pelos adapters de cada harness via comando).
// Uso: node lib/hooks/run.js <hookId> --harness <h> [--dir <proj>] [flags]
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

const hooks = {
  'session.classify'() {
    const state = ensureSession(opts.dir, { harness: opts.harness });
    const mode = classifyProject(opts.dir);
    const context = { hook: 'session.classify', mode, session_id: state.session_id, harness: state.harness, additionalContext: ['AGENTS.md', 'docs/PRD.md', 'docs/ORCHESTRATION.md'].filter((f) => existsSync(join(opts.dir, f))) };
    emitEvent(opts.dir, 'session.started', { session_id: state.session_id, harness: opts.harness, pid: state.pid });
    return context;
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
    return { hook: 'interaction.inject-orchestration', entries: ledger.entries.length, lastTask: last?.task_id ?? null, squadFile: 'docs/ORCHESTRATION.md' };
  },
  'security-gate'() {
    const payload = readStdinJson();
    const files = opts.files ? opts.files.split(',') : payload.files;
    const { blocked, violations } = gate({ dir: opts.dir, files, content: payload.content, logDir: join(opts.dir, 'docs') });
    for (const v of violations) emitEvent(opts.dir, 'security.violation', { item: v.item, severity: v.severity, file: v.file });
    if (blocked) { console.error(JSON.stringify({ blocked, violations })); process.exit(2); }
    return { blocked: false };
  },
  'ledger-record'() {
    const payload = readStdinJson();
    const session = ensureSession(opts.dir, { harness: opts.harness });
    const entry = appendLedgerEntry(join(opts.dir, 'docs'), { session_id: session.session_id, harness: opts.harness, task_id: opts.task ?? payload.task_id ?? 'n/a', developer: opts.developer, model: opts.model, tokens: payload.tokens, prompts: payload.prompts, changes: payload.changes });
    emitEvent(opts.dir, 'change.recorded', entry);
    return entry;
  },
  'docs-check'() {
    if (!existsSync(join(opts.dir, 'DOC_SYNC.json'))) return { ok: true, note: 'sem DOC_SYNC — nada a verificar' };
    const cov = coverage(opts.dir);
    if (cov.pendente > 0) { console.error(JSON.stringify({ ok: false, ...cov })); process.exit(2); }
    return { ok: true, ...cov };
  },
  'docs.sync'() {
    const payload = readStdinJson();
    const files = opts.files ? opts.files.split(',') : payload.changed ?? [];
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
