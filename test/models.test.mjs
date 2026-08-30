import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { refresh, loadCatalog, CATALOG_PATH } from '../lib/models.js';
import { validate } from '../lib/schemas.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'models-'));

test('T33: models/catalog.json tem 6 modelos válidos por schema', () => {
  const catalog = loadCatalog(CATALOG_PATH);
  assert.equal(catalog.length, 6);
  assert.equal(validate('model-catalog', catalog).valid, true);
  for (const m of catalog) assert.ok(['lento', 'médio', 'rápido'].includes(m.speed));
});

test('T33: refresh offline mantém último catálogo válido (fallback)', async () => {
  const dir = tmp();
  const file = join(dir, 'catalog.json');
  copyFileSync(CATALOG_PATH, file);
  const res = await refresh({ offline: true, path: file });
  assert.equal(res.updated, false);
  assert.equal(res.fallback, true);
  assert.equal(res.catalog.length, 6);
});

test('T33: refresh com fonte de benchmarks atualiza catálogo', async () => {
  const updated = JSON.parse(readFileSync(CATALOG_PATH, 'utf8')).map((m) => ({ ...m, sweBenchVerified: m.sweBenchVerified + 1 }));
  const server = createServer((_req, res) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(updated)); });
  await new Promise((r) => server.listen(0, r));
  const dir = tmp();
  const file = join(dir, 'catalog.json');
  copyFileSync(CATALOG_PATH, file);
  try {
    const res = await refresh({ path: file, url: `http://127.0.0.1:${server.address().port}` });
    assert.equal(res.updated, true);
    assert.equal(res.catalog[0].sweBenchVerified, updated[0].sweBenchVerified);
    assert.ok(readFileSync(`${file}.bak`, 'utf8').includes('sweBenchVerified'));
  } finally { server.close(); }
});

test('T33: refresh com fonte fora do schema mantém último catálogo válido', async () => {
  const server = createServer((_req, res) => { res.end('{"nao":"eh array"}'); });
  await new Promise((r) => server.listen(0, r));
  const dir = tmp();
  const file = join(dir, 'catalog.json');
  copyFileSync(CATALOG_PATH, file);
  try {
    const res = await refresh({ path: file, url: `http://127.0.0.1:${server.address().port}` });
    assert.equal(res.updated, false);
    assert.equal(res.fallback, true);
    assert.equal(res.catalog.length, 6);
  } finally { server.close(); }
});
