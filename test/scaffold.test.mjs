import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, accessSync, constants, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');

test('package.json é válido e nome=spec-kit com bin spec-kit', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'spec-kit');
  assert.equal(pkg.bin['spec-kit'], 'bin/spec-kit.js');
  assert.equal(pkg.version, '0.2.0');
});

test('bin/spec-kit.js existe e é executável', () => {
  const bin = join(root, 'bin/spec-kit.js');
  assert.ok(existsSync(bin));
  accessSync(bin, constants.X_OK);
});

test('estrutura de pastas do pack criada', () => {
  for (const dir of ['catalog/agents', 'catalog/skills', 'generators', 'harnesses', 'schemas', 'models', 'mcp-servers', 'bin', 'lib']) {
    assert.ok(existsSync(join(root, dir)), `falta ${dir}`);
  }
});

test('npm pack dry-run ok', () => {
  const out = execFileSync('npm', ['pack', '--dry-run'], { cwd: root, encoding: 'utf8' });
  assert.match(out, /spec-kit/);
});
