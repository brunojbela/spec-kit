import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installAdapter } from '../lib/harnesses/installer.js';
import { HOOK_IDS, HOOK_EVENTS } from '../lib/hooks/matrix.js';

const STACK = ['laravel', 'react'];
const tmp = () => mkdtempSync(join(tmpdir(), 'adapter-'));

function base(harness) {
  const home = mkdtempSync(join(tmpdir(), 'home-'));
  const dir = tmp();
  const files = installAdapter({ dir, harness, stack: STACK, home });
  return { dir, home, files };
}

test('T09 opencode: agents/skills/commands + plugin spec-kit.ts', () => {
  const { dir } = base('opencode');
  assert.ok(existsSync(join(dir, '.opencode/agents/po.md')));
  assert.ok(existsSync(join(dir, '.opencode/skills/laravel/SKILL.md')));
  assert.ok(existsSync(join(dir, '.opencode/commands/spec-kit-init.md')));
  const plugin = readFileSync(join(dir, '.opencode/plugins/spec-kit.ts'), 'utf8');
  assert.match(plugin, /session\.created/);
  assert.match(plugin, /file\.edited/);
  assert.match(plugin, /tool\.execute\.before/);
});

test('T10 claude-code: settings.json com hooks SessionStart/PreToolUse/PostToolUse/UserPromptSubmit/Stop', () => {
  const { dir } = base('claude-code');
  const settings = JSON.parse(readFileSync(join(dir, '.claude/settings.json'), 'utf8'));
  for (const ev of ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'Stop']) {
    assert.ok(settings.hooks[ev], `falta hook ${ev}`);
  }
  const pre = settings.hooks.PreToolUse.find((g) => g.matcher === 'Bash|Write|Edit');
  assert.ok(pre, 'matcher security-gate ausente');
  assert.match(pre.hooks[0].command, /run\.js security-gate/);
  assert.ok(existsSync(join(dir, '.claude/commands/spec-kit-verify.md')));
});

test('T11 cursor: hooks.json v1 + rules mdc + agents', () => {
  const { dir } = base('cursor');
  const hooks = JSON.parse(readFileSync(join(dir, '.cursor/hooks.json'), 'utf8'));
  assert.equal(hooks.version, 1);
  assert.ok(hooks.hooks.sessionStart && hooks.hooks.preToolUse && hooks.hooks.postToolUse && hooks.hooks.beforeSubmitPrompt && hooks.hooks.stop);
  assert.ok(existsSync(join(dir, '.cursor/rules/spec-kit.mdc')));
  assert.ok(existsSync(join(dir, '.cursor/agents/qa.md')));
});

test('T12 codex: .agents/skills + .codex/skills + .codex/hooks.json + AGENTS.md', () => {
  const { dir } = base('codex');
  assert.ok(existsSync(join(dir, '.agents/skills/react/SKILL.md')));
  assert.ok(existsSync(join(dir, '.codex/skills/react/SKILL.md')));
  const hooks = JSON.parse(readFileSync(join(dir, '.codex/hooks.json'), 'utf8'));
  assert.equal(hooks.SessionStart[0].hooks[0].type, 'command');
  assert.match(hooks.SessionStart[0].hooks[0].command, /session\.classify/);
  assert.ok(readFileSync(join(dir, 'AGENTS.md'), 'utf8').includes('Squad spec-kit'));
});

test('T13 gemini-cli: commands toml + GEMINI.md + settings hooks', () => {
  const { dir } = base('gemini-cli');
  assert.ok(existsSync(join(dir, '.gemini/commands/spec-kit-init.toml')));
  assert.ok(readFileSync(join(dir, 'GEMINI.md'), 'utf8').includes('Squad spec-kit'));
  const settings = JSON.parse(readFileSync(join(dir, '.gemini/settings.json'), 'utf8'));
  assert.ok(settings.hooks.SessionStart && settings.hooks.BeforeTool && settings.hooks.AfterTool);
});

test('T13 família antigravity: agy = hooks.json por evento; 2.0/ide = objetos nomeados + plugin.json', () => {
  const { dir: dirAgy } = base('antigravity-cli (agy)');
  const agy = JSON.parse(readFileSync(join(dirAgy, '.agents/plugins/spec-kit/hooks.json'), 'utf8'));
  assert.equal(agy.plugin, 'spec-kit');
  assert.ok(agy.hooks.PreToolUse && agy.hooks.PostToolUse && agy.hooks.SessionStart && agy.hooks.Stop);
  for (const h of ['antigravity-2.0', 'antigravity-ide']) {
    const { dir } = base(h);
    const hooksPath = join(dir, '.agents/plugins/spec-kit/hooks.json');
    assert.ok(existsSync(hooksPath), `${h} sem hooks.json`);
    const cfg = JSON.parse(readFileSync(hooksPath, 'utf8'));
    // schema documentado: objetos nomeados {spec-kit-<hook>:{Evento:[{hooks:[{command,timeout}]}]}}
    assert.ok(cfg['spec-kit-security-gate'].PreToolUse[0].hooks[0].command.includes('security-gate'));
    assert.ok(cfg['spec-kit-interaction.inject-orchestration'].PreInvocation, 'inject via PreInvocation (injectSteps)');
    assert.ok(cfg['spec-kit-docs-check'].Stop, 'docs-check via Stop (decision continue)');
    assert.equal(JSON.parse(readFileSync(join(dir, '.agents/plugins/spec-kit/plugin.json'), 'utf8')).name, 'spec-kit');
  }
});

test('T09 opencode: plugin usa API real tool.execute.before/after + event bus', () => {
  const { dir } = base('opencode');
  const plugin = readFileSync(join(dir, '.opencode/plugins/spec-kit.ts'), 'utf8');
  assert.match(plugin, /tool\.execute\.before/);
  assert.match(plugin, /tool\.execute\.after/);
  assert.match(plugin, /"session\.created"/);
  assert.match(plugin, /"file\.edited"/);
  assert.match(plugin, /"session\.idle"/);
});

test('matriz completa: 7 hooks × 8 harnesses = 56 pares mapeados', () => {
  let n = 0;
  for (const harness of Object.keys(HOOK_EVENTS)) {
    for (const hook of HOOK_IDS) {
      assert.ok(HOOK_EVENTS[harness].some((e) => e.hook === hook), `${hook}×${harness}`);
      n++;
    }
  }
  assert.equal(n, 56);
});
