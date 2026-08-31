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

// Organismo vivo: update reescreve — remove entradas antigas do kit antes do merge (idempotência).
const isKitEntry = (s) => typeof s === 'string' && s.includes('lib/hooks/run.js');
function stripKitHooks(hooksObj) {
  if (!hooksObj || typeof hooksObj !== 'object') return {};
  const out = {};
  for (const [event, groups] of Object.entries(hooksObj)) {
    if (!Array.isArray(groups)) { out[event] = groups; continue; }
    out[event] = groups
      .map((g) => {
        if (g.hooks && Array.isArray(g.hooks)) {
          const kept = g.hooks.filter((h) => !isKitEntry(h.command));
          return kept.length ? { ...g, hooks: kept } : null;
        }
        return isKitEntry(g.command) ? null : g;
      })
      .filter(Boolean);
    if (!out[event].length) delete out[event];
  }
  return out;
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
  // API real (opencode.ai/docs/plugins): tool.execute.before/after + event bus
  // (session.created, file.edited, session.idle). Bloqueio = throw. Payload nativo via stdin → run.js normaliza.
  return `import type { Plugin } from "@opencode-ai/plugin";

// spec-kit adapter (opencode) — delega p/ dispatcher canônico; payload nativo no stdin.
const { execFileSync } = await import("node:child_process");
const RUN = ${JSON.stringify(join(PACK_ROOT, 'lib/hooks/run.js'))};
const call = (hook: string, payload?: unknown) => {
  try {
    execFileSync("node", [RUN, hook, "--harness", "${harness}", "--dir", process.cwd()], {
      input: JSON.stringify(payload ?? {}), stdio: ["pipe", "pipe", "inherit"],
    });
  } catch (e) {
    throw new Error("spec-kit: " + hook + " bloqueou a operação");
  }
};

export const SpecKitPlugin: Plugin = async () => ({
  "tool.execute.before": async (input, output) => {
    await call("security-gate", { tool_name: input.tool, tool_input: output.args });
    await call("interaction.inject-orchestration", { tool_name: input.tool });
  },
  "tool.execute.after": async (input, output) => {
    await call("ledger-record", { tool_name: input.tool, changes: output?.title ? [String(output.title)] : [] });
  },
  event: async ({ event }) => {
    if (event.type === "session.created") { await call("session.classify", event.properties); await call("session.personal-interview", event.properties); }
    if (event.type === "file.edited") { await call("docs.sync", { changed: [event.properties?.file?.path].filter(Boolean) }); await call("ledger-record", { files: [event.properties?.file?.path].filter(Boolean) }); }
    if (event.type === "session.idle") { await call("docs-check", event.properties); }
  },
});
`;
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
    const file = expand(layout.hooksPath);
    let doc = {};
    try { doc = JSON.parse(readFileSync(file, 'utf8')); } catch { /* novo */ }
    const merged = stripKitHooks(doc.hooks ?? {});
    for (const [ev, groups] of Object.entries(hooks)) (merged[ev] ??= []).push(...groups);
    writeFileSync(file, JSON.stringify({ ...doc, hooks: merged }, null, 2) + '\n');
    written.push(file);
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
      const hf = join(dir, layout.hooksPath);
      let cdoc = {};
      try { cdoc = JSON.parse(readFileSync(hf, 'utf8')); } catch { /* novo */ }
      const cmerged = stripKitHooks(cdoc.hooks ?? {});
      for (const [ev, cmds] of Object.entries(inner)) (cmerged[ev] ??= []).push(...cmds);
      writeFileSync(hf, JSON.stringify({ ...cdoc, version: 1, hooks: cmerged }, null, 2) + '\n');
      written.push(hf);
      return written;
    }
    // codex: eventos no root { SessionStart: [{hooks:[{type:command,command}]}] }
    const hooks = {};
    for (const e of events) {
      const entry = { type: 'command', command: hookCommand(harness, e.hook, dir) };
      (hooks[e.event] ??= []).push({ hooks: [entry] });
    }
    const cfile = join(dir, layout.hooksPath);
    let cdoc = {};
    try { cdoc = JSON.parse(readFileSync(cfile, 'utf8')); } catch { /* novo */ }
    const cmerged = stripKitHooks(cdoc);
    for (const [ev, groups] of Object.entries(hooks)) (cmerged[ev] ??= []).push(...groups);
    writeFileSync(cfile, JSON.stringify(cmerged, null, 2) + '\n');
    written.push(cfile);
    return written;
  }

  // plugin-hooks (família antigravity):
  // - 2.0/ide: hooks.json com OBJETOS NOMEADOS {nome:{Evento:[{matcher,hooks:[{command,timeout}]}]}} (antigravity.google/docs/hooks)
  // - agy: plugin em ~/.gemini/antigravity-cli/plugins/<p>/hooks.json estilo eventos (5 core)
  const entries = events.map((e) => {
    const handler = { type: 'command', command: hookCommand(harness, e.hook, dir), timeout: 30 };
    return e.matcher ? { matcher: e.matcher, hooks: [handler] } : { hooks: [handler] };
  });
  const named = harness === 'antigravity-2.0' || harness === 'antigravity-ide';
  const byEvent = {};
  for (const e of events) {
    const handler = { type: 'command', command: hookCommand(harness, e.hook, dir), timeout: 30 };
    (byEvent[e.event] ??= []).push(e.matcher ? { matcher: e.matcher, hooks: [handler] } : { hooks: [handler] });
  }
  const cfg = named
    ? Object.fromEntries(events.map((e) => {
        const handler = { type: 'command', command: hookCommand(harness, e.hook, dir), timeout: 30 };
        return [`spec-kit-${e.hook}`, { [e.event]: [e.matcher ? { matcher: e.matcher, hooks: [handler] } : { hooks: [handler] }] }];
      }))
    : { plugin: 'spec-kit', harness, hooks: byEvent };
  const f = layout.hooksPath.startsWith('~') ? join(dir, '.agents/plugins/spec-kit/hooks.json') : expand(layout.hooksPath);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify(cfg, null, 2) + '\n');
  if (named) {
    // plugin.json manifesto (obrigatório p/ plugins agy; inofensivo p/ 2.0/ide em .agents/)
    writeFileSync(join(dirname(f), 'plugin.json'), JSON.stringify({ name: 'spec-kit', description: 'Spec-Kit SDD hooks' }, null, 2) + '\n');
  }
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
