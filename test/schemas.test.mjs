import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validate, schemaNames } from '../lib/schemas.js';

const root = join(import.meta.dirname, '..');

test('schemas carregam todos os 7', () => {
  assert.deepEqual(schemaNames().sort(), ['agent', 'doc-sync', 'model-catalog', 'orchestration', 'prd', 'project-context', 'security']);
});

test('prd.schema valida PRD de exemplo', () => {
  const prd = JSON.parse(readFileSync(join(root, 'test', 'fixtures', 'prd.sample.json'), 'utf8'));
  const { valid, errors } = validate('prd', prd);
  assert.ok(valid, errors.join('; '));
});

test('prd.schema rejeita task sem dependsOn/status inválido', () => {
  const bad = {
    metadata: { project: 'x', version: '0', owner: 'o', createdAt: '2026', status: 's' },
    sharedContext: { objetivo: 'o', principios: ['p'] },
    features: [{ id: 'F01', name: 'n', goal: 'g' }],
    tasks: [{ id: 'T01', feature: 'F01', what: 'aaaaaaaaaa', why: 'w', acceptanceCriteria: 'cccccccccc', difficulty: 'impossível', model: 'm', dependsOn: [], status: 'done' }],
  };
  const { valid } = validate('prd', bad);
  assert.equal(valid, false);
});

test('orchestration.schema valida ledger de exemplo', () => {
  const ledger = {
    project: 'spec-kit',
    updatedAt: '2026-08-30T00:00:00Z',
    entries: [{ session_id: 's1', harness: 'opencode', task_id: 'T01', developer: 'dev-senior', model: 'claude-sonnet-4-6', tokens: 1200, prompts: 3, timestamp: '2026-08-30T00:00:00Z' }],
  };
  assert.equal(validate('orchestration', ledger).valid, true);
});

test('orchestration.schema rejeita entrada sem campos obrigatórios', () => {
  assert.equal(validate('orchestration', { project: 'p', updatedAt: 'x', entries: [{ session_id: 's1' }] }).valid, false);
});

test('security.schema valida violação', () => {
  const log = {
    project: 'p',
    updatedAt: 'x',
    violations: [{ item: 'SQL Injection', severity: 'crítica', file: 'src/a.php', timestamp: 'x', status: 'aberta', action: 'bloqueado' }],
  };
  assert.equal(validate('security', log).valid, true);
});

test('doc-sync.schema valida manifest', () => {
  const doc = {
    project: 'p',
    generatedAt: 'x',
    items: [
      { id: 'd1', module: 'Core/User', feature: 'F01', case: 'criar usuário', class: 'User', method: 'create', kind: 'technical', status: 'pendente' },
      { id: 'd2', module: 'Core/User', kind: 'functional', status: 'documentado', docPath: 'docs/functional/user-create.md' },
    ],
  };
  assert.equal(validate('doc-sync', doc).valid, true);
});

test('project-context.schema valida contexto', () => {
  assert.equal(validate('project-context', { stack: ['laravel13', 'react19'], conventions: [], structure: [], gates: ['security-gate'], mode: 'greenfield' }).valid, true);
});
