# 04 — Runtime: Hooks, Commands, Sessions e Events

> Fontes verificadas 2026-08-30, doc por doc: `code.claude.com/docs/en/hooks` (36+ eventos) · `cursor.com/docs/agent/hooks` (hooks.json v1) · `github.com/google-gemini/gemini-cli/docs/hooks/reference.md` · `github.com/openai/codex` (hooks.json/config.toml) · `opencode.ai/docs/plugins` (event bus) · `antigravity.google/docs/hooks` (2.0/ide) + `/docs/cli/headless` (agy).

## Onde vivem os hooks (settings por harness)
| Harness | Arquivo | Formato |
|---|---|---|
| claude-code | `~/.claude/settings.json` · `.claude/settings.json` (+`.local`) · plugin `hooks/hooks.json` · frontmatter de skill/subagent | `{hooks:{Evento:[{matcher,hooks:[{type:command,command,timeout,if}]}]}}` |
| cursor | `~/.cursor/hooks.json` · `.cursor/hooks.json` · enterprise/team (`/etc/cursor/hooks.json` etc.) | `{version:1,hooks:{evento:[{command,matcher,timeout,failClosed,loop_limit}]}}` |
| codex | `.codex/hooks.json` (+`~/.codex`) ou `config.toml [hooks]` | eventos no root; handlers `command`/`mcp_tool`; `additionalContextLimit` |
| gemini-cli | `~/.gemini/settings.json` · `.gemini/settings.json` · `/etc/gemini-cli/settings.json` | `{hooks:{Evento:[{matcher,hooks:[{command}]}],disabled:[]}}` |
| opencode | `.opencode/plugins/*.ts` (+`~/.config/opencode/plugins/`) · npm em `opencode.json:plugin` | módulo JS/TS: `tool.execute.before/after` + `event` bus |
| agy (antigravity-cli) | `~/.gemini/antigravity-cli/plugins/<p>/hooks.json` (+`plugin.json`) · `settings.json` · `/hooks` no TUI | eventos core `PreToolUse/PostToolUse/SessionStart/SessionEnd/Stop` |
| antigravity 2.0 | `.agents/hooks.json` (workspace) ou `~/.gemini/config/hooks.json` | **objetos nomeados**: `{nome:{Evento:[{matcher,hooks:[{command,timeout}]}]}}` |
| antigravity IDE | idem 2.0 (`.agents/` + `~/.gemini/antigravity/`) | idem |

## Matriz 7 hooks × 8 harnesses (com semântica nativa)
| Hook | claude | cursor | codex | gemini | opencode | agy | av 2.0/ide |
|---|---|---|---|---|---|---|---|
| session.classify | `SessionStart` (matcher startup/resume/clear) | `sessionStart` | `SessionStart` | `SessionStart` (source) | `session.created` (plugin) | `SessionStart` | `PreInvocation` |
| session.personal-interview | `SessionStart` + isFirstRun | `sessionStart` | `SessionStart` | `SessionStart` | `session.created` | `SessionStart` | `PreInvocation` |
| interaction.inject-orchestration | `UserPromptSubmit` → `additionalContext` | `beforeSubmitPrompt` | `UserPromptSubmit` → stdout | `BeforeAgent` → `additionalContext` | `tool.execute.before` | `PostToolUse` chain | `PreInvocation` → `injectSteps.ephemeralMessage` |
| security-gate | `PreToolUse` (matcher Bash\|Write\|Edit) → `permissionDecision:"deny"` + reason | `preToolUse`/`beforeShellExecution` → `{permission:"deny",agent_message}` | `PreToolUse` → exit 2 + stderr | `BeforeTool` → `{decision:"deny",reason}` (reason vira erro da tool p/ o agente) | `tool.execute.before` → throw | `PreToolUse` → `{decision:"deny",reason}` | `PreToolUse` → `{decision:"deny"\|"ask"\|"deny_unless_prior_grant",reason,permissionOverrides}` |
| ledger-record | `PostToolUse` + `FileChanged` | `postToolUse` + `afterFileEdit` | `PostToolUse` | `AfterTool` | `file.edited` + `tool.execute.after` | `PostToolUse` | `PostToolUse` |
| docs-check | `Stop` → `{decision:"block",reason}` **força continuar em chat** | `stop` → `{followup_message}` + `loop_limit` (5) | `Stop` → exit 2 + stderr | `AfterAgent` → `{decision:"deny",reason}` **retry automático** | `session.idle` (plugin) | `Stop` | `Stop` → `{decision:"continue",reason}` |
| docs.sync | `PostToolUse` | `afterFileEdit` | `PostToolUse` | `AfterTool` | `file.edited` | `PostToolUse` | `PostToolUse` |

**Todos os harnesses usam todos os 7 hooks** — o adapter mapeia evento E o formato de resposta (lib/harness-payloads.js).

## Ralph: headless (.sh) vs in-chat
| Harness | CLI headless | Comando | Erro de agente detectável | Ralph in-chat (Stop) |
|---|---|---|---|---|
| opencode | ✅ | `opencode run -m provider/model --auto --format json` | texto/stderr | ❌ (usar .sh) |
| claude-code | ✅ | `claude -p --model opus\|sonnet\|haiku --output-format json --permission-mode bypassPermissions` | JSON `is_error`/subtype | ✅ `Stop decision:block` |
| cursor | ✅ | `agent -p --model <slug> --output-format json` | `{is_error:true}` | ✅ `stop followup_message` |
| codex | ✅ | `codex exec -m <modelo> --json --dangerously-bypass-approvals-and-sandbox` | JSONL erro | ✅ `Stop` exit 2 |
| gemini-cli | ✅ | `gemini -p -m gemini-* --approval-mode yolo --output-format json` | JSON status | ✅ `AfterAgent deny` |
| agy | ✅ | `agy -p --model <slug> --output-format json --dangerously-skip-permissions --print-timeout 15m` | `{status:"ERROR"}` + falha alto em modelo inválido | ✅ `Stop` |
| antigravity 2.0 | ❌ sem CLI | **fallback: `agy`** (auth/harness compartilhados; `GEMINI_API_KEY` p/ CI) **→ `gemini` → Ralph in-chat** | — | ✅ `Stop decision:"continue"` + `executionNum` |
| antigravity IDE | ❌ sem CLI | idem 2.0 | — | ✅ idem |

- O gerador `.spec/ralph/<task>.sh` escolhe runner, modelo traduzido (`toNativeModel`) e `MAX` por dificuldade (trivial/fácil→3, médio→4, dif/extremo→5).
- **Erro do agente ≠ teste vermelho**: `isAgentError` aborta cedo (exit 4) sem queimar iterações.
- **Compressão de contexto**: iteração N+1 recebe só `tail -50` do erro + instrução de causa raiz (chat limpo stateless por design).
- Harness sem headless: o script SINALIZA que o Ralph seria a melhor opção, tenta `agy`→`gemini`, senão delega ao **Ralph in-chat** (Stop hook do docs-check já força continue com reason).

## Commands (CLI `spec-kit` + slash dentro dos harnesses)
Cada harness recebe os commands como **prompt de agente** (`.claude/commands/`, `.opencode/commands/`, `.gemini/commands/*.toml`, `.codex/prompts/`): o PO entrevista no chat e chama o CLI determinístico (`--yes`, sem TTY — o ambiente de tool de shell do agente não é interativo).
| Comando | Assinatura | O que faz |
|---|---|---|
| Init | `spec-kit init` | greenfield: PO entrevista → docs + instancia squad local (`--harnesses` ou seletor) |
| Analyze | `spec-kit analyze [repo]` | legado: verifica docs, doc-gen, entrevista, instancia squad |
| Init-Projects | `spec-kit init-projects` | mapeia pasta de projects → `projects-registry.json+md` |
| Verify | `spec-kit verify` | roda QA + security + grava ledger |
| Models refresh | `spec-kit models refresh` | atualiza catálogo de benchmarks (fallback offline) |

## Sessions
- **Início (session.classify):** decide init/analyze/sync e injeta contexto no formato nativo (`additionalContext`/`injectSteps`/`followup`).
- **Loop:** a cada task, PO roda `before-task-sync`; da 2ª interação em diante recebe arquivo de orquestração.
- **Organismo vivo:** qualquer agente pode **pausar** para perguntar ao usuário.
- **Continuidade:** `session_id` estável do kit + `native_session_id` do harness (session_id/conversation_id/conversationId) gravados no ledger → iniciar num harness e retomar em outro.

## Events (contratos internos — todos harnesses emitem/consumem)
| Evento | Fonte | Payload | Consumidores | Mapeamento harness |
|---|---|---|---|---|
| `change.recorded` | orchestrator | session_id, native_session_id, harness, task_id, developer, model, tokens, prompts, metrics | ledger, dashboard, control-center | `PostToolUse`/`file.edited`/`AfterTool` |
| `security.violation` | security-specialist | item, severidade, arquivo | SECURITY_LOG, hook gate, control-center | `PreToolUse` deny |
| `project.instantiated` | init/analyze | stack, squad gerado | orchestrator, control-center, projectsRegistry | `SessionStart` |
| `session.started` | watchdog | session_id, harness, pid | trigger-dev, projectsRegistry | `SessionStart`/`session.created` |

> Usage real por harness (`agy` envelope `usage.*`, claude `--output-format json`, codex JSONL) alimenta o ledger com tokens/custos reais (lib/harness-payloads.js `parseUsage`). Events alimentam dashboard e control-center (projeto separado, integração pendente).
