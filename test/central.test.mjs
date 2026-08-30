import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { recommendModel, DIFFICULTY_MODEL } from '../lib/central.js';
import { appendLedgerEntry, loadOrchestration } from '../lib/governance.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'central-'));

test('T31: central indisponível → fallback local com matriz + catálogo', async () => {
  const rec = await recommendModel({ difficulty: 'difícil', centralUrl: 'http://127.0.0.1:1' });
  assert.equal(rec.model, 'claude-opus-4-8');
  assert.equal(rec.fallback, true);
  assert.equal(rec.source, 'local');
});

test('T31: central disponível → consome GET /models/recommend', async () => {
  const server = createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ model: 'gpt-5.6-sol', reason: `central: melhor p/ ${u.searchParams.get('difficulty')} em ${u.searchParams.get('harness')}` }));
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  try {
    const rec = await recommendModel({ difficulty: 'médio', harness: 'codex', centralUrl: `http://127.0.0.1:${port}` });
    assert.equal(rec.model, 'gpt-5.6-sol');
    assert.equal(rec.source, 'central');
    assert.equal(rec.fallback, false);
  } finally { server.close(); }
});

test('T31: entrada do ledger registra fallback:true quando local', async () => {
  const dir = tmp();
  const rec = await recommendModel({ difficulty: 'trivial' });
  const entry = appendLedgerEntry(dir, { harness: 'opencode', task_id: 'T01', developer: 'd', model: rec.model, fallback: rec.fallback });
  assert.equal(loadOrchestration(dir).entries[0].fallback, true);
});

test('T31: dificuldade inválida lança', async () => {
  await assert.rejects(() => recommendModel({ difficulty: 'impossível' }), /inválida/);
});
