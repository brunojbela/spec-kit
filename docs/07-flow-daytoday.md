# 07 — Fluxo SDD e Dia a Dia

## Fluxo canônico (ramifica greenfield vs legado)
| Fase | Nome | Objetivo | Agentes | Artefatos |
|---|---|---|---|---|
| 0 | Init / Analyze | gerar docs + instanciar squad | Documentista, Arqueólogo | AGENTS.md, PROJECT_CONTEXT, squad/* |
| 1 | Interview / Spec (PO) | PO entrevista → spec/PRD | PO | docs/spec/*, PRD.json+md |
| 2 | Plan / Architecture | arquitetura/plano | Tech Lead | docs/plan/* |
| 3 | Tasks | tasks com aceite | PO, Tech Lead | docs/tasks/* |
| 4 | Implement (squad) | código TDD + padrões | Devs | src/** |
| 5 | Verify | lint, tipos, testes, SEGURANÇA | QA, Especialista de Segurança | ci, SECURITY_LOG.json+md |
| 6 | Ship | commit semântico, release, deploy | Tech Lead, Documentista | release |

- **Greenfield:** spec-first (via entrevista do PO).
- **Legado:** verify-docs → doc-gen → spec/change (com testes de caracterização antes de alterar).

## Protocolo do PO (before-task-sync) — DEFINIDO
Rotina **antes de cada task**:
1. sincronizar pensamento (sync)
2. validar entendimento do prompt
3. **classificar dificuldade** da tarefa
4. **escolher o melhor modelo do harness** para a tarefa (via `models/catalog.json`)
5. criar/atualizar PRD.json+md com contexto compartilhado + modelo por task
6. traçar **plano conforme o nível de dificuldade** (ver tabela abaixo)
7. **apresentar plano ao usuário e aguardar aprovação**
8. listar tasks e decidir multiagents
9. **delegar** agents/skills para controlar e executar (Ralph Loop com modelo definido)

## Classificação de dificuldade → plano (DEFINIDO)
| Nível | Plano | Quando usar (explicado) |
|---|---|---|
| trivial | 1 Dev Júnior + Ralph Loop enxuto (3 iterações) | typo, ajuste de texto, trocar cor, renomear variável — 1 arquivo, sem regra de negócio |
| fácil | Dev Júnior/Pleno + Ralph Loop (3) | CRUD simples, validação leve, endpoint sem regra complexa |
| médio | Dev Pleno + QA + Ralph Loop (4) | feature com regra de negócio clara, 2-3 arquivos, testes TDD |
| difícil | Dev Sênior + Tech Lead + QA + Ralph Loop (4-5) + possível multiagents | refator, integração externa, performance/segurança envolvidas |
| extremo | Tech Lead + Sênior + Pleno + QA + multiagents + Ralph Loop (5) | migração, arquitetura nova, legado sem docs, múltiplos sistemas |

## Seleção de modelo (PO) — DEFINIDO com pesquisa 30/08/2026

O PO escolhe o melhor modelo do harness para cada task usando um **catálogo versionado** `models/catalog.json` (não hard-coded):

```json
{ "id": "claude-opus-4-8", "provider": "anthropic", "contextWindow": 1000000, "inputPrice": 5, "outputPrice": 25, "sweBenchVerified": 88.6, "speed": "lento", "strengths": ["refator 50+ arquivos", "debug profundo"], "weaknesses": ["custo alto"] }
```

**Fonte dos benchmarks:** SWE-bench Verified (Vals AI, single-harness) + Scale SEAL SWE-bench Pro + provider pricing. Exemplos jul/2026: `gpt-5.6 Sol 96.2% ($5/$30)`, `claude-fable-5 95% ($10/$50)`, `claude-opus-4-8 88.6% ($5/$25)`, `claude-sonnet-4-6 79.6% ($3/$15)`, `claude-haiku-4-5 73.3% ($1/$5)` — ver `models/catalog.json`.

**Matriz de decisão explicada (o PO deve explicar a situação, não só mapear):**

| Situação da tarefa | Modelo recomendado | Por que (benchmark + trade-off) |
|---|---|---|
| Refator noturno, 50+ arquivos, risco alto | `claude-opus-4-8` | 69.2% SWE-bench Pro (vendor) + 1M contexto sem surcharge; caro mas evita retrabalho |
| Debug mais difícil / migração | `gpt-5.6 Sol` ou `fable-5` ou `opus-4-8` | 96.2%/95%/88.6% Verified (Vals AI) — top tier; escolher menor preço entre os 3 |
| Edição rápida, lint fix, subagent explore | `claude-haiku-4-5` | $1/$5, ~$0.13 por ponto Pro, cache $0.10/M — 10x mais barato; qualidade suficiente para 80% das tasks |
| Volume alto (CI review, geração de testes em lote) | `claude-sonnet-4-6` | 79.6% Verified + $3/$15 + Batch $1.5/$7.5 — throughput sem quebrar orçamento |
| Orçamento apertado, ainda bom | `kime-k3` / `deepseek v4` / `minimax m2.5` | 93.4%/80.6%/75% a fração do preço; open-weight auto-hospedável |

**Como manter atualizado (melhor forma pesquisada):**
1. `models/catalog.json` versionado no repo do pack (fonte da verdade).
2. Cron semanal (GitHub Action) que busca `SWE-bench Verified` (vals.ai), `llm-stats`, e pricing dos providers, abre PR automático com diff de `sweBenchVerified/inputPrice/outputPrice`.
3. Comando manual `spec-kit models refresh` para forçar atualização.
4. PO lê o catalog no `before-task-sync` e registra no PRD o `model` por task com justificativa (custo vs qualidade vs latência).

## Entrevista Pessoal (first-run)
Na **primeira interação** com o pack, o PO roda a **entrevista pessoal** que coleta:
- nome do usuário, nome do seu agente, como gosta de trabalhar, padrões preferidos, tom/idioma/verbosidade, itens que pede sempre.
O resultado gera/atualiza o **AGENTS.md GLOBAL** por harness (ver `08-personal-context.md` e `01-harnesses.md`).

## Organismo vivo
- Agents/skills **pausam** para tirar dúvidas (ambiguidade, alucinação). Em incerteza, **não inventam**.

## Nomes amigáveis
- Todo agent/skill tem nome legível (Maestro, Sentinela...) para saber quem age.

## Multisites
- Monorepos + sistemas interligados — squad coordena.

## Comunicação do squad — DEFINIDO
- **Todos se comunicam** via **eventos internos** (`change.recorded`, `security.violation` etc.) + **mensagens do Maestro** (skill `orchestration`).
- A skill `orchestration` instrui **quando** chamar cada agent/skill (tabela de orquestração).
- O arquivo de orquestração é injetado da 2ª interação em diante (`interaction.inject-orchestration` via `UserPromptSubmit/beforeSubmitPrompt`).
- **Exemplo de situação:** ao editar `api/users/route.ts`, `file.changed` dispara `eslint` + `laravel` + `security-gate` em paralelo; se `security-gate` bloqueia, emite `security.violation` → `SECURITY_LOG` + `Stop` impede ship.
