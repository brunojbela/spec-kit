import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const spec = JSON.parse(readFileSync(join(ROOT, 'spec-kit.orchestration.json'), 'utf8'));

// Layouts verificados (docs/01-harnesses.md) — caminhos relativos ao workspace do projeto.
export const LAYOUT = {
  opencode: {
    agents: '.opencode/agents', skills: '.opencode/skills', commands: '.opencode/commands',
    hooksStyle: 'plugins', hooksPath: '.opencode/plugins', context: 'AGENTS.md',
    globalAgents: '~/.config/opencode/agents', globalSkills: '~/.config/opencode/skills',
  },
  'claude-code': {
    agents: '.claude/agents', skills: '.claude/skills', commands: '.claude/commands',
    hooksStyle: 'settings', hooksPath: '.claude/settings.json', context: 'CLAUDE.md',
    globalAgents: '~/.claude/agents', globalSkills: '~/.claude/skills',
  },
  cursor: {
    agents: '.cursor/agents', skills: '.cursor/skills', commands: '.cursor/commands',
    hooksStyle: 'hooks-json', hooksPath: '.cursor/hooks.json', rules: '.cursor/rules', context: 'AGENTS.md',
    globalAgents: '~/.cursor/agents', globalSkills: '~/.cursor/skills',
  },
  codex: {
    agents: null, // agents via AGENTS.md hierárquico
    skills: '.agents/skills', skillsCompat: '.codex/skills', commands: '.codex/prompts',
    hooksStyle: 'hooks-json', hooksPath: '.codex/hooks.json', context: 'AGENTS.md',
    globalAgents: '~/.codex', globalSkills: '~/.agents/skills',
  },
  'gemini-cli': {
    agents: null, // contexto via GEMINI.md
    skills: '.gemini/skills', commands: '.gemini/commands',
    hooksStyle: 'settings', hooksPath: '.gemini/settings.json', context: 'GEMINI.md',
    globalSkills: '~/.gemini/skills',
  },
  'antigravity-2.0': {
    agents: null, skills: '.agents/skills', commands: null,
    hooksStyle: 'plugin-hooks', hooksPath: '.agents/plugins/spec-kit/hooks.json', context: 'AGENTS.md',
    globalSkills: '~/.gemini/config/skills',
  },
  'antigravity-cli (agy)': {
    agents: null, skills: '.agents/skills', skillFile: 'flat', commands: null,
    hooksStyle: 'plugin-hooks', hooksPath: '~/.gemini/antigravity-cli/plugins/spec-kit/hooks.json', context: 'AGENTS.md',
    globalSkills: '~/.gemini/antigravity-cli/skills',
  },
  'antigravity-ide': {
    agents: null, skills: '.agents/skills', commands: null,
    hooksStyle: 'plugin-hooks', hooksPath: '.agents/plugins/spec-kit/hooks.json', context: 'AGENTS.md',
    globalSkills: '~/.gemini/antigravity/skills',
  },
};

export const HARNESS_IDS = spec.harnesses.targets.map((t) => t.id);

export function layoutOf(harness) {
  const l = LAYOUT[harness];
  if (!l) throw new Error(`harness desconhecido: ${harness} (válidos: ${HARNESS_IDS.join(', ')})`);
  return l;
}
