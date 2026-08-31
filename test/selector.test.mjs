import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moveCursor, toggleAt, toggleAll, render, selectHarnesses } from '../lib/harness-selector.js';
import { HARNESS_IDS } from '../lib/harnesses/registry.js';

const st = { items: HARNESS_IDS, selected: [0, 1], cursor: 3, message: 'sel' };

test('moveCursor: wrap nas duas pontas', () => {
  assert.equal(moveCursor(st, +1).cursor, 4);
  assert.equal(moveCursor({ ...st, cursor: 0 }, -1).cursor, HARNESS_IDS.length - 1);
  assert.equal(moveCursor({ ...st, cursor: HARNESS_IDS.length - 1 }, +1).cursor, 0);
});

test('toggleAt: adicionar e remover seleção', () => {
  const added = toggleAt(st);
  assert.ok(added.selected.includes(3));
  const removed = toggleAt(added);
  assert.ok(!removed.selected.includes(3));
});

test('toggleAll: todos ↔ nenhum', () => {
  const all = toggleAll(st);
  assert.equal(all.selected.length, HARNESS_IDS.length);
  assert.equal(toggleAll(all).selected.length, 0);
});

test('render: mostra marcações e itens', () => {
  const out = render(st);
  assert.match(out, /\[x\] opencode/);
  assert.match(out, /\[ \] cursor/);
});

test('seletor não-TTY → retorna todos sem travar', async () => {
  const fakeIn = { isTTY: false };
  assert.deepEqual(await selectHarnesses({ input: fakeIn, output: process.stdout }), HARNESS_IDS);
});
