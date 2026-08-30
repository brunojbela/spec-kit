import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeTaskSync, PLAN_BY_LEVEL, LEVELS } from '../lib/po.js';
import { DIFFICULTY_MODEL } from '../lib/central.js';

const prd = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'docs/PRD.json'), 'utf8'));

test('T24/T26: plano definido para os 5 níveis trivial→extremo', () => {
  assert.deepEqual(LEVELS, ['trivial', 'fácil', 'médio', 'difícil', 'extremamente difícil']);
  assert.equal(new Set(Object.values(PLAN_BY_LEVEL)).size, 5);
  assert.match(PLAN_BY_LEVEL['extremamente difícil'], /decompor em subtasks/);
});

test('T26: matriz dificuldade→modelo coerente com benchmarks (opus p/ difícil+)', () => {
  assert.equal(DIFFICULTY_MODEL['difícil'], 'claude-opus-4-8');
  assert.equal(DIFFICULTY_MODEL['médio'], 'claude-sonnet-4-6');
  assert.equal(DIFFICULTY_MODEL.trivial, 'claude-haiku-4-5');
});

test('T25: before-task-sync — task com deps pendentes é bloqueada com plano do nível', async () => {
  const prdPend = structuredClone(prd);
  for (const t of prdPend.tasks) t.status = 'pendente';
  const res = await beforeTaskSync({ prd: prdPend, taskId: 'T16' });
  assert.equal(res.ok, false);
  assert.ok(res.blockedBy.includes('T02'));
  assert.equal(res.model, 'claude-opus-4-8');
  assert.match(res.plan, /multiagents/);
});

test('T25: before-task-sync — task sem deps e completa passa', async () => {
  const prdCopy = structuredClone(prd);
  prdCopy.tasks.find((t) => t.id === 'T01').status = 'concluída';
  const res = await beforeTaskSync({ prd: prdCopy, taskId: 'T02' });
  assert.equal(res.ok, true);
  assert.equal(res.model, 'claude-haiku-4-5');
});

test('T25: task inexistente lança', async () => {
  await assert.rejects(() => beforeTaskSync({ prd, taskId: 'T99' }), /não existe/);
});
