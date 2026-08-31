import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { buildProgram } from '../lib/cli.js';

const bin = join(import.meta.dirname, '..', 'bin/spec-kit.js');
const help = execFileSync('node', [bin, '--help'], { encoding: 'utf8' });

test('--help lista os 5 comandos', () => {
  for (const cmd of ['init', 'analyze', 'verify', 'init-projects', 'models']) {
    assert.match(help, new RegExp(`^\\s+${cmd}`, 'm'), `falta comando ${cmd}`);
  }
});

test('--version mostra versão do package', () => {
  const out = execFileSync('node', [bin, '--version'], { encoding: 'utf8' }).trim();
  assert.equal(out, '0.1.0');
});

test('parser: init passa --dir --stack --yes para o handler', async () => {
  const calls = [];
  const program = buildProgram({
    handlers: {
      init: async (o) => calls.push(['init', o]),
      analyze: async (o) => calls.push(['analyze', o]),
      verify: async (o) => calls.push(['verify', o]),
      initProjects: async (o) => calls.push(['init-projects', o]),
      modelsRefresh: async (o) => calls.push(['models-refresh', o]),
    },
  });
  await program.parseAsync(['node', 'spec-kit', 'init', '--dir', '/tmp/x', '--stack', 'laravel,react', '--yes']);
  assert.equal(calls[0][0], 'init');
  assert.equal(calls[0][1].dir, '/tmp/x');
  assert.equal(calls[0][1].stack, 'laravel,react');
  assert.equal(calls[0][1].yes, true);
});

test('parser: analyze captura argumento posicional repo', async () => {
  const calls = [];
  const program = buildProgram({
    handlers: { analyze: async (o) => calls.push(o) },
  });
  await program.parseAsync(['node', 'spec-kit', 'analyze', 'meu-repo']);
  assert.equal(calls[0].repo, 'meu-repo');
});

test('parser: models refresh roteia para modelsRefresh', async () => {
  const calls = [];
  const program = buildProgram({
    handlers: { modelsRefresh: async (o) => calls.push(o) },
  });
  await program.parseAsync(['node', 'spec-kit', 'models', 'refresh', '--offline']);
  assert.equal(calls[0].offline, true);
});

test('comando inexistente sai com código != 0', () => {
  assert.throws(() => execFileSync('node', [bin, 'nao-existe'], { encoding: 'utf8', stdio: 'pipe' }));
});

test('parser: init --harnesses chega como string csv', async () => {
  const calls = [];
  const program = buildProgram({ handlers: { init: async (o) => calls.push(o) } });
  await program.parseAsync(['node', 'spec-kit', 'init', '--stack', 'laravel', '--harnesses', 'opencode,claude-code']);
  assert.equal(calls[0].harnesses, 'opencode,claude-code');
});
