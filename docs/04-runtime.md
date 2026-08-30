# 04 — Runtime: Hooks, Commands, Sessions e Events

## Hooks (DEFINIDO — 7 hooks, todos harnesses implementam via adapter nativo)

Cada hook tem um `evento` nativo do harness, uma `ação` e um `porquê`. O adapter traduz.

| # | Hook (nosso) | Evento nativo por harness | Quando dispara |
|---|---|---|---|
| 1 | `session.classify` — bootstrap de toda session | claude `SessionStart` · cursor `sessionStart` · opencode `session.created` (plugin) · codex `SessionStart` · gemini `SessionStart` (source `startup\|resume\|clear`) · agy `SessionStart` · antigravity 2.0/ide `SessionStart` | início de **toda** session |
| 2 | `session.personal-interview` — entrevista pessoal first-run | mesmo `SessionStart` mas com condição `isFirstRun` | primeira interação do usuário com o pack |
| 3 | `interaction.inject-orchestration` — injeta orquestração | claude `UserPromptSubmit` · cursor `beforeSubmitPrompt` · opencode `tool.before.*` (via plugin) · codex `UserPromptSubmit` · gemini `BeforeAgent` · agy `PreToolUse`+`PostToolUse` chain | toda interação **a partir da 2ª** |
| 4 | `security-gate` — pentest reverso bloqueante | claude `PreToolUse` (matcher `Bash\|Write\|Edit`, decision `block`) · cursor `preToolUse`+`beforeShellExecution` · opencode `tool.before.bash/write` (exit 2) · codex `PreToolUse` · gemini `BeforeTool` · agy `PreToolUse` | `PreCommit` / `PostToolUse` / antes de tool |
| 5 | `ledger-record` — registra orquestração | claude `PostToolUse` · cursor `postToolUse`+`afterShellExecution` · opencode `file.changed` + `tool.after.*` · codex `PostToolUse` · gemini `AfterTool` · agy `PostToolUse` | pós-alteração |
| 6 | `docs-check` — exige docs | claude `Stop` / `PreCompact` · cursor `stop`+`preCompact` · opencode `session.idle` · codex `Stop` · gemini `AfterAgent` · agy `Stop` | pré-ship |
| 7 | `docs.sync` — mantém DOC_SYNC.json | mesmo que `ledger-record` + `docs-check` | pós-alteração / pré-ship |

**Fontes verificadas 30/08/2026:** claude `settings.json hooks` (21 eventos), cursor `hooks.json v1`, opencode `hooks.yaml` (`session.created/file.changed/tool.before.*`), codex `.codex/hooks.json` (5 eventos), gemini `settings.json hooks BeforeTool/AfterTool/SessionStart`, agy `~/.gemini/antigravity-cli/plugins/<p>/hooks.json PreToolUse/PostToolUse`.

## Adapter por harness — como aplicar
- **claude-code:** `.claude/settings.json` (+ `~/.claude/settings.json`) `hooks: { SessionStart: [{matcher, hooks:[{type:command, command}]}] }` — ver `/hooks` no TUI.
- **cursor:** `.cursor/hooks.json` (ou `~/.cursor/hooks.json`) `{version:1, hooks:{sessionStart:[{command}], preToolUse:[{command, matcher}], postToolUse:[...]}}` — `beforeShellExecution/afterShellExecution` também.
- **opencode:** plugin JS/TS em `.opencode/plugins/*.ts` (`@opencode-ai/plugin`, eventos `tool.execute.before/after`) OU `hooks.yaml` (`session.created`, `file.changed`, `tool.before.*`, `tool.after.*`) — preferir `file.changed` para file-oriented.
- **codex:** `.codex/hooks.json` (ou `~/.codex/hooks.json`) — eventos no root `{SessionStart:[{hooks:[{type:command,command}]}]}` ou `config.toml [hooks]` — eventos `SessionStart/UserPromptSubmit/PreToolUse/PostToolUse/Stop/PreCompact/PostCompact`.
- **gemini-cli:** `.gemini/settings.json` (+ `~/.gemini/settings.json` + `/etc/gemini-cli/settings.json`) `hooks:{BeforeTool:[{matcher, hooks:[{command}]}]}` — SessionStart com `source` startup/resume/clear.
- **agy (antigravity-cli):** `~/.gemini/antigravity-cli/plugins/<plugin>/hooks.json` + `settings.json` — 5 eventos core `PreToolUse/PostToolUse/SessionStart/SessionEnd/Stop` — comando `agy plugin {list,install,enable,disable,uninstall}`.
- **antigravity 2.0:** `~/.gemini/config/skills` global + `hooks.json` por plugin; **antigravity ide:** `~/.gemini/antigravity/skills` + `hooks.json` por plugin — mesma semântica agy.

**Todos os harnesses usam todos os 7 hooks** — o adapter mapeia para o evento nativo acima. A `session.classify` garante que toda session inicial suba com `AGENTS.md + PRD + ORCHESTRATION` via `SessionStart/session.created` com `additionalContext`.

## Commands (CLI `spec-kit`)
| Comando | Assinatura | O que faz |
|---|---|---|
| Init | `spec-kit init` | greenfield: PO entrevista → docs + instancia squad local |
| Analyze | `spec-kit analyze [repo]` | legado: verifica docs, doc-gen, entrevista, instancia squad |
| Init-Projects | `spec-kit init-projects` | mapeia pasta de projects (stack, SDD?, repo, sessions) → `projects-registry.json+md` |
| Verify | `spec-kit verify` | roda QA + security + grava ledger |

## Sessions
- **Início (session.classify):** `SessionStart/session.created` decide init/analyze/sync e injeta contexto (`additionalContext` com AGENTS.md+PRD).
- **Loop:** a cada task, PO roda `before-task-sync`; da 2ª interação em diante recebe arquivo de orquestração.
- **Organismo vivo:** qualquer agente pode **pausar** (via `AskUserQuestion` → hook `PreToolUse` não bloqueia mas registra) para perguntar ao usuário.

## Events (contratos internos — todos harnesses emitem/consumem)
| Evento | Fonte | Payload | Consumidores | Mapeamento harness |
|---|---|---|---|---|
| `change.recorded` | orchestrator | session_id, harness, task_id, developer, model, tokens, prompts, metrics | ledger, dashboard, control-center | via `PostToolUse/file.changed/AfterTool` |
| `security.violation` | security-specialist | item, severidade, arquivo | SECURITY_LOG, hook gate, control-center | via `PreToolUse` block |
| `project.instantiated` | init/analyze | stack, squad gerado | orchestrator, control-center, projectsRegistry | via `SessionStart` + `project.instantiated` |
| `session.started` | watchdog | session_id, harness, pid | trigger-dev, projectsRegistry | via `SessionStart/session.created` |

## Continuidade entre harnesses
Cada sessão tem **`session_id` estável + `harness`**, registrados no ledger e `projectsRegistry`. Permite retrocompatibilidade: iniciar no Claude e terminar no opencode (ou qualquer combinação dos 8, dezenas de combos). Ver `09-projects-registry.md`.

> Events alimentam dashboard e control-center (`control-center.orchestration.json`).
