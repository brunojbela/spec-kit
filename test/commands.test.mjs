import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { run as initRun } from '../lib/commands/init.js';
import { analyze } from '../lib/commands/analyze.js';
import { verify } from '../lib/commands/verify.js';
import { validate } from '../lib/schemas.js';

const BIN = join(import.meta.dirname, '..', 'bin/spec-kit.js');
const tmp = () => mkdtempSync(join(tmpdir(), 'cmd-'));

test('T16: spec-kit init cria AGENTS.md + PRD.json válido + squad + DOC_SYNC + events', async () => {
  const dir = tmp();
  const res = await initRun({ dir, stack: 'laravel,react' });
  assert.equal(res.prd.metadata.project, dir.split('/').pop());
  assert.equal(validate('prd', JSON.parse(readFileSync(join(dir, 'docs/PRD.json'), 'utf8'))).valid, true);
  assert.ok(existsSync(join(dir, 'AGENTS.md')));
  assert.ok(existsSync(join(dir, 'docs/PRD.md')));
  assert.ok(existsSync(join(dir, 'PROJECT_CONTEXT.json')));
  assert.ok(existsSync(join(dir, 'docs/ORCHESTRATION.json')));
  assert.ok(existsSync(join(dir, 'docs/SECURITY_LOG.json')));
  assert.ok(existsSync(join(dir, 'DOC_SYNC.json')));
  assert.ok(existsSync(join(dir, '.opencode/agents/po.md')));
  assert.ok(readFileSync(join(dir, 'docs/EVENTS.jsonl'), 'utf8').includes('project.instantiated'));
});

test('T16: init sem stack pede entrevista (erro claro)', async () => {
  await assert.rejects(() => initRun({ dir: tmp(), stack: '' }), /entrevista/);
});

test('T16: spec-kit analyze em legado gera DOC_SYNC + char-tests mock', () => {
  const dir = tmp();
  mkdirSync(join(dir, 'app/Domain/User'), { recursive: true });
  writeFileSync(join(dir, 'composer.json'), JSON.stringify({ require: { 'laravel/framework': '^13.0' } }));
  writeFileSync(join(dir, 'app/Domain/User/User.php'), '<?php\nuse Illuminate\\Support\\Str;\nclass User {\n  public function create($data) { return $data; }\n  private function hash($pwd) { return $pwd; }\n}');
  const res = analyze({ dir });
  assert.ok(res.docSyncItems >= 3);
  assert.ok(res.charTestModules.length >= 1);
  const ct = readFileSync(join(dir, 'test/characterization', `${res.charTestModules[0].replace(/\W/g, '_')}.test.mjs`), 'utf8');
  assert.match(ct, /caracteriza/);
  const doc = JSON.parse(readFileSync(join(dir, 'DOC_SYNC.json'), 'utf8'));
  assert.ok(doc.items.some((i) => i.class === 'User' && i.method === 'create'));
  assert.ok(doc.items.some((i) => i.imports?.includes('Illuminate\\Support\\Str')));
});

test('T16: verify ok após doc-gen 100% (exit 0)', async () => {
  const dir = tmp();
  analyze({ dir });
  const { runDocPipeline } = await import('../lib/doc-gen.js');
  const cov = await runDocPipeline(dir);
  assert.equal(cov.pendente, 0);
  const res = verify({ dir });
  assert.equal(res.ok, true, JSON.stringify(res.gates));
});

test('T16: verify falha com docs pendentes (gate docs-check)', () => {
  const dir = tmp();
  mkdirSync(join(dir, 'app'), { recursive: true });
  writeFileSync(join(dir, 'app/X.php'), '<?php class X { public function y() { return 1; } }');
  analyze({ dir });
  const res = verify({ dir });
  assert.equal(res.ok, false);
  assert.equal(res.gates.docs.ok, false);
  assert.ok(res.gates.docs.pendente > 0);
});

test('T16: verify falha com código vulnerável (exit != 0)', () => {
  const dir = tmp();
  mkdirSync(join(dir, 'app'), { recursive: true });
  writeFileSync(join(dir, 'app/X.php'), '<?php class X { public function y() { return 1; } }');
  analyze({ dir });
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src/evil.php'), "<?php $sql = 'SELECT * FROM t WHERE id = ' . $_GET['id']; exec('ls ' . $input); $api_key = \"zzfixture1234567890abcdef\";");
  const res = verify({ dir });
  assert.equal(res.ok, false);
  assert.equal(res.gates.security.ok, false);
  const log = JSON.parse(readFileSync(join(dir, 'docs/SECURITY_LOG.json'), 'utf8'));
  assert.ok(log.violations.length >= 1);
});

test('T16: spec-kit init-projects gera registry json+md', () => {
  const root = tmp();
  const p1 = join(root, 'proj-a');
  mkdirSync(join(p1, 'docs'), { recursive: true });
  writeFileSync(join(p1, 'package.json'), JSON.stringify({ name: 'a', dependencies: { react: '19' } }));
  writeFileSync(join(p1, 'docs/PRD.json'), '{}');
  writeFileSync(join(p1, 'README.md'), '# a\nProjeto A de teste.');
  const out = execFileSync('node', [BIN, 'init-projects', '--projects-dir', root, '--out', join(root, 'reg.json')], { encoding: 'utf8' });
  assert.ok(existsSync(join(root, 'reg.json')));
  const reg = JSON.parse(readFileSync(join(root, 'reg.json'), 'utf8'));
  assert.equal(reg.projects[0].name, 'proj-a');
  assert.ok(reg.projects[0].stack.includes('react'));
  assert.equal(reg.projects[0].sdd, true);
  assert.ok(existsSync(join(root, 'reg.md')));
});
