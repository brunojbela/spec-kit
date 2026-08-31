import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ask } from '../lib/prompt.js';

test('ask: não-TTY retorna vazio sem travar', async () => {
  assert.equal(await ask('? ', { input: { isTTY: false } }), '');
});
