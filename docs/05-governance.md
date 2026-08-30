# 05 — Governança: PRD, Ledger e Security Log

Toda alteração é rastreável. **DEFINIDO:** PRD, Ledger e Security Log são sempre **JSON + MD espelhados** (JSON é fonte para dashboard/generator, MD é leitura humana), lado a lado no mesmo `docs/`.

## PRD — Product Requirements Document (JSON + MD espelhados)
- **Caminhos:** `docs/PRD.json` (máquina) + `docs/PRD.md` (humano) — sempre sincronizados.
- **Para que:** guarda **todas as tasks** + **contexto compartilhado** do projeto.
- **Estrutura JSON (fonte):** `metadata {projeto, stack, harness, data}` · `sharedContext {objetivos, personas, stack, padrões, restrições}` · `features[]` · `tasks[] {id, feature, what, why, acceptanceCriteria, difficulty, model, status, assignee, tokens, prompts}` · `nonFunctionalRequirements`.
- **MD:** renderização legível do JSON (features + tasks com status).
- **Importante:** o PRD carrega o **melhor modelo do harness para cada tarefa** (definido pelo PO via catálogo `models/catalog.json`).

## Ledger de Orquestração (JSON + MD espelhados)
- **Caminhos:** `docs/ORCHESTRATION.json` + `docs/ORCHESTRATION.md` (espelhado, junto ao PRD).
- **Para que:** complementa o PRD — **o que foi feito, POR QUÊ, QUANDO** e métricas.
- **Campos:** `session_id` · `harness` · `task_id` · `what` · `why` · `when` · `developer` · `model` · `tokens` · `prompts` · `metrics` · `errors` · `changes` · `fixes` · `status`.
- **Continuidade:** `session_id + harness` permitem retomar em qualquer harness (ex: iniciou no Claude, terminou no opencode). Ver `09-projects-registry.md`.
- **Alimenta:** `integration.dashboard`.
- **Hook:** `ledger-record` (pós-alteração) preenche automaticamente.

## Security Log (JSON + MD espelhados)
- **Caminhos:** `docs/SECURITY_LOG.json` + `docs/SECURITY_LOG.md`.
- **Para que:** registra **erros, mudanças e correções** do pentest reverso (`security-gate`).
- **Estrutura:** `item` · `severidade` · `correção` · `status` · `arquivo`.

## Por que existe
- Controle total de alterações (rastreabilidade).
- Em multi-dev: sabemos quem fez, com qual modelo, quanto custou (tokens/prompts) e métricas — base para o dashboard.
- `ledger-record` + `security-gate` garantem preenchimento automático.
