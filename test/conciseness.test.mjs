import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { concisenessRule, materializeAgents, materializeSkills } from '../lib/materialize.js';
import { buildSquad, renderAgentMd } from '../lib/generators/squad.js';

const root = join(import.meta.dirname, '..');

test('spec define standards.conciseness como fonte única', () => {
  const spec = JSON.parse(readFileSync(join(root, 'spec-kit.orchestration.json'), 'utf8'));
  assert.ok(spec.standards.conciseness.rule.includes('CONCISÃO'));
  assert.equal(concisenessRule(), spec.standards.conciseness.rule);
});

test('TODOS os catalog agents carregam a regra (how + frontmatter + seção)', () => {
  materializeAgents();
  for (const f of readdirSync(join(root, 'catalog/agents'))) {
    const md = readFileSync(join(root, 'catalog/agents', f), 'utf8');
    assert.ok(md.includes('CONCISÃO'), `${f} sem regra`);
    assert.match(md, /^conciseness: "/m);
    assert.match(md, /## Regra de código \(todos os agents\)/);
  }
});

test('TODAS as 36 catalog skills carregam a regra (steps + seção)', () => {
  materializeSkills();
  const dirs = readdirSync(join(root, 'catalog/skills'));
  assert.equal(dirs.length, 36);
  for (const id of dirs) {
    const md = readFileSync(join(root, 'catalog/skills', id, 'SKILL.md'), 'utf8');
    assert.ok(md.includes('CONCISÃO'), `${id} sem regra`);
    assert.match(md, /## Regra de código \(todas as skills\)/);
  }
});

test('squad local gerado: 8/8 agents com regra no how, frontmatter e corpo', () => {
  for (const a of buildSquad({ stack: ['laravel'] })) {
    assert.ok(a.how.includes('CONCISÃO'), a.id);
    const md = renderAgentMd(a);
    assert.match(md, /^conciseness: >-/m);
    assert.match(md, /## Regra de código \(todos os agents\)/);
  }
});

test('docs do site: 16 agents + 36 skills documentam a regra', () => {
  for (const dir of ['docs/agents', 'docs/skills']) {
    const files = readdirSync(join(root, dir));
    assert.ok(files.length >= 16);
    for (const f of files) {
      assert.ok(readFileSync(join(root, dir, f), 'utf8').includes('CONCISÃO'), `${dir}/${f}`);
    }
  }
});
