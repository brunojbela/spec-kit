import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInterview, isFirstRun, INTERVIEW_FIELDS, globalAgentsPath } from '../lib/personal.js';
import { scanProjects, writeRegistry } from '../lib/registry.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'pers-'));

test('T27: first-run — entrevista de 6 campos cria AGENTS.md GLOBAL por harness', () => {
  const home = tmp();
  assert.equal(INTERVIEW_FIELDS.length, 6);
  for (const harness of ['opencode', 'claude-code', 'codex', 'cursor', 'gemini-cli', 'antigravity-2.0', 'antigravity-cli (agy)', 'antigravity-ide']) {
    assert.ok(isFirstRun(home, harness));
    const res = runInterview({ homeDir: home, harness, answers: ['Ana', 'Jarvis', 'autônomo', 'TDD', 'direto', 'changelog'] });
    assert.ok(res.created);
    assert.ok(existsSync(globalAgentsPath(home, harness)));
    assert.equal(isFirstRun(home, harness), false);
  }
  assert.ok(readFileSync(join(home, '.claude/CLAUDE.md'), 'utf8').includes('Ana'));
});

test('T27: segunda execução não repete entrevista', () => {
  const home = tmp();
  const answers = ['a', 'b', 'c', 'd', 'e', 'f'];
  runInterview({ homeDir: home, harness: 'opencode', answers });
  const res = runInterview({ homeDir: home, harness: 'opencode', answers });
  assert.equal(res.created, false);
});

test('T27: respostas erradas (número de campos) lançam', () => {
  assert.throws(() => runInterview({ homeDir: tmp(), harness: 'opencode', answers: ['só'] }), /6 respostas/);
});

test('T28: registry mapeia nome/stack/SDD?/repo/sessions/overview', () => {
  const root = tmp();
  const a = join(root, 'api-laravel');
  mkdirSync(join(a, 'docs'), { recursive: true });
  writeFileSync(join(a, 'composer.json'), JSON.stringify({ require: { 'laravel/framework': '^13' } }));
  writeFileSync(join(a, 'docs/ORCHESTRATION.json'), JSON.stringify({ project: 'api', updatedAt: 'x', entries: [{ session_id: 's', harness: 'claude-code', task_id: 'T1', developer: 'd', model: 'm', timestamp: 'x' }, { session_id: 's', harness: 'opencode', task_id: 'T2', developer: 'd', model: 'm', timestamp: 'x' }] }));
  writeFileSync(join(a, 'docs/PRD.json'), JSON.stringify({ metadata: {}, sharedContext: { objetivo: 'API de pedidos' }, features: [], tasks: [] }));
  const b = join(root, 'site-estatico');
  mkdirSync(b, { recursive: true });
  writeFileSync(join(b, 'index.html'), '<html>');

  const reg = writeRegistry(root, join(root, 'projects-registry.json'));
  const api = reg.projects.find((p) => p.name === 'api-laravel');
  assert.ok(api.stack.includes('laravel'));
  assert.equal(api.sdd, true);
  assert.equal(api.sessions.count, 2);
  assert.deepEqual(api.sessions.harnesses.sort(), ['claude-code', 'opencode']);
  assert.equal(api.overview, 'API de pedidos');
  const site = reg.projects.find((p) => p.name === 'site-estatico');
  assert.equal(site.sdd, false);
  assert.ok(existsSync(join(root, 'projects-registry.md')));
  assert.match(readFileSync(join(root, 'projects-registry.md'), 'utf8'), /api-laravel/);
});
