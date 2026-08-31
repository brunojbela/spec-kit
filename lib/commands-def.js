import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const spec = JSON.parse(readFileSync(join(ROOT, 'spec-kit.orchestration.json'), 'utf8'));

// Prompt do AGENTE dentro do harness: entrevista em chat (PO) → CLI determinístico (--yes, sem TTY).
const AGENT_PROMPTS = {
  'spec-kit init': `Você é o PO do spec-kit. Conduza a entrevista NO CHAT antes de executar:
1. Pergunte a STACK (ex: laravel,react) — detecte arquivos se possível (package.json/composer.json).
2. Pergunte o OBJETIVO em 1 linha.
3. Pergunte em quais HARNESSSES instalar (default: este harness).
Depois execute o CLI determinístico (sem TTY):
\`spec-kit init --stack <stack> --goal "<objetivo>" --harnesses <h> --yes\`
Então apresente docs/PRD.md resumido e aguarde aprovação para detalhar as tasks.`,
  'spec-kit analyze': `Você é o PO do spec-kit para projeto LEGADO. No chat: confirme o repo/pasta e a stack (deixe o CLI detectar via composer.json/package.json se não souber).
Execute: \`spec-kit analyze <repo> --harnesses <h>\`
O CLI preenche DOC_SYNC.json (Arqueólogo) e char-tests mock. Depois rode a Fase 2 do doc-gen (multisubagents, 1 func por agente) até 100% documentado e apresente o plano de regularização.`,
  'spec-kit verify': `Você é o QA do spec-kit. Execute os gates: \`spec-kit verify\`
Exit 0 → libere a ship e registre no ledger. Exit 1 → mostre QUAL gate falhou (qa/security/docs), corrija com mudança cirúrgica e rode de novo (Ralph in-chat). Vuln no SECURITY_LOG = bloqueio até corrigir a causa raiz.`,
  'spec-kit init-projects': `Execute \`spec-kit init-projects --projects-dir <pasta>\` e apresente a tabela (nome, stack, SDD?, repo, sessions). Sugira o próximo passo por projeto (init nos que não têm SDD, analyze nos legados).`,
  'spec-kit models refresh': `Execute \`spec-kit models refresh\` (use --offline se sem rede — mantém último catálogo válido). Depois confirme ao PO que a matriz dificuldade→modelo está atualizada.`,
};

export function specCommands() {
  return spec.commands.planned.map((c) => ({
    slug: c.id.replace(/^spec-kit\s+/, '').replace(/\s+/g, '-'),
    signature: c.signature,
    description: c.behavior.slice(0, 80),
    behavior: c.behavior,
    agentPrompt: AGENT_PROMPTS[c.id] ?? c.behavior,
  }));
}
