import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { generateRalphScripts, ralphScript } from '../lib/ralph.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'ralph-'));

test('T30: gera um .sh por task do PRD com PLAN→ACT→EVALUATE→TERMINATE e max 5', () => {
  const dir = tmp();
  const prdPath = join(dir, 'PRD.json');
  writeFileSync(prdPath, JSON.stringify({ tasks: [{ id: 'T01' }, { id: 'T02' }] }));
  const files = generateRalphScripts({ prdPath, dir });
  assert.equal(files.length, 2);
  const sh = readFileSync(files[0], 'utf8');
  for (const phase of ['PLAN', 'ACT', 'EVALUATE', 'TERMINATE']) assert.ok(sh.includes(phase), phase);
  assert.match(sh, /MAX=5/);
  assert.match(sh, /T01/);
});

test('T30: task que falha 2x e passa na 3ª → concluída na iteração 3', () => {
  const dir = tmp();
  const prdPath = join(dir, 'PRD.json');
  const prd = {
    metadata: { project: 'x', version: '0', owner: 'o', createdAt: '2026', status: 's' },
    sharedContext: { objetivo: 'o', principios: ['p'] },
    features: [{ id: 'F01', name: 'n', goal: 'g' }],
    tasks: [{ id: 'T01', feature: 'F01', what: 'implementar regra', why: 'por que', acceptanceCriteria: 'criterio valido', difficulty: 'médio', model: 'm', dependsOn: [], status: 'pendente' }],
  };
  writeFileSync(prdPath, JSON.stringify(prd));
  writeFileSync(prdPath.replace('.json', '.md'), '# x');
  const [script] = generateRalphScripts({ prdPath, dir });
  // contador de tentativas: falha nas 2 primeiras, verde na 3ª
  const counter = join(dir, 'n');
  const testCmd = `n=$(cat ${counter} 2>/dev/null || echo 0); n=$((n+1)); echo $n > ${counter}; [ $n -ge 3 ]`;
  execFileSync('bash', [script], { cwd: dir, env: { ...process.env, TEST_CMD: testCmd, AGENT_CMD: 'echo act' } });
  const log = readFileSync(join(dir, '.spec-kit/ralph/T01.log'), 'utf8');
  assert.match(log, /testes verdes na iteracao 3/);
  assert.equal(JSON.parse(readFileSync(prdPath, 'utf8')).tasks[0].status, 'concluída');
});

test('T30: task que nunca passa → exit 1 e task bloqueada após MAX', () => {
  const dir = tmp();
  const prdPath = join(dir, 'PRD.json');
  writeFileSync(prdPath, JSON.stringify({ tasks: [{ id: 'T09' }] }));
  const [script] = generateRalphScripts({ prdPath, dir });
  assert.throws(() => execFileSync('bash', [script], { cwd: dir, env: { ...process.env, TEST_CMD: 'false', AGENT_CMD: 'true' } }));
  const log = readFileSync(join(dir, '.spec-kit/ralph/T09.log'), 'utf8');
  assert.equal((log.match(/iteracao/g) || []).length, 5);
  assert.match(log, /MAX_ITERS atingido/);
});
