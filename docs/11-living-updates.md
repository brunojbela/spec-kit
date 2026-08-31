# 11 — Organismo Vivo: Atualização e Reescrita de Instruções

O spec-kit **nunca congela**: a fonte (`spec-kit.orchestration.json` + `catalog/`) evolui e os projetos instalados precisam acompanhar. Este doc define o mecanismo (fonte: `governance.selfUpdate` no spec).

## Princípio: instruções são CACHE, dados são SOBERANIA
| Camada | Exemplos | Comportamento no update |
|---|---|---|
| **Fonte** | spec-kit.orchestration.json, catalog/agents, catalog/skills | sempre manda; re-materializada a cada update |
| **Cache (instruções instaladas)** | `.opencode/agents/*.md`, `.claude/skills/*`, `hooks.json`, `settings.json`, `commands`, seção "Squad spec-kit"/"Wiring" do AGENTS.md | **REESCRITA FORÇADA** a partir da fonte |
| **Dados do usuário** | docs/PRD.json+md, docs/ORCHESTRATION.json+md, docs/SECURITY_LOG.json+md, DOC_SYNC.json, docs/technical/**, docs/functional/**, AGENTS.md GLOBAL, código-fonte | **NUNCA tocados** |

## Stamp de instalação
`spec-kit init`/`analyze` gravam `.spec-kit/installed.json`:
```json
{ "pack": "spec-kit", "packVersion": "0.1.0", "stack": ["laravel","react"], "harnesses": ["opencode","claude-code"], "installedAt": "...", "updatedAt": "..." }
```
- O stamp guarda a **stack e os harnesses escolhidos** → o update repropaga exatamente onde foi instalado (inclusive se você usou `--harnesses`).

## Fluxo de update
```sh
spec-kit update --check   # só reporta: em dia / desatualizado (installed → current)
spec-kit update           # se stale: re-materializa fonte e reescreve o cache
spec-kit update --force   # reescreve mesmo com versões iguais (catálogo editado localmente)
```
Passos internos: 1) re-materializa `catalog/` do spec → 2) regenera squad/skills/hooks/commands por harness registrado → 3) substitui (idempotente) as seções geridas do AGENTS.md → 4) atualiza o stamp → 5) reporta o que mudou.

## Detecção automática (feedback loop)
O hook `session.classify` compara `stamp.packVersion` × `package.json` do pack a **toda sessão**. Stale → injeta no contexto do agente:
> ⚠ kit DESATUALIZADO (instalado X → fonte Y): sugira ao usuário "spec-kit update" nesta sessão.

Assim o próprio squad avisa — o organismo vivo percebe que cresceu.

## Memória viva (AGENTS.md GLOBAL)
- `update` **não sobrescreve** o AGENTS.md GLOBAL: ele é memória do relacionamento, acumulada pelos agents ao longo do tempo (`lib/personal.js` `appendMemory`).
- Convenções novas (ex.: CONCISÃO) entram nos **agents/skills** e no `PROJECT_CONTEXT.json` do projeto — não na memória pessoal.

## Regras
1. Mudou o comportamento de um agent/skill/hook? **Mude na fonte** (spec + docs/agents|skills), rode `node lib/materialize.js`, testes, release.
2. Projetos instalados descobrem sozinhos (session.classify) e atualizam com `spec-kit update`.
3. Update nunca apaga histórico (ledger/PRD/docs) nem re-pergunta (stack/harnesses vêm do stamp).
