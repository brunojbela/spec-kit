import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { validateOrThrow } from '../schemas.js';
import { resolveStack } from '../stacks.js';
import { layoutOf, HARNESS_IDS } from '../harnesses/registry.js';
import { concisenessRule } from '../materialize.js';

const ROOT = join(import.meta.dirname, '..', '..');
const spec = JSON.parse(readFileSync(join(ROOT, 'spec-kit.orchestration.json'), 'utf8'));

const SKILL_IDS = new Set(spec.skills.plannedCatalog);

function fmYaml(obj) {
  return Object.entries(obj)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map((i) => `  - ${JSON.stringify(String(i))}`).join('\n')}`;
      if (typeof v === 'string' && v.length > 80) return `${k}: >-\n  ${v.replace(/\n/g, ' ')}`;
      return `${k}: ${JSON.stringify(v)}`;
    })
    .join('\n');
}

export function buildSquad({ stack }) {
  const resolved = resolveStack(stack);
  return spec.agents.localSquad.map((a) => {
    const agentSkills = [...new Set([...(a.skills || []), ...resolved.skills.filter((s) => SKILL_IDS.has(s))])];
    const agent = {
      id: a.id,
      friendlyName: a.friendlyName,
      cargo: a.cargo,
      funcao: a.funcao,
      tier: 'local',
      type: a.type,
      role: a.role,
      skills: agentSkills,
      responsibilities: a.responsibilities || [],
      prohibitions: a.prohibitions || [],
      how: `${a.how} Regra permanente: CONCISÃO — código curto, direto, simples, methods/functions de uma responsabilidade, legíveis de primeira, focados em resolver o problema.${a.usesContext7
        ? ` Use Context7 (${resolved.context7.join(', ')}) para docs oficiais das versões do projeto e REGISTRE cada consulta em .spec/queries/queries.jsonl {ts,agent,skill,harness,libraryId,query,sources} antes de agir.`
        : ''}`,
      usesContext7: !!a.usesContext7,
      modes: a.modes,
      stack: resolved.stacks,
      context7: resolved.context7,
    };
    validateOrThrow('agent', agent);
    return agent;
  });
}

export function renderAgentMd(agent) {
  const { how, ...rest } = agent;
  const rule = concisenessRule();
  return `---\n${fmYaml({ ...rest, how, conciseness: rule })}\n---\n\n# ${agent.friendlyName} (\`${agent.id}\`)\n\n**Cargo:** ${agent.cargo} · **Função:** ${agent.funcao}\n**Stack especialista:** ${agent.stack.join(', ')}\n\n## Como age\n${agent.how}\n\n${agent.prohibitions.length ? `## Proibições\n${agent.prohibitions.map((p) => `- ${p}`).join('\n')}\n` : ''}## Regra de código (todos os agents)\n${rule}\n\nGerado pelo spec-kit para o squad LOCAL deste projeto (100% especialista via Context7).\n`;
}

export function installSquad({ stack, dir, harnesses = HARNESS_IDS }) {
  const squad = buildSquad({ stack });
  const written = [];
  for (const harness of harnesses) {
    const layout = layoutOf(harness);
    if (layout.agents) {
      const agentsDir = join(dir, layout.agents);
      mkdirSync(agentsDir, { recursive: true });
      for (const agent of squad) {
        const file = join(agentsDir, `${agent.id}.md`);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, renderAgentMd(agent));
        written.push(file);
      }
    } else {
      // harnesses sem dir de agents: squad descrito no arquivo de contexto
      const ctx = join(dir, layout.context);
      const section = `\n## Squad spec-kit\n${squad.map((a) => `- **${a.friendlyName}** (\`${a.id}\`): ${a.funcao}`).join('\n')}\n`;
      const existing = (() => { try { return readFileSync(ctx, 'utf8'); } catch { return `# ${layout.context}\n`; } })();
      writeFileSync(ctx, existing.replace(/\n*## Squad spec-kit[\s\S]*$/, '') + section);
      written.push(ctx);
    }
  }
  return { squad, written };
}
