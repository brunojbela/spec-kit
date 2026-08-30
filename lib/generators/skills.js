import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { resolveStack } from '../stacks.js';
import { layoutOf, HARNESS_IDS } from '../harnesses/registry.js';

const ROOT = join(import.meta.dirname, '..', '..');

export function installSkills({ stack, dir, harnesses = HARNESS_IDS }) {
  const resolved = resolveStack(stack);
  const written = [];
  for (const harness of harnesses) {
    const layout = layoutOf(harness);
    if (!layout.skills) continue;
    const base = join(dir, layout.skills);
    for (const id of resolved.skills) {
      const src = join(ROOT, 'catalog/skills', id, 'SKILL.md');
      if (!existsSync(src)) continue;
      if (layout.skillFile === 'flat') {
        mkdirSync(base, { recursive: true });
        const file = join(base, `${id}.md`);
        cpSync(src, file);
        written.push(file);
      } else {
        const dest = join(base, id);
        mkdirSync(dest, { recursive: true });
        cpSync(src, join(dest, 'SKILL.md'));
        written.push(join(dest, 'SKILL.md'));
        if (layout.skillsCompat) {
          const destCompat = join(dir, layout.skillsCompat, id);
          mkdirSync(destCompat, { recursive: true });
          cpSync(src, join(destCompat, 'SKILL.md'));
        }
      }
    }
  }
  return { skills: resolved.skills, written };
}

export function wireAgentsSkills({ dir, squad, skills }) {
  const ctx = join(dir, 'AGENTS.md');
  const section = [
    '\n## Wiring squad ↔ skills (spec-kit)',
    ...squad.map((a) => `- **${a.id}** → ${a.skills.filter((s) => skills.includes(s)).join(', ')}`),
    '',
  ].join('\n');
  const existing = existsSync(ctx) ? readFileSync(ctx, 'utf8') : '# AGENTS.md\n';
  writeFileSync(ctx, existing.replace(/\n*## Wiring squad ↔ skills \(spec-kit\)[\s\S]*$/, '') + section);
  return ctx;
}
