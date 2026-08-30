import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSquad, installSquad, renderAgentMd } from '../lib/generators/squad.js';
import { installSkills, wireAgentsSkills } from '../lib/generators/skills.js';
import { HARNESS_IDS } from '../lib/harnesses/registry.js';
import { validate } from '../lib/schemas.js';

const SQUAD_IDS = ['po', 'techlead', 'dev-senior', 'dev-pleno', 'dev-junior', 'qa', 'security-specialist', 'docs-specialist'];

test('T05: buildSquad stack laravel13+react19 → 8 agents especialistas válidos por schema', () => {
  const squad = buildSquad({ stack: ['laravel13', 'react19'] });
  assert.equal(squad.length, 8);
  assert.deepEqual(squad.map((a) => a.id), SQUAD_IDS);
  for (const a of squad) {
    assert.ok(a.stack.includes('laravel') && a.stack.includes('react'));
    assert.ok(a.skills.includes('laravel') && a.skills.includes('react'));
    assert.ok(a.context7.length > 0);
    assert.ok(a.how.includes('Context7') || !a.usesContext7);
    assert.equal(validate('agent', a).valid, true);
  }
});

test('T05: buildSquad stack python+fastapi → 8 agents válidos', () => {
  const squad = buildSquad({ stack: ['python', 'fastapi'] });
  assert.equal(squad.length, 8);
  for (const a of squad) assert.ok(a.skills.includes('python'));
});

test('T05: installSquad gera .opencode/.claude/.cursor/... com os 8 agents', () => {
  const dir = mkdtempSync(join(tmpdir(), 'squad-'));
  const { written } = installSquad({ stack: ['laravel', 'react'], dir });
  for (const h of ['opencode', 'claude-code', 'cursor']) {
    for (const id of SQUAD_IDS) {
      const layout = { opencode: '.opencode/agents', 'claude-code': '.claude/agents', cursor: '.cursor/agents' }[h];
      assert.ok(existsSync(join(dir, layout, `${id}.md`)), `${h}/${id} ausente`);
    }
  }
  // harnesses sem dir de agents recebem seção no arquivo de contexto
  assert.ok(readFileSync(join(dir, 'AGENTS.md'), 'utf8').includes('Squad spec-kit'));
  assert.ok(readFileSync(join(dir, 'GEMINI.md'), 'utf8').includes('Squad spec-kit'));
  assert.ok(written.length >= 8 * 3);
});

test('T05: agent gerado tem frontmatter parseável e idempotente', () => {
  const [po] = buildSquad({ stack: ['laravel'] });
  const md = renderAgentMd(po);
  const fm = md.split('---')[1];
  assert.match(fm, /^id: "po"/m);
  assert.match(fm, /^tier: "local"/m);
  assert.equal(renderAgentMd(po), md);
});

test('T08: installSkills copia skills do stack por harness + compat codex', () => {
  const dir = mkdtempSync(join(tmpdir(), 'skills-'));
  const { skills, written } = installSkills({ stack: ['laravel', 'react'], dir });
  assert.ok(skills.includes('laravel') && skills.includes('react') && skills.includes('tdd'));
  assert.ok(existsSync(join(dir, '.opencode/skills/laravel/SKILL.md')));
  assert.ok(existsSync(join(dir, '.codex/skills/laravel/SKILL.md')));
  assert.ok(existsSync(join(dir, '.agents/skills/laravel/SKILL.md')));
  assert.ok(written.length > 0);
  // agy usa formato flat .agents/skills/<n>.md
  assert.ok(existsSync(join(dir, '.agents/skills/tdd.md')));
});

test('T08: wireAgentsSkills registra mapeamento agente→skills no AGENTS.md', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wire-'));
  const squad = buildSquad({ stack: ['laravel'] });
  const { skills } = installSkills({ stack: ['laravel'], dir });
  const file = wireAgentsSkills({ dir, squad, skills });
  const md = readFileSync(file, 'utf8');
  assert.match(md, /\*\*dev-senior\*\* →/);
  assert.ok(md.includes('laravel'));
});

test('registry: HARNESS_IDS tem os 8 alvos verificados', () => {
  assert.equal(HARNESS_IDS.length, 8);
});
