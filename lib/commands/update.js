import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { installSquad } from '../generators/squad.js';
import { installSkills, wireAgentsSkills } from '../generators/skills.js';
import { materializeAgents, materializeSkills } from '../materialize.js';
import { readStamp, writeStamp, isStale, packVersion } from '../installed.js';
import { installHooks, installCommands } from '../harnesses/installer.js';
import { concisenessRule } from '../materialize.js';
import { initSpecFolder } from '../spec-folder.js';

const ROOT = join(import.meta.dirname, '..', '..');

// T34 — spec-kit update: organismo vivo. Reescreve INSTRUÇÕES (cache) a partir da fonte;
// NUNCA toca dados do usuário (PRD/ledger/SECURITY_LOG/DOC_SYNC/docs geradas/AGENTS.md GLOBAL).
export async function update({ dir, force = false, check = false, harnesses }) {
  const stale = isStale(dir);
  const stamp = readStamp(dir);
  if (!stamp) throw new Error('sem .spec/installed.json — rode spec-kit init/analyze primeiro');
  if (check) return { check: true, ...stale, stack: stamp.stack, harnesses: stamp.harnesses };
  if (stale.stale === false && !force) return { updated: false, reason: 'em dia (use --force para reescrever mesmo assim)', packVersion: packVersion() };

  // 1. fonte → catálogo (agents sempre; skills só quando a fonte docs/ acompanha o pack — no pack instalado o catalog/ já é a fonte materializada)
  const agents = materializeAgents();
  const { existsSync } = await import('node:fs');
  const skills = existsSync(join(ROOT, 'docs/skills')) ? materializeSkills() : 'catalog/skills preservados (fonte docs não incluída no pack)';

  // 2. cache do projeto → reescreve instruções nos harnesses registrados (ou passados)
  const targets = harnesses?.length ? harnesses : stamp.harnesses;
  const stack = stamp.stack;
  const squadRes = installSquad({ stack, dir, harnesses: targets });
  const skillsRes = installSkills({ stack, dir, harnesses: targets });
  const files = [...squadRes.written, ...skillsRes.written];
  for (const h of targets) {
    files.push(...installCommands({ dir, harness: h }), ...installHooks({ dir, harness: h }));
  }

  // 3. wiring squad↔skills (seção gerida — substituição idempotente) + stamp novo
  const prdConventions = join(dir, 'PROJECT_CONTEXT.json');
  try {
    const ctx = JSON.parse(readFileSync(prdConventions, 'utf8'));
    ctx.conventions = ctx.conventions.filter((c) => !c.startsWith('CONCISÃO'));
    if (!ctx.conventions.some((c) => c.includes('CONCISÃO'))) ctx.conventions.push(concisenessRule());
    writeFileSync(prdConventions, JSON.stringify(ctx, null, 2) + '\n');
  } catch { /* sem PROJECT_CONTEXT — ok */ }
  wireAgentsSkills({ dir, squad: squadRes.squad, skills: skillsRes.skills });
  initSpecFolder(dir, { stack, mode: 'update' }); // reescreve standards; queries/features preservados
  const newStamp = writeStamp(dir, { stack, harnesses: targets });
  return { updated: true, from: stale.installed, to: newStamp.packVersion, agents, skills, rewritten: files.length, harnesses: targets };
}

export async function run(opts) {
  const harnesses = (opts.harnesses ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return await update({ dir: opts.dir, force: opts.force, check: opts.check, harnesses: harnesses.length ? harnesses : undefined });
}
