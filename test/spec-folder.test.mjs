import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initSpecFolder, recordQuery, readQueries, writeFeatureSpec, renderStandardsMd, standardsCatalog } from '../lib/spec-folder.js';
import { run as initRun } from '../lib/commands/init.js';
import { update } from '../lib/commands/update.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'specf-'));

test('T35: init cria .spec/ com standards json+md, queries e features', async () => {
  const dir = tmp();
  await initRun({ dir, stack: 'laravel,react' });
  assert.ok(existsSync(join(dir, '.spec/standards.json')));
  assert.ok(existsSync(join(dir, '.spec/standards.md')));
  assert.ok(existsSync(join(dir, '.spec/queries/queries.jsonl')));
  const std = JSON.parse(readFileSync(join(dir, '.spec/standards.json'), 'utf8'));
  assert.ok(std.conciseness.includes('CONCISÃO'));
  assert.ok(std.docsAlwaysOn.includes('QUALQUER mudança'));
  assert.ok(std.stack.includes('laravel'));
  assert.ok(readFileSync(join(dir, 'AGENTS.md'), 'utf8').includes('.spec/standards.md'));
});

test('T35: recordQuery — memória de consultas append-only com schema', () => {
  const dir = tmp();
  initSpecFolder(dir, { stack: ['laravel'] });
  const rec = recordQuery(dir, { agent: 'dev-senior', skill: 'laravel', harness: 'claude-code', libraryId: '/laravel/docs', query: 'Eloquent casts 13', sources: ['casts.md'] });
  assert.ok(rec.ts);
  assert.throws(() => recordQuery(dir, { agent: 'x' }), /exige agent/);
  const all = readQueries(dir);
  assert.equal(all.length, 1);
  assert.equal(all[0].libraryId, '/laravel/docs');
});

test('T35: writeFeatureSpec grava spec e plan por feature', () => {
  const dir = tmp();
  initSpecFolder(dir, { stack: ['node'] });
  assert.ok(existsSync(writeFeatureSpec(dir, 'F01', 'spec', '# F01 spec')));
  assert.ok(existsSync(writeFeatureSpec(dir, 'F01', 'plan', '# F01 plan')));
  assert.throws(() => writeFeatureSpec(dir, 'F01', 'other', 'x'), /spec.*plan/);
});

test('T35: update reescreve standards mas NUNCA toca queries/features', async () => {
  const dir = tmp();
  await initRun({ dir, stack: ['laravel'] });
  recordQuery(dir, { agent: 'qa', libraryId: '/laravel/docs', query: 'assert' });
  writeFeatureSpec(dir, 'F01', 'spec', '# spec do usuário');
  const qBefore = readFileSync(join(dir, '.spec/queries/queries.jsonl'), 'utf8');
  const s = JSON.parse(readFileSync(join(dir, '.spec/standards.json'), 'utf8'));
  s.selecionadosEm = '2020-01-01';
  const { writeFileSync } = await import('fs');
  writeFileSync(join(dir, '.spec/standards.json'), JSON.stringify(s));
  writeFileSync(join(dir, '.spec-kit/installed.json'), JSON.stringify({ ...JSON.parse(readFileSync(join(dir, '.spec-kit/installed.json'), 'utf8')), packVersion: '0.0.1' }));
  const res = await update({ dir });
  assert.equal(res.updated, true);
  assert.equal(readFileSync(join(dir, '.spec/queries/queries.jsonl'), 'utf8'), qBefore, 'queries preservadas');
  assert.equal(readFileSync(join(dir, '.spec/features/F01.spec.md'), 'utf8'), '# spec do usuário', 'features preservadas');
  assert.notEqual(JSON.parse(readFileSync(join(dir, '.spec/standards.json'), 'utf8')).selecionadosEm, '2020-01-01', 'standards reescritos da fonte');
});

test('T35: session.classify injeta pointer .spec no contexto do agente', async () => {
  const dir = tmp();
  await initRun({ dir, stack: ['node'] });
  const { execFileSync } = await import('child_process');
  const out = execFileSync('node', [join(import.meta.dirname, '..', 'lib/hooks/run.js'), 'session.classify', '--harness', 'claude-code', '--dir', dir], { encoding: 'utf8' });
  assert.match(JSON.parse(out).hookSpecificOutput.additionalContext, /\.spec\/standards\.md/);
  assert.match(JSON.parse(out).hookSpecificOutput.additionalContext, /queries\.jsonl/);
});

test('T35: squad gerado instrui registro de consultas Context7', async () => {
  const { buildSquad } = await import('../lib/generators/squad.js');
  const ctx7 = buildSquad({ stack: ['laravel'] }).find((a) => a.usesContext7);
  assert.ok(ctx7, 'squad tem agent usesContext7');
  assert.match(ctx7.how, /REGISTRE cada consulta em \.spec\/queries\/queries\.jsonl/);
});

test('dogfooding: catálogo do kit expõe docsAlwaysOn e projectFolder no spec', () => {
  const std = standardsCatalog();
  assert.match(std.docsAlwaysOn.rule, /task n[ãa]o conclu[íi]da/i);
  const spec = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'spec-kit.orchestration.json'), 'utf8'));
  assert.equal(spec.specKit.projectFolder.path, '.spec/');
});
