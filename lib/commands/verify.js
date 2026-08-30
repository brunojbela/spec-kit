import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { scanFiles } from '../security-gate.js';
import { coverage } from '../doc-sync.js';
import { recordViolations, appendLedgerEntry } from '../governance.js';
import { emitEvent } from '../events.js';
import { getSession } from '../session.js';

const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'vendor', '.opencode', '.claude', '.cursor', '.codex', '.agents', '.gemini']);

function sourceFiles(dir, root = dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e) || e.startsWith('.')) continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) sourceFiles(full, root, acc);
    else if (/\.(php|js|mjs|ts|tsx|jsx|py|vue)$/.test(e)) acc.push(full.slice(root.length + 1));
  }
  return acc;
}

// T16 — spec-kit verify: QA (testes) + security + docs-check; grava ledger; exit 0/1.
export function verify({ dir }) {
  const gates = {};
  if (existsSync(join(dir, 'test'))) {
    try { execFileSync('node', ['--test', 'test/'], { cwd: dir, stdio: 'pipe' }); gates.qa = { ok: true }; }
    catch (e) { gates.qa = { ok: false, detail: String(e.stdout ?? e.message).slice(0, 400) }; }
  } else gates.qa = { ok: true, note: 'sem pasta test/' };

  const violations = scanFiles(dir, sourceFiles(dir));
  if (violations.length) recordViolations(join(dir, 'docs'), violations);
  gates.security = { ok: violations.length === 0, violations: violations.length };

  gates.docs = existsSync(join(dir, 'DOC_SYNC.json')) ? { ok: coverage(dir).pendente === 0, ...coverage(dir) } : { ok: true, note: 'sem DOC_SYNC' };

  const ok = gates.qa.ok && gates.security.ok && gates.docs.ok;
  const session = getSession(dir);
  appendLedgerEntry(join(dir, 'docs'), { session_id: session?.session_id ?? 'unknown', harness: session?.harness ?? 'verify', task_id: 'verify', developer: 'qa', model: 'n/a', metrics: { gatesPassed: ok } });
  emitEvent(dir, 'change.recorded', { session_id: session?.session_id ?? 'unknown', harness: session?.harness ?? 'verify', task_id: 'verify', developer: 'qa', model: 'n/a' });
  return { ok, gates };
}

export async function run(opts) {
  const res = verify(opts);
  if (!res.ok) process.exitCode = 1;
  return res;
}
