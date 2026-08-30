import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanProject, writeDocSync, loadDocSync, markDocumented, syncAfterChange, coverage } from '../lib/doc-sync.js';
import { documentItem, runDocPipeline } from '../lib/doc-gen.js';
import { validate } from '../lib/schemas.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'doc-'));

function mockLegacy() {
  const dir = tmp();
  mkdirSync(join(dir, 'app/Domain/Order'), { recursive: true });
  writeFileSync(join(dir, 'app/Domain/Order/Order.php'), '<?php\nclass Order {\n  public function total() { return 1; }\n}');
  writeFileSync(join(dir, 'app/Domain/Order/Item.php'), '<?php\nclass Item {\n  public function price() { return 2; }\n}');
  return dir;
}

test('T20: DOC_SYNC.json é manifest válido com status pendente/documentado', () => {
  const dir = mockLegacy();
  const doc = scanProject(dir, 'mock');
  writeDocSync(dir, doc);
  assert.equal(validate('doc-sync', loadDocSync(dir)).valid, true);
  assert.ok(doc.items.every((i) => i.status === 'pendente'));
});

test('T21: Arqueólogo cobre 100% dos módulos/classes do mock (sem documentar)', () => {
  const dir = mockLegacy();
  const doc = scanProject(dir, 'mock');
  const classes = doc.items.map((i) => i.class).filter(Boolean);
  assert.ok(classes.includes('Order') && classes.includes('Item'));
  assert.ok(doc.items.some((i) => i.method === 'total'));
  assert.ok(doc.items.every((i) => i.status === 'pendente'));
});

test('T22: pipeline multisubagents → 100% documentado, técnico cita class/method', async () => {
  const dir = mockLegacy();
  writeDocSync(dir, scanProject(dir, 'mock'));
  const cov = await runDocPipeline(dir);
  assert.equal(cov.pendente, 0);
  assert.equal(cov.total > 0, true);
  const doc = loadDocSync(dir);
  for (const i of doc.items) {
    assert.equal(i.status, 'documentado');
    assert.ok(existsSync(join(dir, i.docPath)));
  }
  const tech = readFileSync(join(dir, doc.items.find((i) => i.method === 'total').docPath), 'utf8');
  assert.match(tech, /\*\*Classe:\*\* Order/);
  assert.match(tech, /\*\*Method:\*\* total/);
});

test('T22: nenhum item fica sem dono (documentItem resolve pendente específico)', () => {
  const dir = mockLegacy();
  writeDocSync(dir, scanProject(dir, 'mock'));
  const before = coverage(dir).pendente;
  documentItem(dir, 'd1');
  assert.equal(coverage(dir).pendente, before - 1);
});

test('T23: syncAfterChange — novo arquivo vira pendente; deletado sai do manifest', () => {
  const dir = mockLegacy();
  writeDocSync(dir, scanProject(dir, 'mock'));
  const total0 = coverage(dir).total;
  writeFileSync(join(dir, 'app/Domain/Order/Extra.php'), '<?php\nclass Extra {\n  public function calc() { return 3; }\n}');
  const r1 = syncAfterChange(dir, ['app/Domain/Order/Extra.php']);
  assert.ok(r1.added >= 1);
  rmSync(join(dir, 'app/Domain/Order/Extra.php'));
  const r2 = syncAfterChange(dir, ['app/Domain/Order/Extra.php']);
  assert.ok(r2.removed >= 1);
  assert.equal(coverage(dir).total, total0);
});
