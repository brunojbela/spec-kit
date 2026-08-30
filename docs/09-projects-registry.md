# 09 — Projects Registry e Continuidade entre Harnesses

## `init-projects`
Comando focado em analisar a **pasta de `projects`**, onde o usuário concentra todos os seus projetos.

- **Gatilho:** `spec-kit init-projects` (ou ao iniciar o pack).
- **Responsabilidade:** mapear **todos** os projetos (ativos ou históricos) do usuário.
- **Captura por projeto:**
  - nome do projeto
  - stack
  - se está usando o nosso SDD (sim/não)
  - link do repositório
  - controle de sessions do projeto
  - overview geral (resumo)
- **Armazenamento:** registry (ex.: `projects-registry.json` / `.md`) na pasta de `projects`.

Isso dá um **overview geral** de tudo que o usuário faz, centralizando conhecimento mesmo entre projetos distintos.

## Continuidade de sessão entre harnesses (retrocompatibilidade de contexto)
O SDD e a governança registram com clareza:
- **`session_id`** — identificador estável da sessão
- **`harness`** — qual harness foi utilizado

Isso permite **portar contexto entre harnesses**. Exemplo real: o usuário **inicia uma session no Claude Code e termina no opencode**. Como o `session_id` + `harness` estão no ledger/registry, o contexto é retomável em qualquer um dos 8 harnesses cobertos — com dezenas de combinações possíveis.

### Onde vive
- `orchestrationLedger` (governança) agora inclui `session_id` e `harness` em cada registro.
- `session.started` emite `session_id, harness, pid` (consumido pelo `projectsRegistry` e control-center).
- `project.instantiated` também alimenta o `projectsRegistry`.

### Fluxo
1. Sessão inicia em um harness → `session.started` registra `session_id` + `harness`.
2. Alterações gravam no ledger com esse `session_id`/`harness`.
3. Se o usuário continua em outro harness, o mesmo `session_id` é retomado e o contexto (PRD, ledger, AGENTS.md) é carregado — sem perder o fio.

> Essa ponte é a base para a **central de controle** (ver `control-center.orchestration.json`): watchdog detecta a sessão e o `trigger-dev` sinaliza o dono, independente do harness.
