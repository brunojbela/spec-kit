# Spec-Kit

**Spec-Driven Development Kit** — um pack npm de agents + skills + hooks + commands que transforma qualquer harness de IA (opencode, Claude Code, Cursor, Codex, Gemini CLI, Antigravity 2.0/CLI/IDE) em um **squad local 100% especialista por projeto**, coordenado por um PO.

## O que é

- **Catálogo global generalista** (templates) → **squad local especialista** instanciado por stack via Context7: PO, Tech Lead, Dev Sênior/Pleno/Júnior, QA, Segurança, Docs.
- **PO que entrevista**, classifica dificuldade (trivial→extremo), escolhe o melhor modelo por task (matriz + benchmarks) e delega.
- **Governança rastreável**: PRD + ledger de orquestração + SECURITY_LOG sempre em JSON (máquina) + MD (humano) espelhados.
- **Docs 100%**: pipeline `DOC_SYNC.json` → Arqueólogo → multisubagents → `docs/technical/**` + `docs/functional/**`.
- **Segurança**: pentest reverso com checklist de 20 itens e hook `security-gate` bloqueante.
- **Ralph Loop**: execução persistente por task (`.sh` com chat limpo, 3–5 iterações, validação em testes fixos).

## Requisitos

- Node.js >= 20

## Instalação

Via npm (recomendado):

```sh
npm install -g github:brunojbela/spec-kit
```

Ou a partir do código:

```sh
git clone git@github.com:brunojbela/spec-kit.git
cd spec-kit
npm install
npm link
```

Verifique:

```sh
spec-kit --version
```

## Uso

### Projeto novo (greenfield)

```sh
cd /caminho/do/meu-projeto
spec-kit init                    # interativo: pergunta stack, objetivo e harnesses
spec-kit init --stack laravel,react --goal "API de pedidos" --harnesses opencode,claude-code
```

Gera `AGENTS.md`, `PROJECT_CONTEXT.json`, `docs/PRD.json+md`, `DOC_SYNC.json`, `.spec/` (padrões vigentes + memória de consultas Context7 + specs/planos por feature), ledger e instala o squad especialista. Sem flags, roda a **mini-entrevista** (stack → objetivo → seletor de harnesses). Erros saem limpos (`spec-kit: <motivo>`), sem stack trace.

```sh
spec-kit init --stack laravel,react                    # seletor interativo (↑/↓, espaço, a=todos, enter)
spec-kit init --stack laravel,react --harnesses opencode,claude-code  # direto pela linha de comando
spec-kit init --stack laravel,react --yes              # sem pergunta: todos os 8
```

IDs válidos: `opencode`, `claude-code`, `cursor`, `codex`, `gemini-cli`, `antigravity-2.0`, `antigravity-cli (agy)`, `antigravity-ide`.

### Projeto legado

```sh
spec-kit analyze /caminho/do/repo
```

Detecta a stack, preenche `DOC_SYNC.json` (Arqueólogo), gera char-tests e instancia o squad sem tocar no código.

### Dentro do harness (opencode/Claude Code/Cursor/Codex/Gemini/Agy)

O instalador gera **slash commands** em cada harness escolhido (`/spec-kit-init`, `/spec-kit-verify`, ...). Lá dentro, o comando é um **prompt para o agente**: ele conduz a entrevista no chat (papel PO) e executa o CLI determinístico com flags (`--yes`, sem TTY). Hooks rodam automaticamente em todos os momentos (session start, pré/pós-tool, stop). Fluxo típico:

```
abro o projeto no harness → digito /spec-kit-init → PO entrevista no chat →
CLI instala squad/governança → /spec-kit-verify antes de cada ship
```

### Gates

```sh
spec-kit verify          # QA (testes) + security-gate (20 itens) + docs-check; exit 0/1
```

### Visão de todos os projetos

```sh
spec-kit init-projects --projects-dir ~/projetos
```

Gera `projects-registry.json+md` com stack, SDD?, repo e sessões por projeto (continuidade cross-harness via `session_id` estável).

### Organismo vivo: atualização

O kit evolui e os projetos instalados acompanham — instruções instaladas são **cache**, a fonte é o pack; dados do usuário (PRD, ledger, docs, memória) **nunca** são sobrescritos:

```sh
spec-kit update --check   # reporta se há atualização pendente
spec-kit update           # reescreve instruções (agents/skills/hooks/commands) dos harnesses instalados
spec-kit update --force   # reescreve mesmo com versões iguais
```

O hook `session.classify` detecta versão desatualizada no início de cada sessão e o próprio agente sugere o update. Ver [docs/11-living-updates.md](docs/11-living-updates.md).

### Catálogo de modelos

```sh
spec-kit models refresh            # atualiza benchmarks (SWE-bench, preços)
spec-kit models refresh --offline  # mantém o último catálogo válido (fallback)
```

### Hooks nos harnesses

Os adapters instalam os 7 hooks canônicos (`session.classify`, `session.personal-interview`, `interaction.inject-orchestration`, `security-gate`, `ledger-record`, `docs-check`, `docs.sync`) traduzidos para o evento nativo de cada harness (matriz completa em [docs/04-runtime.md](docs/04-runtime.md)).

## Documentação

- Site: [docsify](docs/README.md) — rode localmente com `npm run docs:serve` e abra http://localhost:3000
- Harnesses: [docs/01-harnesses.md](docs/01-harnesses.md) · Agents: [docs/02-agents.md](docs/02-agents.md) · Skills: [docs/03-skills.md](docs/03-skills.md)
- Runtime: [docs/04-runtime.md](docs/04-runtime.md) · Governança: [docs/05-governance.md](docs/05-governance.md) · Ralph Loop: [docs/06-ralph-loop.md](docs/06-ralph-loop.md)
- Fluxo/PO: [docs/07-flow-daytoday.md](docs/07-flow-daytoday.md) · Contexto pessoal: [docs/08-personal-context.md](docs/08-personal-context.md) · Registry: [docs/09-projects-registry.md](docs/09-projects-registry.md)

## Desenvolvimento

```sh
npm test   # 94 testes (node --test) — TDD obrigatório
```

## Licença

MIT
