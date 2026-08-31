import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { run as initRun } from '../lib/commands/init.js';
import { update } from '../lib/commands/update.js';
import { readStamp, isStale, packVersion } from '../lib/installed.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'upd-'));
const BIN = join(import.meta.dirname, '..', 'bin/spec-kit.js');

async function installedProject() {
  const dir = tmp();
  await initRun({ dir, stack: 'laravel,react', harnesses: undefined });
  return dir;
}

test('T34: init grava stamp .spec-kit/installed.json com stack e harnesses', async () => {
  const dir = await installedProject();
  const stamp = readStamp(dir);
  assert.equal(stamp.pack, 'spec-kit');
  assert.equal(stamp.packVersion, packVersion());
  assert.ok(stamp.stack.includes('laravel'));
  assert.equal(stamp.harnesses.length, 8);
  assert.equal(isStale(dir).stale, false);
});

test('T34: update --force REESCREVE instruções corrompidas a partir da fonte', async () => {
  const dir = await installedProject();
  const po = join(dir, '.opencode/agents/po.md');
  writeFileSync(po, '# PO corrompido por drift local\n');
  const res = await update({ dir, force: true });
  assert.equal(res.updated, true);
  const md = readFileSync(po, 'utf8');
  assert.ok(md.includes('CONCISÃO'), 'agente reescrito deve carregar a regra da fonte');
  assert.ok(md.includes('id: "po"'));
});

test('T34: update sem stale e sem force não reescreve; --check só reporta', async () => {
  const dir = await installedProject();
  const po = join(dir, '.opencode/agents/po.md');
  writeFileSync(po, '# manual edit\n');
  const noop = await update({ dir });
  assert.equal(noop.updated, false);
  assert.match(readFileSync(po, 'utf8'), /manual edit/, 'sem force não toca');
  const chk = await update({ dir, check: true });
  assert.equal(chk.check, true);
  assert.equal(chk.stale, false);
});

test('T34: stamp antigo → stale detectado; update migra versão do stamp', async () => {
  const dir = await installedProject();
  const sf = join(dir, '.spec-kit', 'installed.json');
  const stamp = JSON.parse(readFileSync(sf, 'utf8'));
  stamp.packVersion = '0.0.1';
  writeFileSync(sf, JSON.stringify(stamp, null, 2));
  assert.equal(isStale(dir).stale, true);
  const chk = await update({ dir, check: true });
  assert.equal(chk.stale, true);
  assert.equal(chk.installed, '0.0.1');
  const res = await update({ dir });
  assert.equal(res.updated, true);
  assert.equal(res.from, '0.0.1');
  assert.equal(readStamp(dir).packVersion, packVersion());
});

test('T34: update NUNCA toca dados do usuário (PRD, ledger, DOC_SYNC)', async () => {
  const dir = await installedProject();
  writeFileSync(join(dir, 'docs/PRD.json'), '{"sentinela":"prd-do-usuario"}');
  writeFileSync(join(dir, 'docs/ORCHESTRATION.json'), '{"sentinela":"ledger"}');
  writeFileSync(join(dir, 'DOC_SYNC.json'), '{"sentinela":"docsync"}');
  const stamp = JSON.parse(readFileSync(join(dir, '.spec-kit/installed.json'), 'utf8'));
  stamp.packVersion = '0.0.1';
  writeFileSync(join(dir, '.spec-kit/installed.json'), JSON.stringify(stamp));
  await update({ dir });
  assert.equal(readFileSync(join(dir, 'docs/PRD.json'), 'utf8'), '{"sentinela":"prd-do-usuario"}');
  assert.equal(readFileSync(join(dir, 'docs/ORCHESTRATION.json'), 'utf8'), '{"sentinela":"ledger"}');
  assert.equal(readFileSync(join(dir, 'DOC_SYNC.json'), 'utf8'), '{"sentinela":"docsync"}');
});

test('T34: hooks idempotentes — update duplo não duplica entradas', async () => {
  const dir = await installedProject();
  const settings = join(dir, '.claude/settings.json');
  const before = JSON.parse(readFileSync(settings, 'utf8')).hooks.SessionStart.length;
  const stamp = join(dir, '.spec-kit/installed.json');
  const s = JSON.parse(readFileSync(stamp, 'utf8')); s.packVersion = '0.0.1'; writeFileSync(stamp, JSON.stringify(s));
  await update({ dir });
  const after = JSON.parse(readFileSync(settings, 'utf8')).hooks.SessionStart.length;
  assert.equal(after, before, 'SessionStart não pode crescer a cada update');
});

test('T34: session.classify sinaliza kit stale ao agente (organismo vivo)', async () => {
  const p = await installedProject();
  {
    const sf = join(p, '.spec-kit/installed.json');
    const s = JSON.parse(readFileSync(sf, 'utf8')); s.packVersion = '0.0.1'; writeFileSync(sf, JSON.stringify(s));
    const out = JSON.parse(execFileSync('node', [join(import.meta.dirname, '..', 'lib/hooks/run.js'), 'session.classify', '--harness', 'opencode', '--dir', p], { encoding: 'utf8' }));
    assert.equal(out.kitUpdateAvailable, true);
    assert.match(out.additionalContext, /spec-kit update/);
  }
});

test('T34: CLI spec-kit update --check via bin', async () => {
  const dir = await installedProject();
  const out = execFileSync('node', [BIN, 'update', '--dir', dir, '--check'], { encoding: 'utf8' });
  assert.match(out, /"check":true/);
});
