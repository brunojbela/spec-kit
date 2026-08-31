import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { generateRalphScripts, ralphScript } from '../lib/ralph.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'ralph-'));
const T01 = { id: 'T01', what: 'implementar regra', acceptanceCriteria: 'testes verdes', difficulty: 'fácil', model: 'claude-haiku-4-5' };

test('T30: script tem PLAN→ACT→EVALUATE→TERMINATE, MAX por dificuldade e runner do harness', () => {
  const dir = tmp();
  const sh = ralphScript({ task: T01, harness: 'claude-code', prdPath: join(dir, 'PRD.json'), dir });
  for (const phase of ['PLAN', 'ACT', 'EVALUATE', 'TERMINATE']) assert.ok(sh.includes(phase), phase);
  assert.match(sh, /MAX=3/, 'fácil → 3 iterações');
  assert.match(sh, /RUNNER=.*:-claude/);
  assert.match(sh, /'--model' 'haiku'/, 'modelo traduzido p/ alias claude');
});

test('T30: difícil→5, opencode usa provider/model, sem --model p/ gemini quando modelo não-gemini', () => {
  const dir = tmp();
  const hard = { ...T01, difficulty: 'difícil' };
  assert.match(ralphScript({ task: hard, harness: 'claude-code', prdPath: 'x', dir }), /MAX=5/);
  const oc = ralphScript({ task: { ...T01, model: 'claude-sonnet-4-6' }, harness: 'opencode', prdPath: 'x', dir });
  assert.match(oc, /'anthropic\/claude-sonnet-4-6'/);
  const gm = ralphScript({ task: { ...T01, model: 'claude-opus-4-8' }, harness: 'gemini-cli', prdPath: 'x', dir });
  assert.ok(!gm.includes("'--model' 'claude-opus-4-8'"), 'gemini não deve receber modelo não-gemini');
});

test('T30: antigravity 2.0 SINALIZA sem headless + gera variantes agy/gemini + exit 3', () => {
  const dir = tmp();
  const prdPath = join(dir, 'PRD.json');
  writeFileSync(prdPath, JSON.stringify({ tasks: [T01] }));
  const [sh] = generateRalphScripts({ prdPath, dir, harness: 'antigravity-2.0' });
  const script = readFileSync(sh, 'utf8');
  assert.match(script, /NÃO expõe CLI headless|sem CLI headless/);
  assert.match(script, /Ralph.*melhor opção/, 'sinaliza que Ralph seria a melhor opção');
  assert.match(script, /agy/, 'fallback agy');
  assert.match(script, /decision:continue|Ralph IN-CHAT/, 'alternativa in-chat');
  assert.match(script, /exit 3/);
  assert.ok(readFileSync(join(dir, '.spec-kit/ralph/T01.ralph'), 'utf8').includes('agy'));
  assert.ok(readFileSync(join(dir, '.spec-kit/ralph/T01.gemini'), 'utf8').includes('gemini'));
});

test('T30: task que falha 2x e passa na 3ª (AGENT_CMD fake) → concluída + usage no ledger', () => {
  const dir = tmp();
  const prdPath = join(dir, 'PRD.json');
  const prd = {
    metadata: { project: 'x', version: '0', owner: 'o', createdAt: '2026', status: 's' },
    sharedContext: { objetivo: 'o', principios: ['p'] },
    features: [{ id: 'F01', name: 'n', goal: 'g' }],
    tasks: [{ ...T01, feature: 'F01', why: 'por que existe', dependsOn: [], status: 'pendente' }],
  };
  writeFileSync(prdPath, JSON.stringify(prd));
  writeFileSync(prdPath.replace('.json', '.md'), '# x');
  const [script] = generateRalphScripts({ prdPath, dir, harness: 'claude-code' });
  const counter = join(dir, 'n');
  const testCmd = `n=$(cat ${counter} 2>/dev/null || echo 0); n=$((n+1)); echo $n > ${counter}; [ $n -ge 3 ]`;
  execFileSync('bash', [script], { cwd: dir, env: { ...process.env, TEST_CMD: testCmd, AGENT_CMD: 'cat > /dev/null; echo hi' } });
  assert.match(readFileSync(join(dir, '.spec-kit/ralph/T01.log'), 'utf8'), /verdes na iteracao 3/);
  assert.equal(JSON.parse(readFileSync(prdPath, 'utf8')).tasks[0].status, 'concluída');
});

test('T30: erro do AGENTE (auth) aborta cedo sem queimar iterações (exit 4)', () => {
  const dir = tmp();
  const prdPath = join(dir, 'PRD.json');
  writeFileSync(prdPath, JSON.stringify({ tasks: [T01] }));
  const [script] = generateRalphScripts({ prdPath, dir, harness: 'antigravity-cli (agy)' });
  // RUNNER_BIN fake que simula CLI sem auth → isAgentError deve abortar cedo
  const fake = join(dir, 'fake-agy.sh');
  writeFileSync(fake, '#!/bin/sh\necho "authentication required" >&2\nexit 1\n');
  chmodSync(fake, 0o755);
  let code = 0;
  try { execFileSync('bash', [script], { cwd: dir, env: { ...process.env, AGENT_CMD: '', RUNNER_BIN: fake, TEST_CMD: 'false' }, stdio: 'pipe' }); }
  catch (e) { code = e.status; }
  assert.equal(code, 4, 'deve abortar como erro de agente, não esgotar iterações');
  assert.match(readFileSync(join(dir, '.spec-kit/ralph/T01.log'), 'utf8'), /ERRO DO AGENTE/);
});

test('T30: MAX atingido (teste sempre vermelho, agente ok) → bloqueada, exit 1', () => {
  const dir = tmp();
  const prdPath = join(dir, 'PRD.json');
  const prd = {
    metadata: { project: 'x', version: '0', owner: 'o', createdAt: '2026', status: 's' },
    sharedContext: { objetivo: 'o', principios: ['p'] },
    features: [{ id: 'F01', name: 'n', goal: 'g' }],
    tasks: [{ ...T01, feature: 'F01', why: 'por que existe', difficulty: 'difícil', dependsOn: [], status: 'pendente' }],
  };
  writeFileSync(prdPath, JSON.stringify(prd));
  writeFileSync(prdPath.replace('.json', '.md'), '# x');
  const [script] = generateRalphScripts({ prdPath, dir, harness: 'claude-code' });
  assert.throws(() => execFileSync('bash', [script], { cwd: dir, env: { ...process.env, AGENT_CMD: 'true', TEST_CMD: 'false' } }));
  const log = readFileSync(join(dir, '.spec-kit/ralph/T01.log'), 'utf8');
  assert.equal((log.match(/iteracao/g) || []).length, 5);
  assert.match(log, /MAX_ITERS/);
  assert.equal(JSON.parse(readFileSync(prdPath, 'utf8')).tasks[0].status, 'bloqueada');
});
