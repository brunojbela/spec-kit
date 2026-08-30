import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { materializeAgents, materializeSkills } from '../lib/materialize.js';

const root = join(import.meta.dirname, '..');
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

before(() => {
  materializeAgents();
  materializeSkills();
});

test('T04: 7 agents globais em catalog/agents com frontmatter obrigatório', () => {
  const expected = ['orchestrator', 'generalist-implementer', 'generalist-qa', 'generalist-security', 'generalist-docs', 'legacy-analyzer', 'pack-security'];
  for (const id of expected) {
    const f = join(root, 'catalog/agents', `${id}.md`);
    assert.ok(existsSync(f), `falta ${id}.md`);
    const fm = readFileSync(f, 'utf8').split('---')[1];
    for (const field of ['id', 'friendlyName', 'cargo', 'funcao', 'how']) {
      assert.match(fm, new RegExp(`^${field}:`, 'm'), `${id}.md sem campo ${field}`);
    }
  }
});

test('T06: domain-engine com scope app/Core/Domain e proibições', () => {
  const fm = readFileSync(join(root, 'catalog/agents/domain-engine.md'), 'utf8').split('---')[1];
  assert.match(fm, /scope:/);
  assert.match(fm, /Core\/Domain/);
  assert.match(fm, /prohibitions:/);
});

test('T07: 36 SKILL.md com name válido e gatilho/steps', () => {
  const dirs = readdirSync(join(root, 'catalog/skills'));
  assert.equal(dirs.length, 36);
  for (const id of dirs) {
    assert.ok(NAME_RE.test(id), `id inválido: ${id}`);
    const content = readFileSync(join(root, 'catalog/skills', id, 'SKILL.md'), 'utf8');
    const fm = content.split('---')[1];
    assert.match(fm, new RegExp(`^name: "${id}"`, 'm'));
    assert.match(fm, /^description: ".+"/m);
    assert.match(fm, /^gatilho: ".+"/m);
    assert.match(fm, /^steps:$/m);
  }
});

test('materialização é idempotente', () => {
  const a1 = materializeAgents();
  const a2 = materializeAgents();
  assert.deepEqual(a1, a2);
});
