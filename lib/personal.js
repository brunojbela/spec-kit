import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

// AGENTS.md GLOBAL por harness (docs/08-personal-context.md)
export const GLOBAL_AGENTS_PATH = {
  opencode: '.config/opencode/AGENTS.md',
  'claude-code': '.claude/CLAUDE.md',
  codex: '.codex/AGENTS.md',
  cursor: '.cursor/AGENTS.md',
  'gemini-cli': '.gemini/GEMINI.md',
  'antigravity-2.0': '.gemini/config/AGENTS.md',
  'antigravity-cli (agy)': '.gemini/antigravity-cli/config/AGENTS.md',
  'antigravity-ide': '.gemini/antigravity/AGENTS.md',
};

export const INTERVIEW_FIELDS = [
  'nome do usuário',
  'nome que o usuário dá ao seu agente',
  'como gosta de trabalhar (ritmo, autonomia, detalhe)',
  'padrões/costumes preferidos',
  'como quer as respostas (tom, idioma, verbosidade, formato)',
  'itens pedidos constantemente',
];

export function globalAgentsPath(homeDir, harness) {
  const rel = GLOBAL_AGENTS_PATH[harness];
  if (!rel) throw new Error(`harness desconhecido: ${harness}`);
  return join(homeDir, rel);
}

export function isFirstRun(homeDir, harness) {
  return !existsSync(globalAgentsPath(homeDir, harness));
}

export function runInterview({ homeDir, harness, answers }) {
  if (!Array.isArray(answers) || answers.length !== INTERVIEW_FIELDS.length) {
    throw new Error(`entrevista requer ${INTERVIEW_FIELDS.length} respostas (campos: ${INTERVIEW_FIELDS.join('; ')})`);
  }
  const file = globalAgentsPath(homeDir, harness);
  if (existsSync(file)) return { created: false, file };
  mkdirSync(dirname(file), { recursive: true });
  const md = `# AGENTS.md GLOBAL — memória viva do usuário (${harness})\n\n` +
    INTERVIEW_FIELDS.map((f, i) => `- **${f}:** ${answers[i]}`).join('\n') +
    `\n\n> Atualizado continuamente pelos agents/skills (organismo vivo). Em dúvida → pausa e pergunta.\n`;
  writeFileSync(file, md);
  return { created: true, file };
}

export function appendMemory(homeDir, harness, note) {
  const file = globalAgentsPath(homeDir, harness);
  if (!existsSync(file)) throw new Error('AGENTS.md GLOBAL não existe — rode a entrevista first-run');
  const md = readFileSync(file, 'utf8');
  writeFileSync(file, md.replace(/\n> Atualizado continuamente[\s\S]*$/, '') + `\n- **memória:** ${note}\n`);
  return file;
}
