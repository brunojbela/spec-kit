import { readdirSync, existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function detectStack(dir) {
  const stacks = [];
  if (existsSync(join(dir, 'composer.json'))) {
    const c = JSON.parse(readFileSync(join(dir, 'composer.json'), 'utf8'));
    stacks.push('php');
    if (Object.keys(c.require ?? {}).some((d) => d.startsWith('laravel/'))) stacks.push('laravel');
  }
  if (existsSync(join(dir, 'package.json'))) {
    const p = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    const deps = { ...p.dependencies, ...p.devDependencies };
    stacks.push('node');
    for (const fw of ['react', 'vue', 'angular', 'next']) if (Object.keys(deps).some((d) => d === fw || d.startsWith(`${fw}/`))) stacks.push(fw === 'angular' ? 'angular' : fw);
    if (deps.typescript) stacks.push('typescript');
  }
  if (existsSync(join(dir, 'requirements.txt')) || existsSync(join(dir, 'pyproject.toml'))) stacks.push('python');
  return [...new Set(stacks)];
}

function repoOf(dir) {
  try {
    const cfg = readFileSync(join(dir, '.git', 'config'), 'utf8');
    return cfg.match(/url\s*=\s*(.+)/)?.[1]?.trim() ?? null;
  } catch { return null; }
}

function sessionsOf(dir) {
  try {
    const led = JSON.parse(readFileSync(join(dir, 'docs', 'ORCHESTRATION.json'), 'utf8'));
    const harnesses = [...new Set(led.entries.map((e) => e.harness))];
    return { count: led.entries.length, harnesses };
  } catch { return { count: 0, harnesses: [] }; }
}

// T28 — spec-kit init-projects: mapeia a pasta de projects.
export function scanProjects(projectsDir) {
  const projects = [];
  for (const entry of readdirSync(projectsDir)) {
    const dir = join(projectsDir, entry);
    if (!statSync(dir).isDirectory() || entry.startsWith('.')) continue;
    const sdd = existsSync(join(dir, 'docs', 'PRD.json'));
    const readme = existsSync(join(dir, 'README.md')) ? readFileSync(join(dir, 'README.md'), 'utf8').split('\n').find((l) => l.trim() && !l.startsWith('#')) : null;
    projects.push({
      name: entry,
      stack: detectStack(dir),
      sdd,
      repo: repoOf(dir),
      sessions: sessionsOf(dir),
      overview: readme?.trim() ?? (sdd ? JSON.parse(readFileSync(join(dir, 'docs', 'PRD.json'), 'utf8')).sharedContext.objetivo.slice(0, 160) : 'sem overview'),
    });
  }
  return projects;
}

export function renderRegistryMd(reg) {
  const L = [`# Projects registry — ${reg.projectsDir}`, '', `Atualizado: ${reg.updatedAt}`, '', '| projeto | stack | SDD? | repo | sessions | overview |', '|---|---|---|---|---|---|'];
  for (const p of reg.projects) {
    L.push(`| ${p.name} | ${p.stack.join(', ') || '—'} | ${p.sdd ? 'sim' : 'não'} | ${p.repo ?? '—'} | ${p.sessions.count} (${p.sessions.harnesses.join('/') || '—'}) | ${String(p.overview).replace(/\|/g, '\\|')} |`);
  }
  L.push('');
  return L.join('\n');
}

export function writeRegistry(projectsDir, outFile) {
  const reg = { projectsDir, updatedAt: new Date().toISOString(), projects: scanProjects(projectsDir) };
  const json = outFile ?? join(projectsDir, 'projects-registry.json');
  writeFileSync(json, JSON.stringify(reg, null, 2) + '\n');
  writeFileSync(json.replace(/\.json$/, '.md'), renderRegistryMd(reg));
  return reg;
}
