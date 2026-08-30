import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

// T17 — session_id ESTÁVEL entre harnesses: criado uma vez, só harness/pid mudam.
export function stateFile(dir) {
  return join(dir, '.spec-kit', 'session.json');
}

export function ensureSession(dir, { harness, pid = process.pid } = {}) {
  const file = stateFile(dir);
  mkdirSync(join(dir, '.spec-kit'), { recursive: true });
  let state;
  if (existsSync(file)) {
    state = JSON.parse(readFileSync(file, 'utf8'));
    state.harness = harness ?? state.harness;
    state.pid = pid;
    state.resumedAt = new Date().toISOString();
  } else {
    state = { session_id: randomUUID(), harness, pid, startedAt: new Date().toISOString() };
  }
  writeFileSync(file, JSON.stringify(state, null, 2) + '\n');
  return state;
}

export function getSession(dir) {
  if (!existsSync(stateFile(dir))) return null;
  return JSON.parse(readFileSync(stateFile(dir), 'utf8'));
}

// T24 — classificação do modo na abertura da sessão (session.classify).
export function classifyProject(dir) {
  const hasDocs = existsSync(join(dir, 'docs', 'PRD.json'));
  const hasAgents = existsSync(join(dir, 'AGENTS.md'));
  const hasCode = existsSync(join(dir, 'package.json')) || existsSync(join(dir, 'composer.json')) || existsSync(join(dir, 'pyproject.toml')) || existsSync(join(dir, 'requirements.txt'));
  if (hasDocs && hasAgents) return 'sync';
  if (hasCode) return 'analyze';
  return 'init';
}
