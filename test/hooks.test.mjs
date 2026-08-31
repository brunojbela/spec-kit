import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ensureSession, getSession, classifyProject } from '../lib/session.js';
import { nativeEvent } from '../lib/hooks/matrix.js';

const ROOT = join(import.meta.dirname, '..');
const RUN = join(ROOT, 'lib/hooks/run.js');
const tmp = () => mkdtempSync(join(tmpdir(), 'hooks-'));

function hook(hookId, args = [], input) {
  return execFileSync('node', [RUN, hookId, ...args], { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

test('T17: session_id estável entre harnesses (começa claude, retoma opencode)', () => {
  const dir = tmp();
  const s1 = ensureSession(dir, { harness: 'claude-code' });
  const s2 = ensureSession(dir, { harness: 'opencode' });
  assert.equal(s1.session_id, s2.session_id);
  assert.equal(s2.harness, 'opencode');
  assert.ok(s2.resumedAt);
});

test('T17: classify — vazio=init, código sem docs=analyze, docs+agents=sync', () => {
  assert.equal(classifyProject(tmp()), 'init');
  const legacy = tmp();
  mkdirSync(join(legacy, 'src'), { recursive: true });
  writeFileSync(join(legacy, 'package.json'), '{"name":"x"}');
  writeFileSync(join(legacy, 'src/a.js'), 'export function a(){}');
  assert.equal(classifyProject(legacy), 'analyze');
  mkdirSync(join(legacy, 'docs'), { recursive: true });
  writeFileSync(join(legacy, 'AGENTS.md'), '# x');
  writeFileSync(join(legacy, 'docs/PRD.json'), '{}');
  assert.equal(classifyProject(legacy), 'sync');
});

test('T14: hook session.classify — claude recebe additionalContext nativo; metadata JSON p/ demais', () => {
  const dirC = tmp();
  const outC = JSON.parse(hook('session.classify', ['--harness', 'claude-code', '--dir', dirC]));
  assert.match(outC.hookSpecificOutput.additionalContext, /modo=init/);
  assert.equal(outC.hookSpecificOutput.hookEventName, 'SessionStart');
  const dir = tmp();
  const out = JSON.parse(hook('session.classify', ['--harness', 'opencode', '--dir', dir]));
  assert.equal(out.hook, 'session.classify');
  assert.ok(out.session_id);
  assert.equal(out.mode, 'init');
  const events = readFileSync(join(dir, 'docs/EVENTS.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(events.at(-1).event, 'session.started');
});

test('T14: hook security-gate responde no FORMATO nativo do harness', () => {
  const dir = tmp();
  mkdirSync(join(dir, 'docs'), { recursive: true });
  // claude: permissionDecision deny com reason (não exit 2)
  const claudeOut = execFileSync('node', [RUN, 'security-gate', '--harness', 'claude-code', '--dir', dir], {
    encoding: 'utf8', input: JSON.stringify({ session_id: 'c-123', tool_name: 'Write', tool_input: { file_path: 'x.js' }, content: 'el.innerHTML = evil;' }),
  });
  const dec = JSON.parse(claudeOut);
  assert.equal(dec.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(dec.hookSpecificOutput.permissionDecisionReason, /XSS/);
  // cursor: {permission:"deny", agent_message}
  const curOut = execFileSync('node', [RUN, 'security-gate', '--harness', 'cursor', '--dir', dir], {
    encoding: 'utf8', input: JSON.stringify({ conversation_id: 'conv-9', tool_name: 'Write', tool_input: { file_path: 'x.js' }, content: 'el.innerHTML = evil;' }),
  });
  assert.equal(JSON.parse(curOut).permission, 'deny');
  // native_session_id no ledger via payload nativo claude
  const ledIn = JSON.stringify({ session_id: 'c-123', task_id: 'T01', tool_name: 'Edit', tool_input: { file_path: 'src/a.js' } });
  hook('ledger-record', ['--harness', 'claude-code', '--dir', dir, '--task', 'T01'], ledIn);
  const led = JSON.parse(readFileSync(join(dir, 'docs/ORCHESTRATION.json'), 'utf8'));
  assert.equal(led.entries.at(-1).native_session_id, 'c-123');
});

test('T14: docs-check emite continue in-chat por harness (claude block / gemini deny+reason / av continue)', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'DOC_SYNC.json'), JSON.stringify({ project: 'p', generatedAt: 'x', items: [{ id: 'd1', module: 'm', kind: 'technical', status: 'pendente' }] }));
  const cl = execFileSync('node', [RUN, 'docs-check', '--harness', 'claude-code', '--dir', dir], { encoding: 'utf8' });
  assert.equal(JSON.parse(cl).decision, 'block');
  const av = execFileSync('node', [RUN, 'docs-check', '--harness', 'antigravity-2.0', '--dir', dir], { encoding: 'utf8' });
  assert.equal(JSON.parse(av).decision, 'continue');
  const gm = execFileSync('node', [RUN, 'docs-check', '--harness', 'gemini-cli', '--dir', dir], { encoding: 'utf8' });
  assert.equal(JSON.parse(gm).decision, 'deny');
});

test('T14: hook personal-interview — first-run pergunta 6 campos; com answers cria AGENTS.md GLOBAL; não repete', () => {
  const dir = tmp();
  const home = tmp();
  const ask = JSON.parse(hook('session.personal-interview', ['--harness', 'opencode', '--dir', dir, '--home', home]));
  assert.equal(ask.ask.length, 6);
  const answers = JSON.stringify(['Ana', 'Jarvis', 'autonomia alta', 'TDD sempre', 'direto pt-BR', 'changelog']);
  const ran = JSON.parse(hook('session.personal-interview', ['--harness', 'opencode', '--dir', dir, '--home', home, '--answers', answers]));
  assert.equal(ran.ran, true);
  assert.ok(readFileSync(join(home, '.config/opencode/AGENTS.md'), 'utf8').includes('Jarvis'));
  const again = JSON.parse(hook('session.personal-interview', ['--harness', 'opencode', '--dir', dir, '--home', home, '--answers', answers]));
  assert.equal(again.ran, false);
});

test('T14: hook ledger-record grava ORCHESTRATION.json+md e emite change.recorded', () => {
  const dir = tmp();
  mkdirSync(join(dir, 'docs'), { recursive: true });
  const payload = JSON.stringify({ task_id: 'T01', tokens: 500, prompts: 2, changes: ['src/a.js'] });
  const out = JSON.parse(hook('ledger-record', ['--harness', 'cursor', '--dir', dir, '--task', 'T01', '--model', 'claude-sonnet-4-6', '--developer', 'dev-junior'], payload));
  assert.equal(out.task_id, 'T01');
  const ledger = JSON.parse(readFileSync(join(dir, 'docs/ORCHESTRATION.json'), 'utf8'));
  assert.equal(ledger.entries.length, 1);
  assert.ok(readFileSync(join(dir, 'docs/ORCHESTRATION.md'), 'utf8').includes('T01'));
});

test('T14: hook security-gate bloqueia (exit 2) com XSS e registra SECURITY_LOG', () => {
  const dir = tmp();
  mkdirSync(join(dir, 'docs'), { recursive: true });
  assert.throws(() => hook('security-gate', ['--dir', dir], JSON.stringify({ content: 'el.innerHTML = userInput;' })), (e) => {
    assert.equal(e.status, 2);
    const log = JSON.parse(readFileSync(join(dir, 'docs/SECURITY_LOG.json'), 'utf8'));
    assert.ok(log.violations.some((v) => v.item.startsWith('XSS')));
    return true;
  });
  const ok = JSON.parse(hook('security-gate', ['--dir', dir], JSON.stringify({ content: 'const x = 1;' })));
  assert.equal(ok.blocked, false);
});

test('T14: hook docs-check falha (exit 2) com itens pendentes; passa com 100%', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'DOC_SYNC.json'), JSON.stringify({ project: 'p', generatedAt: 'x', items: [{ id: 'd1', module: 'm', kind: 'technical', status: 'pendente' }] }));
  assert.throws(() => hook('docs-check', ['--dir', dir]), (e) => { assert.equal(e.status, 2); return true; });
  writeFileSync(join(dir, 'DOC_SYNC.json'), JSON.stringify({ project: 'p', generatedAt: 'x', items: [{ id: 'd1', module: 'm', kind: 'technical', status: 'documentado' }] }));
  assert.match(hook('docs-check', ['--dir', dir]), /"ok":true/);
});

test('T14: hook docs.sync adiciona pendente em arquivo novo e retira removido', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'DOC_SYNC.json'), JSON.stringify({ project: 'p', generatedAt: 'x', items: [{ id: 'd1', module: 'src', file: 'src/a.js', kind: 'technical', status: 'documentado' }] }));
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src/b.js'), 'export function b(){}');
  const out = JSON.parse(hook('docs.sync', ['--dir', dir], JSON.stringify({ changed: ['src/b.js', 'src/a.js'] })));
  assert.ok(out.added >= 1);
  rmSync(join(dir, 'src/b.js'));
  const out2 = JSON.parse(hook('docs.sync', ['--dir', dir], JSON.stringify({ changed: ['src/b.js'] })));
  assert.ok(out2.removed >= 1);
});

test('T14: matriz — nativeEvent cobre todos os 7 hooks por harness e lança se faltar', () => {
  const harnesses = ['opencode', 'claude-code', 'cursor', 'codex', 'gemini-cli', 'antigravity-cli (agy)', 'antigravity-2.0', 'antigravity-ide'];
  for (const h of harnesses) for (const id of ['session.classify', 'security-gate', 'ledger-record', 'docs-check', 'docs.sync', 'session.personal-interview', 'interaction.inject-orchestration']) {
    assert.ok(nativeEvent(h, id).length > 0);
  }
  assert.throws(() => nativeEvent('opencode', 'inexistente'));
});
