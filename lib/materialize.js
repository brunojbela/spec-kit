import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function concisenessRule() {
  const spec = JSON.parse(readFileSync(join(ROOT, 'spec-kit.orchestration.json'), 'utf8'));
  return spec.standards.conciseness.rule;
}

function yaml(obj) {
  return Object.entries(obj)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map((i) => `  - ${JSON.stringify(String(i))}`).join('\n')}`;
      if (typeof v === 'string' && v.includes('\n')) return `${k}: |\n  ${v.replace(/\n/g, '\n  ')}`;
      return `${k}: ${JSON.stringify(v)}`;
    })
    .join('\n');
}

export function materializeAgents({ specPath = join(ROOT, 'spec-kit.orchestration.json'), outDir = join(ROOT, 'catalog/agents') } = {}) {
  const spec = JSON.parse(readFileSync(specPath, 'utf8'));
  const agents = [...spec.agents.globalCatalog, ...(spec.agents.example || [])];
  mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const a of agents) {
    const fm = {
      id: a.id,
      friendlyName: a.friendlyName,
      cargo: a.cargo,
      funcao: a.funcao,
      tier: a.tier,
      type: a.type,
      role: a.role,
      skills: a.skills || [],
      responsibilities: a.responsibilities || [],
      prohibitions: a.prohibitions || [],
      how: a.how,
      usesContext7: !!a.usesContext7,
      modes: a.modes,
    };
    if (a.scope) fm.scope = a.scope;
    const rule = concisenessRule();
    const body = `---\n${yaml({ ...fm, conciseness: rule })}\n---\n\n# ${a.friendlyName} (\`${a.id}\`)\n\n**Cargo:** ${a.cargo} · **Função:** ${a.funcao}\n\n## Como age\n${a.how}\n\n${a.prohibitions?.length ? `## Proibições\n${a.prohibitions.map((p) => `- ${p}`).join('\n')}\n` : ''}## Regra de código (todos os agents)\n${rule}\n\n> Template do catálogo global. O generator de squad instancia a versão especialista por projeto/stack (Context7).\n`;
    writeFileSync(join(outDir, `${a.id}.md`), body);
    written.push(a.id);
  }
  return written;
}

export function parseSkillDoc(md) {
  const id = md.match(/^# .*?\(`([^`]+)`\)/m)?.[1];
  const friendlyName = md.match(/^# (.*?) \(`/m)?.[1];
  const cargo = md.match(/\*\*Cargo:\*\* (.+)/)?.[1]?.trim();
  const funcao = md.match(/\*\*Função:\*\* (.+)/)?.[1]?.trim();
  const tierLine = md.match(/\*\*Tier:\*\* (.+)/)?.[1] || '';
  const tier = tierLine.split('(')[0].trim();
  const gatilho = tierLine.match(/\*\*Gatilho:\*\*\s*(.+)/)?.[1]?.trim();
  const entrega = md.match(/## O que entrega\n(.+)/)?.[1]?.trim();
  const steps = md.match(/## Como age \(steps\)\n([\s\S]+?)\n\n##/)?.[1]?.trim();
  const usesContext7 = /usesContext7:\s*([^`]+?)`/.exec(md)?.[1]?.trim();
  return { id, friendlyName, cargo, funcao, tier, gatilho, description: entrega, steps, usesContext7 };
}

export function materializeSkills({ docsDir = join(ROOT, 'docs/skills'), outDir = join(ROOT, 'catalog/skills') } = {}) {
  mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const file of readdirSync(docsDir).filter((f) => f.endsWith('.md'))) {
    const parsed = parseSkillDoc(readFileSync(join(docsDir, file), 'utf8'));
    if (!parsed.id || !NAME_RE.test(parsed.id)) throw new Error(`skill inválida em ${file}: id="${parsed.id}"`);
    const dir = join(outDir, parsed.id);
    mkdirSync(dir, { recursive: true });
    const rule = concisenessRule();
    const fm = {
      name: parsed.id,
      description: parsed.description || parsed.funcao || parsed.id,
      friendlyName: parsed.friendlyName,
      cargo: parsed.cargo,
      funcao: parsed.funcao,
      tier: parsed.tier,
      gatilho: parsed.gatilho,
      conciseness: rule,
      steps: [...(parsed.steps || '').split(/\d+\.\s/).filter(Boolean).map((s) => s.trim()), 'Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema.'],
    };
    const body = `---\n${yaml(fm)}\n---\n\n# ${parsed.friendlyName} (\`${parsed.id}\`)\n\n**Gatilho:** ${parsed.gatilho}\n\n## Como age (steps)\n${parsed.steps}\n\n## Regra de código (todas as skills)\n${rule}\n\n> Template do catálogo global; o generator instancia a versão especialista do projeto.\n`;
    writeFileSync(join(dir, 'SKILL.md'), body);
    written.push(parsed.id);
  }
  return written;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const agents = materializeAgents();
  const skills = materializeSkills();
  console.log(`agents: ${agents.length} (${agents.join(', ')})`);
  console.log(`skills: ${skills.length}`);
}
