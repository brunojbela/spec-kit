# 10 — Estratégia de Documentação (técnica + funcional) e Doc Sync

Todos os projetos devem ser **100% documentados**, em duas dimensões e com análise granular. **DEFINIDO.**

## Tipos de documentação
- **Técnica:** arquitetura, módulos, features, classes, métodos, componentes.
- **Funcional:** casos de uso, regras de negócio, UX, comportamento esperado.
- **Casos de uso:** cada um explica **detalhadamente** os `methods` / `class` / `componentes` envolvidos.

## Granularidade da análise
1. **Módulo a módulo**
2. **Feature a feature**
3. **Caso de negócio a caso**
4. **Classe a classe**

## Doc Sync (`docs/DOC_SYNC.json`) — DEFINIDO
Manifest que lista todos os itens a documentar e seu status de cobertura. Hook `docs.sync` mantém atualizado a cada alteração/pré-ship.

### Pipeline doc-gen (legado ou greenfield) — DEFINIDO conforme sua definição

**Fase 1 — Análise ponta-a-ponta (1 agente orquestrador, sem documentar ainda):**
- Varre o projeto **de ponta a ponta**, levantando **funcionalidade por funcionalidade, módulo por módulo, classe por classe, cada method, todos os imports, requests, packages utilizados**.
- Durante a varredura, **preenche `docs/DOC_SYNC.json`** como **guia** (não documenta ainda): cada entrada tem `{id, modulo, feature, classe, methods[], imports[], requests[], packages[], status: "pendente", tipo: "tecnica|funcional"}` — todos os dados encontrados.

**Fase 2 — Documentação paralela por multisubagents (1 funcionalidade por subagent):**
- Dispara **multisubagents especialistas em paralelo**, cada um pega **apenas uma funcionalidade** do `DOC_SYNC.json`:
  - `Doc Técnico` (arquitetura, classes, methods),
  - `Regras de Negócio`,
  - `Requisitos Funcionais`,
  - `Requisitos Não-funcionais` (performance, segurança, etc.).
- Cada subagent documenta em `docs/technical/**` (técnica) e `docs/functional/**` (casos de uso com methods/class/componentes), marcando `status: "documentado"` no `DOC_SYNC.json`.
- Garantia de **cobertura completa**: 1 funcionalidade = 1 subagent; nenhum item fica sem dono.

### Processo (docSync)
1. analisar **módulo a módulo**
2. analisar **feature a feature**
3. analisar **caso de negócio a caso**
4. analisar **classe a classe** (methods, imports, requests, packages)
5. criar o `DOC_SYNC.json` com **todos os itens pendentes**
6. documentar **item a item, um a um** (multisubagents, 1 func por agente, técnico + funcional + casos de uso)

## Artefatos
| Arquivo | Conteúdo |
|---|---|
| `AGENTS.md` | instruções + contexto do projeto |
| `docs/PROJECT_CONTEXT.md` | stack, convenções, estrutura, gates |
| `docs/spec/*` · `docs/plan/*` · `docs/tasks/*` | spec / plan / tasks |
| `docs/technical/**` | documentação técnica por módulo/feature/classe/método/componente |
| `docs/functional/**` | casos de uso detalhados (methods/class/component) |
| `docs/DOC_SYNC.json` | manifest de itens + cobertura (guia da Fase 1, atualizado na Fase 2) |

## Quem faz
- **Arqueólogo** (Análise Fase 1) + **Documentista/Doc Master** (orquestra Fase 2) + multisubagents especialistas.
- Em greenfield, o mesmo pipeline roda após o `spec` (sem legado).

## Pasta `.spec/` — quartel-general do projeto (DEFINIDO 2026-08-30)
`.spec/` é o quartel-general ÚNICO do kit no projeto (v0.2.4 unificou o antigo `.spec-kit/`; migração automática no update): O QUE O PROJETO É + RUNTIME, separado de `docs/` (governança/histórico):

| Arquivo | Conteúdo | Dono |
|---|---|---|
| `.spec/standards.json+md` | **padrões vigentes** do projeto (PO seleciona do catálogo `standards` do kit na entrevista) | kit (update reescreve) |
| `.spec/queries/queries.jsonl` | **memória de consultas Context7**: `{ts, agent, skill, harness, libraryId, query, sources}` — evita re-consultar, dá auditabilidade | agents/skills (append; update NUNCA toca) |
| `.spec/features/<Fxx>.spec.md` | spec da feature (fase spec do SDD) | PO/squad (update não toca) |
| `.spec/features/<Fxx>.plan.md` | plano de implementação (fase plan) | techlead (update não toca) |
| `.spec/session.json` | runtime: `session_id` estável + harness atual (cross-harness) | hooks |
| `.spec/installed.json` | stamp: packVersion, stack, harnesses (base do `update`) | kit |
| `.spec/ralph/` | `<task>.sh` + prompt + logs do Ralph Loop | ralph |

- `session.classify` injeta pointer para standards e queries.
- Agents com `usesContext7` devem registrar a consulta em `queries.jsonl` **antes** de agir (regra no `how` gerado).
- API: `lib/spec-folder.js` (`initSpecFolder`, `recordQuery`, `readQueries`, `writeFeatureSpec`).

## Regra permanente: docs sempre atualizadas (`standards.docsAlwaysOn`)
> QUALQUER mudança no spec-kit (código, spec, catálogo, padrões) EXIGE atualização da documentação do projeto no mesmo commit: `docs/NN-*.md` afetados, README se mudou uso, catálogo via `materialize`, entrada no ledger. **Documentação desatualizada = task não concluída** (docs-check).

Vale para o próprio kit (dogfooding) e para todo projeto que o usa — está nos agents `docs-specialist`/`generalist-docs` e no fluxo de revisão do techlead.
