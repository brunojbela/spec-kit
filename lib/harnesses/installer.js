import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { layoutOf } from './registry.js';
import { installSquad } from '../generators/squad.js';
import { installSkills } from '../generators/skills.js';
import { HOOK_EVENTS } from '../hooks/matrix.js';
import { specCommands } from '../commands-def.js';

const PACK_ROOT = join(import.meta.dirname, '..', '..');

function hookCommand(harness, hookId, dir) {
  return `node ${PACK_ROOT}/lib/hooks/run.js ${hookId} --harness ${harness} --dir ${dir}`;
}

function mergeJson(file, patch) {
  mkdirSync(dirname(file), { recursive: true });
  let cur = {};
  if (existsSync(file)) { try { cur = JSON.parse(readFileSync(file, 'utf8')); } catch { cur = {}; } }
  const merged = deepMerge(cur, patch);
  writeFileSync(file, JSON.stringify(merged, null, 2) + '\n');
  return file;
}

function deepMerge(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const out = { ...a };
    for (const k of Object.keys(b)) out[k] = k in a ? deepMerge(a[k], b[k]) : b[k];
    return out;
  }
  return b;
}

function installCommandsClaudeLike(dir, layout, prefix) {
  const files = [];
  for (const c of specCommands()) {
    const f = join(dir, layout.commands, `${prefix}${c.slug}.md`);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, `---\ndescription: ${c.description}\n---\n\nRode o comando canônico do spec-kit: \`${c.signature}\` (behavior: ${c.behavior}). Use os hooks/pipeline instalados.\n`);
    files.push(f);
  }
  return files;
}

function installCommandsToml(dir, layout) {
  const files = [];
  for (const c of specCommands()) {
    const f = join(dir, layout.commands, `spec-kit-${c.slug}.toml`);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, `prompt = """\nRode o comando canônico: ${c.signature}\n${c.behavior}\n"""\ndescription = "${c.description}"\n`);
    files.push(f);
  }
  return files;
}

function pluginTs(harness) {
  const events = HOOK_EVENTS[harness];
  return `import type { Plugin } from "@opencode-ai/plugin";\n\n// spec-kit hooks (adapter ${harness}) — delega para o dispatcher canônico.\nconst run = (hook: string) => async () => {\n  const { execFileSync } = await import("node:child_process");\n  try { execFileSync("node", [${JSON.stringify(join(PACK_ROOT, 'lib/hooks/run.js'))}, hook, "--harness", ${JSON.stringify(harness)}, "--dir", process.cwd()], { stdio: "inherit" }); }\n  catch (e) { if ((e as any)?.status === 2) throw new Error("spec-kit: " + hook + " bloqueou a operação"); }\n};\n\nexport const SpecKitPlugin: Plugin = async () => ({\n${events.map((e) => `  // ${e.hook} → ${e.event}`).join('\n')}\n  event: async ({ event }) => {\n    const map: Record<string, string> = ${JSON.stringify(Object.fromEntries(events.map((e) => [e.event, e.hook])), null, 2)};\n    const hook = map[event.type];\n    if (hook) await run(hook)();\n  },\n});\n`;
}

export function installHooks({ dir, harness, home = homedir() }) {
  const layout = layoutOf(harness);
  const events = HOOK_EVENTS[harness];
  const written = [];
  const expand = (p) => p.startsWith('~') ? join(home, p.slice(2)) : join(dir, p);

  if (layout.hooksStyle === 'plugins') {
    const f = join(dir, layout.hooksPath, 'spec-kit.ts');
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, pluginTs(harness));
    written.push(f);
    return written;
  }

  if (layout.hooksStyle === 'settings') {
    const hooks = {};
    for (const e of events) {
      const entry = { type: 'command', command: hookCommand(harness, e.hook, dir) };
      const group = e.matcher ? { matcher: e.matcher, hooks: [entry] } : { hooks: [entry] };
      (hooks[e.event] ??= []).push(group);
    }
    written.push(mergeJson(expand(layout.hooksPath), { hooks }));
    return written;
  }

  if (layout.hooksStyle === 'hooks-json') {
    if (harness === 'cursor') {
      const hooks = { version: 1 };
      const inner = {};
      for (const e of events) {
        const cmd = { command: hookCommand(harness, e.hook, dir), ...(e.matcher ? { matcher: e.matcher } : {}) };
        (inner[e.event] ??= []).push(cmd);
      }
      hooks.hooks = inner;
      written.push(mergeJson(join(dir, layout.hooksPath), hooks));
      return written;
    }
    // codex: eventos no root { SessionStart: [{hooks:[{type:command,command}]}] }
    const hooks = {};
    for (const e of events) {
      const entry = { type: 'command', command: hookCommand(harness, e.hook, dir) };
      (hooks[e.event] ??= []).push({ hooks: [entry] });
    }
    written.push(mergeJson(join(dir, layout.hooksPath), hooks));
    return written;
  }

  // plugin-hooks (família antigravity): hooks.json no caminho do plugin
  const hooks = {};
  for (const e of events) {
    const entry = { type: 'command', command: hookCommand(harness, e.hook, dir) };
    const group = e.matcher ? { matcher: e.matcher, hooks: [entry] } : { hooks: [entry] };
    (hooks[e.event] ??= []).push(group);
  }
  const f = layout.hooksPath.startsWith('~') ? join(dir, '.agents/plugins/spec-kit/hooks.json') : expand(layout.hooksPath);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify({ plugin: 'spec-kit', harness, hooks }, null, 2) + '\n');
  written.push(f);
  return written;
}

export function installCommands({ dir, harness }) {
  const layout = layoutOf(harness);
  if (!layout.commands) return [];
  if (harness === 'gemini-cli') return installCommandsToml(dir, layout);
  if (harness === 'opencode') return installCommandsClaudeLike(dir, layout, 'spec-kit-');
  if (harness === 'claude-code') return installCommandsClaudeLike(dir, layout, 'spec-kit-');
  if (harness === 'codex') return installCommandsClaudeLike(dir, layout, 'spec-kit-');
  return [];
}

export function installAdapter({ dir, harness, stack, home = homedir() }) {
  const files = [
    ...installSquad({ stack, dir, harnesses: [harness] }).written,
    ...installSkills({ stack, dir, harnesses: [harness] }).written,
    ...installCommands({ dir, harness }),
    ...installHooks({ dir, harness, home }),
  ];
  if (harness === 'cursor') {
    const rules = join(dir, '.cursor/rules/spec-kit.mdc');
    mkdirSync(dirname(rules), { recursive: true });
    writeFileSync(rules, `---\ndescription: spec-kit SDD — squad, governança e gates\nalwaysApply: true\n---\n\nEste projeto usa spec-kit: siga AGENTS.md, docs/PRD.json, gates security-gate e docs-check.\n`);
    files.push(rules);
  }
  return files;
}
