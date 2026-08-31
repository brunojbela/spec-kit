import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHookInput, blockOutput, contextOutput, continueDecision, toNativeModel, parseUsage, isAgentError, HEADLESS, IN_CHAT_RALPH, MAX_BY_DIFFICULTY } from '../lib/harness-payloads.js';

test('normalize: claude PreToolUse Write → file + session nativa', () => {
  const c = normalizeHookInput('claude-code', { session_id: 's-1', hook_event_name: 'PreToolUse', tool_name: 'Write', tool_input: { file_path: 'src/a.ts' } });
  assert.equal(c.native_session_id, 's-1');
  assert.deepEqual(c.files, ['src/a.ts']);
});

test('normalize: cursor afterFileEdit → file_path + conversation_id', () => {
  const c = normalizeHookInput('cursor', { conversation_id: 'conv-1', hook_event_name: 'afterFileEdit', file_path: '/abs/b.tsx' });
  assert.equal(c.native_session_id, 'conv-1');
  assert.deepEqual(c.files, ['/abs/b.tsx']);
});

test('normalize: antigravity camelCase (conversationId, toolCall.args.TargetFile/CommandLine, modelName)', () => {
  const c = normalizeHookInput('antigravity-2.0', { conversationId: 'ec-1', toolCall: { name: 'write_to_file', args: { TargetFile: '/ws/x.php' } }, modelName: 'gemini-3.6-flash-medium' });
  assert.equal(c.native_session_id, 'ec-1');
  assert.deepEqual(c.files, ['/ws/x.php']);
  assert.equal(c.model_name, 'gemini-3.6-flash-medium');
  const cmd = normalizeHookInput('antigravity-cli (agy)', { conversationId: 'c2', toolCall: { name: 'run_command', args: { CommandLine: 'npm test' } } });
  assert.equal(cmd.command, 'npm test');
});

test('normalize: opencode event bus (properties.sessionID/file.path)', () => {
  const c = normalizeHookInput('opencode', { type: 'file.edited', properties: { sessionID: 'ses-1', file: { path: 'src/c.js' } } });
  assert.equal(c.native_session_id, 'ses-1');
  assert.deepEqual(c.files, ['src/c.js']);
});

test('blockOutput: formatos nativos corretos', () => {
  assert.match(JSON.parse(blockOutput('claude-code', 'XSS!').stdout).hookSpecificOutput.permissionDecision, /deny/);
  assert.equal(JSON.parse(blockOutput('cursor', 'XSS!').stdout).permission, 'deny');
  assert.equal(JSON.parse(blockOutput('gemini-cli', 'XSS!').stdout).decision, 'deny');
  assert.equal(JSON.parse(blockOutput('antigravity-2.0', 'XSS!').stdout).decision, 'deny');
  assert.equal(blockOutput('opencode', 'XSS!').exitCode, 2);
  assert.equal(blockOutput('codex', 'XSS!').exitCode, 2);
});

test('contextOutput: additionalContext (claude/gemini), additional_context (cursor), injectSteps (av)', () => {
  assert.match(JSON.parse(contextOutput('claude-code', 'SessionStart', 'ctx').stdout).hookSpecificOutput.additionalContext, /ctx/);
  assert.match(JSON.parse(contextOutput('cursor', 'x', 'ctx').stdout).additional_context, /ctx/);
  assert.equal(JSON.parse(contextOutput('antigravity-2.0', 'PreInvocation', 'ctx').stdout).injectSteps[0].ephemeralMessage, 'ctx');
});

test('continueDecision: Ralph in-chat por harness', () => {
  assert.equal(JSON.parse(continueDecision('claude-code', { iteration: 1, max: 5, reason: 'docs' }).stdout).decision, 'block');
  assert.match(JSON.parse(continueDecision('cursor', { iteration: 1, max: 5, reason: 'docs' }).stdout).followup_message, /ralph 1\/5/);
  assert.equal(JSON.parse(continueDecision('gemini-cli', { iteration: 1, max: 5, reason: 'd' }).stdout).decision, 'deny');
  assert.equal(JSON.parse(continueDecision('antigravity-2.0', { iteration: 2, max: 5, reason: 'd' }).stdout).decision, 'continue');
  assert.equal(continueDecision('opencode', { iteration: 1, max: 5, reason: 'd' }).exitCode, 2);
});

test('toNativeModel: claude alias, opencode provider/model, gemini só gemini, agy slug direto', () => {
  assert.equal(toNativeModel('claude-code', 'claude-opus-4-8'), 'opus');
  assert.equal(toNativeModel('claude-code', 'claude-haiku-4-5'), 'haiku');
  assert.equal(toNativeModel('opencode', 'claude-sonnet-4-6'), 'anthropic/claude-sonnet-4-6');
  assert.equal(toNativeModel('opencode', 'anthropic/claude-sonnet-4-6'), 'anthropic/claude-sonnet-4-6');
  assert.equal(toNativeModel('gemini-cli', 'claude-opus-4-8'), null);
  assert.equal(toNativeModel('gemini-cli', 'gemini-3-pro-preview'), 'gemini-3-pro-preview');
  assert.equal(toNativeModel('antigravity-cli (agy)', 'claude-sonnet-4-6'), 'claude-sonnet-4-6');
});

test('parseUsage: envelope agy, json claude, JSONL codex', () => {
  const agy = parseUsage('antigravity-cli (agy)', JSON.stringify({ status: 'SUCCESS', usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 } }));
  assert.equal(agy.total, 150);
  const cl = parseUsage('claude-code', JSON.stringify({ usage: { input_tokens: 10, output_tokens: 5 }, total_cost_usd: 0.02 }));
  assert.equal(cl.total, 15);
  assert.equal(cl.costUsd, 0.02);
  const cx = parseUsage('codex', '{"msg":"a"}\n{"msg":"b","usage":{"input_tokens":7,"output_tokens":3,"total_tokens":10}}');
  assert.equal(cx.total, 10);
  assert.equal(parseUsage('cursor', JSON.stringify({ is_error: false, result: 'ok' })), null);
});

test('isAgentError: auth/modelo/status ERROR ≠ teste vermelho', () => {
  assert.equal(isAgentError('antigravity-cli (agy)', { stdout: JSON.stringify({ status: 'ERROR', error: 'authentication required' }) }), true);
  assert.equal(isAgentError('antigravity-cli (agy)', { stdout: '{"status":"SUCCESS","response":"ok"}' }), false);
  assert.equal(isAgentError('claude-code', { stdout: '{"is_error":true}' }), true);
  assert.equal(isAgentError('codex', { stderr: 'command not found: codex' }), true);
  assert.equal(isAgentError('claude-code', { stdout: 'invalid model selection' }), true);
});

test('HEADLESS: 6 runners reais + 2 sem headless com fallback agy→gemini', () => {
  for (const h of ['opencode', 'claude-code', 'cursor', 'codex', 'gemini-cli', 'antigravity-cli (agy)']) {
    assert.ok(HEADLESS[h].bins.length, h);
    assert.ok(HEADLESS[h].args('m', 't').length > 0, h + ' args');
  }
  for (const h of ['antigravity-2.0', 'antigravity-ide']) {
    assert.equal(HEADLESS[h].headless, false);
    assert.deepEqual(HEADLESS[h].fallbackTo, ['antigravity-cli (agy)', 'gemini-cli']);
  }
});

test('IN_CHAT_RALPH: só opencode não tem evento de continue', () => {
  assert.equal(IN_CHAT_RALPH.opencode, null);
  for (const h of ['claude-code', 'cursor', 'gemini-cli', 'antigravity-2.0', 'antigravity-ide', 'antigravity-cli (agy)']) assert.ok(IN_CHAT_RALPH[h]);
});

test('MAX_BY_DIFFICULTY: trivial/fácil→3, médio→4, dif/extremo→5', () => {
  assert.deepEqual(MAX_BY_DIFFICULTY, { trivial: 3, 'fácil': 3, 'médio': 4, 'difícil': 5, 'extremamente difícil': 5 });
});
