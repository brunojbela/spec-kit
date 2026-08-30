import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DOCS = join(import.meta.dirname, '..', 'docs');

function allMds(dir, base = dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) allMds(full, base, acc);
    else if (e.endsWith('.md')) acc.push('/' + full.slice(base.length + 1));
  }
  return acc;
}

test('T32: _sidebar linka todos os mds do site (agents, skills, fundamentos, PRD, README)', () => {
  const sidebar = readFileSync(join(DOCS, '_sidebar.md'), 'utf8');
  const readme = existsSync(join(DOCS, 'README.md')) ? readFileSync(join(DOCS, 'README.md'), 'utf8') : '';
  const mds = allMds(DOCS).filter((m) => !m.startsWith('/technical/') && !m.startsWith('/functional/') && m !== '/_sidebar.md');
  const missing = mds.filter((m) => !sidebar.includes(`(${m.slice(1)})`) && !readme.includes(`(${m.slice(1)})`) && !readme.includes(m.slice(1)));
  assert.deepEqual(missing, [], `sem link: ${missing.join(', ')}`);
});

test('T32: todos os links do sidebar resolvem para arquivos existentes', () => {
  const sidebar = readFileSync(join(DOCS, '_sidebar.md'), 'utf8');
  const links = [...sidebar.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
  assert.ok(links.length >= 62, `esperados >=62 links, encontrados ${links.length}`);
  for (const l of links) assert.ok(existsSync(join(DOCS, l)), `broken: ${l}`);
});

test('T32: index.html carrega sidebar', () => {
  const html = readFileSync(join(DOCS, 'index.html'), 'utf8');
  assert.match(html, /loadSidebar\s*:\s*true/);
});
