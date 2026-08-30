import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'vendor']);

export function detectStackFromFile(dir) {
  const stacks = [];
  if (existsSync(join(dir, 'composer.json'))) {
    try {
      const c = JSON.parse(readFileSync(join(dir, 'composer.json'), 'utf8'));
      stacks.push('php');
      if (Object.keys(c.require ?? {}).some((d) => d.startsWith('laravel/'))) stacks.push('laravel');
    } catch { stacks.push('php'); }
  }
  if (existsSync(join(dir, 'package.json'))) {
    try {
      const p = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      const deps = { ...p.dependencies, ...p.devDependencies };
      stacks.push('node');
      for (const fw of ['react', 'vue', 'angular']) if (deps[fw]) stacks.push(fw);
      if (deps.typescript) stacks.push('typescript');
    } catch { stacks.push('node'); }
  }
  if (existsSync(join(dir, 'requirements.txt')) || existsSync(join(dir, 'pyproject.toml'))) stacks.push('python');
  if (!stacks.length) {
    const exts = new Set();
    (function walk(d) {
      if (!existsSync(d)) return;
      for (const e of readdirSync(d)) {
        if (SKIP.has(e)) continue;
        const full = join(d, e);
        if (statSync(full).isDirectory()) walk(full);
        else exts.add(e.slice(e.lastIndexOf('.') + 1));
      }
    })(dir);
    if (exts.has('php')) stacks.push('php');
    if (exts.has('py')) stacks.push('python');
    if (exts.has('js') || exts.has('ts')) stacks.push('node');
  }
  return stacks.length ? stacks : ['node'];
}
