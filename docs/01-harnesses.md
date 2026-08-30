# 01 — Harnesses e Locais dos Artefatos

O `spec-kit` é **multiharness**: um mesmo catálogo é injetado em cada harness via **adapter** que conhece os caminhos e formatos de cada ferramenta.

## Tabela de harnesses (pesquisado em docs oficiais — ago/2026)

| Harness | Tipo | Agents | Skills | Hooks | Commands | Session / Config |
|---|---|---|---|---|---|---|
| **opencode** | cli/ide | `~/.config/opencode/agents/*.md` (global) + `.opencode/agents/*.md` (projeto) | `.opencode/skills/<n>/SKILL.md` + `~/.config/opencode/skills/<n>/SKILL.md` + compat `.claude/skills/`, `.agents/skills/` | plugins `.opencode/plugins/*.ts` (`@opencode-ai/plugin`, eventos `tool.execute.after` etc.) — ver `/hooks` | `.opencode/commands/*.md` + `~/.config/opencode/commands/*.md` + `opencode.json:command` | `opencode.json` (projeto + `~/.config/opencode/opencode.json`) + `AGENTS.md` hierárquico |
| **antigravity 2.0** | desktop | skills/agents via `.agents/skills/`; `AGENTS.md` hierárquico | `<ws>/.agents/skills/<n>/SKILL.md` (ws) + `~/.gemini/config/skills/<n>/SKILL.md` (global) — legacy `.agent/skills` | `hooks.json` dentro do plugin ou `settings.json` — `/hooks` | slash commands: cada skill vira `/<nome>` | `~/.gemini/config/` + settings + permissões |
| **antigravity cli (agy)** | cli | bin `~/.local/bin/agy` (Go) | ws `.agents/skills/<n>.md` → `/<n>` + global `~/.gemini/antigravity-cli/skills/` | plugin `~/.gemini/antigravity-cli/plugins/<p>/hooks.json` ou `settings.json` — `/hooks` | slash via skills; gerenciamento `agy plugin {list,install,enable,disable,uninstall}` | `~/.gemini/antigravity-cli/` + `mcp_config.json` |
| **antigravity ide** | ide | IDE agent-first | `<ws>/.agents/skills/<n>/SKILL.md` + `~/.gemini/antigravity/skills/<n>/SKILL.md` (global) — legacy `.agent/skills` | `hooks.json` por plugin / `settings.json` | skills → slash | `~/.gemini/antigravity/` + AGENTS.md + rules/workflows |
| **gemini-cli** | cli | `GEMINI.md` hierárquico (raiz + `~/.gemini/`, `context.fileName` pode incluir `AGENTS.md`) | `gemini skills {list,install,uninstall}` + `/skills {list,link,disable,enable,reload}`; descoberto em dirs linkados (`--scope user|workspace`) | extension `hooks/hooks.json` (se houver) — bloqueia em interceptação limitada vs Claude | `.gemini/commands/*.toml` (user `~/.gemini/commands/*.toml` + projeto `.gemini/commands/*.toml` + enterprise) | `settings.json` (`context.fileName`, trusted folders, `.geminiignore`) + `GEMINI.md` — *desde 19/05/2026 migrado para `agy` em contas individuais; enterprise mantém `gemini`* |
| **claude-code** | cli/ide | `~/.claude/agents/*.md` + `.claude/agents/*.md` + nested + plugins (auto-discovery) | `~/.claude/skills/<n>/SKILL.md` + `.claude/skills/<n>/SKILL.md` + nested + `plugin:skill` namespaced + `.claude/commands/*.md` (legado, skill tem precedência) — padrão [agentskills.io](https://agentskills.io) | `~/.claude/settings.json` + `.claude/settings.json` (+ `.claude/settings.local.json`) eventos `PreToolUse/PostToolUse/Stop/SessionStart/…` — tipos `command/http/mcp_tool/prompt/agent` | `.claude/commands/*.md` ainda funciona (skill prevalece); cada skill cria `/<nome>` | `~/.claude/settings.json`, `.claude/settings.local.json`, `CLAUDE.md` (memória), `~/.claude.json` (MCP) |
| **codex** | cli | `AGENTS.md` hierárquico (raiz + nested, concatenado no contexto, ≤32 KiB) + `~/.codex/AGENTS.md` | repo `.agents/skills/<n>/SKILL.md` + user `~/.agents/skills/<n>/SKILL.md` + admin `/etc/codex/skills/<n>/SKILL.md` + compat `.codex/skills/<n>/SKILL.md` (`~/.codex/skills/`) + `.codex-plugin/plugin.json` + `openai.yaml` | `openai.yaml` por skill + `config` de permissões (`~/.codex/config.toml`) | skills via `$skill-name` + seletor; `prompts/` em `.codex/`; plugins distribuem skills+connectors | `~/.codex/config.toml`, `AGENTS.md` hierárquico, `openai.yaml` por skill |
| **cursor** | ide | `.cursor/agents/*.md` (subagents) + `~/.cursor/agents/` + compat `.claude/.codex` dirs | `.cursor/skills/<n>/SKILL.md` + `~/.cursor/skills/` + compat `.claude/skills`, `.agents/skills`, `.codex/skills` (nested + symlink, descoberto em subdirs desde 2026) + `.cursor-plugin/plugin.json` | `.cursor/hooks.json` (proj) + `~/.cursor/hooks.json` (user) eventos `sessionStart/End`, `preToolUse/postToolUse`, `beforeShellExecution` — tipos `command/prompt` (stdio JSON) + Marketplace | slash via skills; `/skills` navega; `.cursor/commands/` legacy; `agy`-style `/plugin` no CLI | `.cursor/rules/*.mdc` (scoped `globs`), `AGENTS.md` (cross-tool), `.cursorrules`, `permissions.json` |

> Tabela atualizada via pesquisa web em docs oficiais em 30/08/2026. Linhas antigas com `CONFIRMAR` mantidas no `spec-kit.orchestration.json` foram resolvidas — ver `harnesses.details` no JSON.

## AGENTS.md GLOBAL vs do projeto
- **AGENTS.md do projeto:** fonte de verdade de stack/convenções do repositório (gerado por `init`/`analyze`). Todos os harnesses que seguem o padrão aberto honram `AGENTS.md` hierárquico (codex, cursor, gemini-cli via `context.fileName`, opencode).
- **AGENTS.md GLOBAL:** fora do projeto — `~/.config/opencode/AGENTS.md` (opencode), `~/.claude/CLAUDE.md` (claude), `~/.codex/AGENTS.md` (codex), `~/.cursor` rules, `~/.gemini/` (gemini/agy), `~/.gemini/config/` ou `~/.gemini/antigravity*/` (antigravity). É a **memória viva do relacionamento com o usuário**, criada na entrevista pessoal do first-run (ver `08-personal-context.md`).

## Detalhes confirmados por harness (fontes)

### opencode — [opencode.ai/docs/agents](https://opencode.ai/docs/agents), [/docs/skills](https://opencode.ai/docs/skills), [/docs/commands](https://opencode.ai/docs/commands)
- Agents em markdown com frontmatter `description/mode/model/permission`; `Tab` alterna primários (`build`/`plan`), `@` invoca subagents (`general/explore/scout`).
- Skills: uma pasta por skill `SKILL.md` com frontmatter `name`/`description` (`^[a-z0-9]+(-[a-z0-9]+)*$`, 1–64, 1–1024 desc); descoberta sobe até o git worktree + global; carrega on-demand via tool `skill`.
- Commands: markdown `commands/*.md` ou `opencode.json:command` com `template/description/agent/model/subtask`; placeholders `$ARGUMENTS/$1/!`cmd`/@file`.
- Hooks: **diferente do claude** — via `Plugin` JS/TS em `.opencode/plugins/` (`tool.execute.after` etc.), não pasta `hooks/` estática.

### claude-code — [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills), [steering blog](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)
- Skills fundidos com commands: `.claude/skills/<n>/SKILL.md` **e** `.claude/commands/*.md` criam `/<n>` (skill prevalece).
- Frontmatter: `name/description/when_to_use/disable-model-invocation/allowed-tools/model/context:fork` etc. Progressive disclosure (lista → load on relevance).
- Hooks em `settings.json` (command/http/mcp_tool/prompt/agent), baixo custo de contexto.

### cursor — [cursor.com/docs/hooks](https://cursor.com/docs/hooks), changelogs 2026
- Primitives: `AGENTS.md` (always-on cross-tool) → Rules `.mdc` (scoped globs) → Subagents `.cursor/agents/` (paralelo) → Skills `.cursor/skills/<n>/SKILL.md` (on-demand) → Hooks `.cursor/hooks.json`.
- Skills também descobertas em `.claude/skills/.agents/skills/.codex/skills` (incl. nested/symlink).
- Hooks CLI 2026: `/plugin` marketplace instala skills/commands/subagents/MCP; `/skills` lista.
- **Antes marcado "limitado"** — hoje tem hooks nativos estáveis (command + prompt).

### gemini-cli — [geminicli.com/docs](https://geminicli.com/docs/), [antigravity.google/docs/cli](https://antigravity.google/docs/cli/getting-started)
- `GEMINI.md` hierárquico (configurável via `settings.json:context.fileName` para incluir `AGENTS.md`).
- Skills via `gemini skills` CLI + `/skills` TUI (`link --scope user|workspace`, `disable/enable`).
- Commands em TOML `.gemini/commands/*.toml` (v2.2 gated `--enterprise` para globais).
- **Transição 19/05/2026 (I/O):** `gemini` (Node) → `agy` (Go) para tiers individuais; enterprise mantém `gemini`. Adapter deve detectar `agy` vs `gemini`.

### antigravity (2.0 / agy / ide) — [antigravity.google/docs/{skills,cli/plugins,ide/skills}](https://antigravity.google/docs/skills)
- Antigravity 2.0: skills workspace `<ws>/.agents/skills/<n>/SKILL.md` + global `~/.gemini/config/skills/<n>/SKILL.md` (legado `.agent/skills`), estrutura `SKILL.md + scripts/examples/resources`.
- agy: workspace `.agents/skills/<n>.md` (cada skill vira slash `/<n>`) + global `~/.gemini/antigravity-cli/skills/`; plugins em `~/.gemini/antigravity-cli/plugins/<p>/` (`plugin.json`, `mcp_config.json`, `hooks.json`, `skills/`, `agents/`, `rules/`); bin `~/.local/bin/agy`.
- IDE: global `~/.gemini/antigravity/skills/` + workspace `.agents/skills/`; rules/workflows/hooks similares ao 2.0.

### codex — [learn.chatgpt.com/docs/build-skills](https://learn.chatgpt.com/docs/build-skills), [agentskills.io](https://agentskills.io), [openai/codex](https://github.com/openai/codex)
- `AGENTS.md` concatenado por diretório (closest wins), padrão aberto adotado por Cursor/Aider etc.
- Skills: `name` regex `^[a-z0-9]+(-[a-z0-9]+)*$`, `SKILL.md` + opcional `openai.yaml` (UI + MCP deps Codex-only).
- Descoberta: repo `.agents/skills/` + user `~/.agents/skills/` + admin `/etc/codex/skills/` + compat `.codex/skills/`; plugins via `.codex-plugin/plugin.json`.

## Como o adapter funciona
1. `spec-kit init` / `spec-kit analyze` gera artefatos do projeto (PRD, AGENTS.md, squad local).
2. O adapter do harness alvo **copia/gera**:
   - agents → pasta de agents do harness;
   - skills → pasta de skills (ou registra no plugin/context);
   - hooks → arquivo de hooks do harness (`settings.json` no claude/cursor/antigravity, `plugins` no opencode);
   - commands → pasta de commands/toml do harness.
3. `AGENTS.md` do projeto é a **fonte de verdade** lida por todos. Cross-harness via `session_id + harness` no ledger.

## Session bootstrap (todos os harnesses)
No início de **toda** session, o agente roda `session.classify`:
- **Projeto NOVO** → sugere `spec-kit init`.
- **Legado sem nossas specs** → sugere `spec-kit analyze`.
- **Legado com specs** → vai direto para o `before-task-sync`.

## Injeção de orquestração
A partir da **2ª interação**, `interaction.inject-orchestration` injeta o arquivo de orquestração (estado do squad + roteamento) no contexto.

## Referências (última verificação 30/08/2026)
- opencode: https://opencode.ai/docs/{agents,skills,commands,plugins}
- claude: https://code.claude.com/docs/en/{skills,hooks-guide,sub-agents}
- cursor: https://cursor.com/docs/{hooks,rules} + changelog 3.3–3.5
- gemini cli: https://geminicli.com/docs/{cli/skills,cli/gemini-md}
- antigravity: https://antigravity.google/docs/{skills,cli/plugins,ide/skills,cli/getting-started}
- codex: https://learn.chatgpt.com/docs/build-skills + https://agentskills.io/specification + https://github.com/openai/codex
