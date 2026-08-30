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
spec-kit init --stack laravel,react
```

Gera `AGENTS.md`, `PROJECT_CONTEXT.json`, `docs/PRD.json+md`, `DOC_SYNC.json`, ledger e instala o squad especialista nos 8 harnesses (`.opencode/`, `.claude/`, `.cursor/`, `.agents/` etc.).

### Projeto legado

```sh
spec-kit analyze /caminho/do/repo
```

Detecta a stack, preenche `DOC_SYNC.json` (Arqueólogo), gera char-tests e instancia o squad sem tocar no código.

### Gates

```sh
spec-kit verify          # QA (testes) + security-gate (20 itens) + docs-check; exit 0/1
```

### Visão de todos os projetos

```sh
spec-kit init-projects --projects-dir ~/projetos
```

Gera `projects-registry.json+md` com stack, SDD?, repo e sessões por projeto (continuidade cross-harness via `session_id` estável).

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
