import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderPrdMd, renderLedgerMd, renderSecurityMd, writeMirrored, appendLedgerEntry, loadOrchestration, recordViolations, loadSecurityLog, setTaskStatus } from '../lib/governance.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'gov-'));

test('T18: writeMirrored gera JSON+MD espelhados e válidos por schema', () => {
  const dir = tmp();
  const ledger = { project: 'p', updatedAt: new Date().toISOString(), entries: [] };
  writeMirrored(dir, 'ORCHESTRATION', ledger, renderLedgerMd);
  assert.ok(existsSync(join(dir, 'ORCHESTRATION.json')));
  const md = readFileSync(join(dir, 'ORCHESTRATION.md'), 'utf8');
  assert.match(md, /ORCHESTRATION ledger — p/);
  const sec = { project: 'p', updatedAt: 'x', violations: [] };
  writeMirrored(dir, 'SECURITY_LOG', sec, renderSecurityMd);
  assert.ok(existsSync(join(dir, 'SECURITY_LOG.md')));
});

test('T18: renderPrdMd espelha TODOS os campos sem truncamento', () => {
  const prd = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'prd.sample.json'), 'utf8'));
  const md = renderPrdMd(prd);
  for (const t of prd.tasks) {
    assert.ok(md.includes(t.what.replace(/\|/g, '\\|')), `what de ${t.id} truncado/ausente`);
    assert.ok(md.includes(t.acceptanceCriteria.replace(/\|/g, '\\|')), `AC de ${t.id} truncada/ausente`);
  }
});

test('T19: appendLedgerEntry preenche campos obrigatórios e mantém espelho', () => {
  const dir = tmp();
  const entry = appendLedgerEntry(dir, { harness: 'opencode', task_id: 'T05', developer: 'dev-senior', model: 'claude-opus-4-8', tokens: 1500, prompts: 4 });
  assert.ok(entry.session_id);
  const led = loadOrchestration(dir);
  assert.equal(led.entries[0].task_id, 'T05');
  assert.ok(readFileSync(join(dir, 'ORCHESTRATION.md'), 'utf8').includes('T05'));
});

test('T19: recordViolations mantém SECURITY_LOG.json+md espelhados', () => {
  const dir = tmp();
  recordViolations(dir, [{ item: 'SSRF', severity: 'alta', file: 'src/x.php', action: 'bloqueado' }]);
  const log = loadSecurityLog(dir);
  assert.equal(log.violations[0].item, 'SSRF');
  assert.ok(readFileSync(join(dir, 'SECURITY_LOG.md'), 'utf8').includes('SSRF'));
});

test('T18: setTaskStatus atualiza JSON e regenera MD (espelho vivo)', () => {
  const dir = tmp();
  const prdPath = join(dir, 'PRD.json');
  const prd = {
    metadata: { project: 'x', version: '0', owner: 'o', createdAt: '2026', status: 's' },
    sharedContext: { objetivo: 'o', principios: ['p'] },
    features: [{ id: 'F01', name: 'n', goal: 'g' }],
    tasks: [{ id: 'T01', feature: 'F01', what: 'fazer algo completo', why: 'por que', acceptanceCriteria: 'criterio valido', difficulty: 'médio', model: 'm', dependsOn: [], status: 'pendente' }],
  };
  writeFileSync(prdPath, JSON.stringify(prd));
  writeFileSync(prdPath.replace('.json', '.md'), renderPrdMd(prd));
  setTaskStatus(prdPath, 'T01', 'concluída');
  assert.equal(JSON.parse(readFileSync(prdPath, 'utf8')).tasks[0].status, 'concluída');
  assert.ok(readFileSync(prdPath.replace('.json', '.md'), 'utf8').includes('concluída'));
});
