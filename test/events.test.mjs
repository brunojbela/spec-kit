import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkContract, emitEvent, on, readEvents, EVENT_CONTRACTS } from '../lib/events.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'events-'));

test('T15: contratos definem os 4 events canônicos', () => {
  assert.deepEqual(Object.keys(EVENT_CONTRACTS).sort(), ['change.recorded', 'project.instantiated', 'security.violation', 'session.started']);
});

test('T15: checkContract rejeita payload sem campos obrigatórios', () => {
  assert.throws(() => checkContract('change.recorded', { session_id: 's' }), /campos obrigatórios/);
  assert.equal(checkContract('security.violation', { item: 'XSS', severity: 'alta', file: 'a.js' }), true);
});

test('T15: emitEvent grava EVENTS.jsonl e dispara consumers', () => {
  const dir = tmp();
  const got = [];
  on('project.instantiated', (r) => got.push(r));
  const rec = emitEvent(dir, 'project.instantiated', { stack: ['laravel'], squad: ['po'] });
  assert.equal(rec.event, 'project.instantiated');
  assert.equal(got.length, 1);
  const lines = readEvents(dir);
  assert.equal(lines.at(-1).squad.join(','), 'po');
});

test('T15: evento desconhecido lança', () => {
  assert.throws(() => emitEvent(tmp(), 'nao.existe', {}), /desconhecido/);
});
