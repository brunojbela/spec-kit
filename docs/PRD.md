# PRD — Spec-Driven Development Kit (`spec-kit`) — 2026-08-30

> Fonte: `docs/PRD.json` (máquina) — este MD é espelho humano, **sem truncamento**.

## Metadata
- **project:** `spec-kit`
- **displayName:** `Spec-Driven Development Kit`
- **version:** `0.1.0`
- **owner:** `bbela`
- **language:** `pt-BR`
- **createdAt:** `2026-08-30`
- **harness:** `multi (opencode/claude/cursor/codex/gemini/agy/antigravity 2.0/ide)`
- **status:** `v0.1.0 — pack spec-kit implementado (33/33 tasks concluídas, 94 testes passando, TDD)`
- **source:** `spec-kit.orchestration.json + docs/01-10 + control-center.orchestration.json`

## Shared Context
- **Objetivo:** Construir o pack npm spec-kit: catálogo global generalista (templates) + generators de squad local 100% especialista por projeto (Context7), orquestrado por PO que entrevista, classifica dificuldade e escolhe modelo por task, com governança PRD+ledger JSON+MD, Ralph Loop por task, docs 100% técnico+funcional com DOC_SYNC, pentest reverso combinado, multi-harness 8 alvos.
- **Princípios:** Arquitetura limpa/organizada (clean architecture adaptada por projeto), Código pouco verboso, direto, seguindo ESLint, Testes unitários em TODAS as linguagens + TDD quando fizer sentido, QA forte e documentação 100% obrigatória, Cobertura total de domínios: performance, SEO, i18n, UX/UI, design-system, design-patterns, media-buying, security, Pentest reverso combinado (agente + hook gate + checklist + governance), Orquestração de TODAS as alterações via ledger de governança, Catálogo GLOBAL generalista + squad LOCAL 100% especialista (multiagent), Squad usa Context7 para docs específicas de stack/versão, PO entrevista o dev e assume papel de gerente de projeto (spec completa), Greenfield (spec-first) ≠ legado (verify-docs -> doc-gen -> spec/change)
- **Harnesses:** opencode, antigravity-2.0, antigravity-cli (agy), antigravity-ide, gemini-cli, claude-code, codex, cursor
- **Governança:** PRD.json+md (sharedContext+tasks) + ORCHESTRATION.json+md + SECURITY_LOG.json+md espelhados; ledger preenche via hook ledger-record
- **DocSync:** DOC_SYNC.json guia → multisubagents 1 func por agente → technical/functional
- **ModelSelection pendência:** PO usa models/catalog.json local hoje; pendente integração via central-de-controle MCP GET /models/recommend quando central finalizar (spec-kit integration.controlCenter PENDENTE)

## Features (14)
- **F01 — Pack NPM Scaffold:** Estrutura do pacote instalável
- **F02 — Catálogo Global — Agents:** 7 agents globais templates + 8 squad local + 1 exemplo, todos com nome amigável e how definido
- **F03 — Catálogo Global — Skills:** 36 skills templates com gatilho/steps, segundo plano via hooks
- **F04 — Harness Adapters (8 alvos):** Adapters que copiam agents/skills/hooks/commands para cada harness
- **F05 — Runtime — Hooks/Events/Commands/Sessions:** 7 hooks + 4 events canônicos + 5 commands (4 SDD + models refresh) + session bootstrap em todos harnesses
- **F06 — Governança:** PRD/ORCHESTRATION/SECURITY_LOG JSON+MD espelhados
- **F07 — Documentação 100% + Doc Sync + Doc-Gen Pipeline:** Garantir 100% documentado técnico+funcional, casos de uso com methods/class/component
- **F08 — Fluxo SDD + Dia a Dia + PO Protocol:** Fluxo canônico + before-task-sync + classificação dificuldade + matriz modelo por situação
- **F09 — Contexto Pessoal + Projects Registry:** AGENTS.md GLOBAL (memória viva) + entrevista first-run + mapeamento pasta projects + continuidade cross-harness
- **F10 — Segurança — Pentest Reverso:** Checklist 20 itens + security-gate bloqueante + SECURITY_LOG
- **F11 — Ralph Loop:** Loop iterativo por task (3-5 iterações, .sh chat limpo, validação em testes fixos)
- **F12 — Integração Central de Controle + Dashboard:** Central via de duas mãos (monitora/audita + recomenda modelo por harness); dashboard consome ledger
- **F13 — Docs Site + Navegação:** Docsify com _sidebar, README linkado, per-agent/per-skill files
- **F14 — Model Catalog:** Catálogo versionado de modelos/benchmarks para PO

## Tasks (33)

| # | Feature | O que faz (what) | Por que (why) | Critério de aceite | Dificuldade | Modelo | Deps | Status |
|---|---|---|---|---|---|---|---|---|
| T01 | F01 | Scaffold pack: package.json (name spec-kit, bin spec-kit), pastas catalog/agents, catalog/skills, generators/, harnesses/<alvo>/, schemas/, models/, mcp-servers/ | Base instalável; sem isso nada é distribuído | package.json válido, bin/spec-kit executável, npm pack dry-run ok, estrutura criada | trivial | claude-haiku-4-5 | — | concluída |
| T02 | F01 | CLI spec-kit (commander): comandos init, analyze, verify, init-projects, models refresh — com --help e --version | Interface do usuário; orquestra generators e adapters | spec-kit --help lista 5 comandos; testes unitários dos parsers | fácil | claude-haiku-4-5 | T01 | concluída |
| T03 | F01 | Schemas JSON: prd.schema.json, orchestration.schema.json, security.schema.json, doc-sync.schema.json, project-context.schema.json | Validação determinística para PRD/ledger gerados | schemas validam PRD.json e ORCHESTRATION.json de exemplo; teste de schema ok | médio | claude-sonnet-4-6 | T01 | concluída |
| T04 | F02 | Materializar catálogo global de agents (7) como arquivos markdown/templates em catalog/agents/ + registros em spec-kit.orchestration.json | Templates reutilizáveis generalistas | 7 arquivos em catalog/agents/*.md com frontmatter id/friendlyName/cargo/funcao/how; teste verifica 7 | médio | claude-sonnet-4-6 | T01 | concluída |
| T05 | F02 | Generator de squad local (8: po, techlead, dev-senior/pleno/junior, qa, security, docs) via Context7 por stack | Instanciar especialistas por projeto | generator recebe stack (ex: laravel+react) e gera .opencode/.claude/.cursor/... com agents especialistas; teste com 2 stacks (laravel13+react19 e python+fastapi) cobrindo os 8 agents; todo agent gerado valida contra schema | difícil | claude-opus-4-8 | T03, T04 | concluída |
| T06 | F02 | Example agent domain-engine (gestor-projects) como template de extensão por domínio | Provar extensibilidade | arquivo catalog/agents/domain-engine.md com scope app/Core/Domain e proibições; teste de exemplo | fácil | claude-haiku-4-5 | T04 | concluída |
| T07 | F03 | Materializar 36 skills templates em catalog/skills/<id>/SKILL.md com frontmatter name/description/gatilho/steps | Catálogo global segundo plano | 36 pastas com SKILL.md válidos (name regex ^[a-z0-9]+(-[a-z0-9]+)*$); teste conta 36 | médio | claude-sonnet-4-6 | T01 | concluída |
| T08 | F03 | Instanciação local de skills por stack (Context7) + wiring com agents | Tornar skills especialistas | generator mapeia stack→skills (laravel/react/etc.) e registra no AGENTS.md; teste verifica wiring | médio | claude-sonnet-4-6 | T05, T07 | concluída |
| T09 | F04 | Adapter opencode (agents→~/.config/opencode/agents + .opencode/agents, skills→.opencode/skills, commands→.opencode/commands, hooks→plugins .opencode/plugins) | Suporte harness opencode | adapter copia e valida com opencode docs; teste dry-run | médio | claude-sonnet-4-6 | T04, T07 | concluída |
| T10 | F04 | Adapter claude-code (~/.claude/agents, .claude/skills, .claude/commands, settings.json hooks) | Suporte harness claude | adapter gera settings.json hooks SessionStart/PreToolUse etc.; teste | médio | claude-sonnet-4-6 | T04, T07 | concluída |
| T11 | F04 | Adapter cursor (.cursor/agents, .cursor/skills, .cursor/hooks.json, .cursor/rules/*.mdc) | Suporte harness cursor | adapter gera hooks.json v1 + compat dirs; teste | médio | claude-sonnet-4-6 | T04, T07 | concluída |
| T12 | F04 | Adapter codex (.agents/skills + .codex/skills + .codex/hooks.json + AGENTS.md) | Suporte harness codex | adapter suporta ambos .agents e .codex; teste | médio | claude-sonnet-4-6 | T04, T07 | concluída |
| T13 | F04 | Adapters gemini-cli (.gemini/commands/*.toml, GEMINI.md, skills) e agy/antigravity (plugins em ~/.gemini/antigravity-cli/plugins, ~/.gemini/config/skills, ~/.gemini/antigravity/skills) | Suporte família Google (3 harnesses) | 3 adapters geram global/ws skills e plugin hooks.json; teste por harness (gemini-cli, agy, antigravity-ide) comparando caminhos gerados com snapshot esperado | difícil | claude-opus-4-8 | T04, T07 | concluída |
| T14 | F05 | Implementar 7 hooks com matriz por harness (session.classify, personal-interview, inject-orchestration, security-gate, ledger-record, docs-check, docs.sync) | Garantir organism vivo + governança + docs em todos harnesses | matriz 7 hooks × 8 harnesses = 56 mapeamentos para evento nativo por harness (ver 04-runtime.md); teste automatizado por par hook×harness | difícil | claude-opus-4-8 | T03, T09, T10, T11, T12, T13 | concluída |
| T15 | F05 | Implementar 4 events canônicos (change.recorded, security.violation, project.instantiated, session.started) consumidos por ledger/dashboard/control-center | Comunicação squad + observabilidade | events emitidos nos hooks corretos; teste de contrato payload | médio | claude-sonnet-4-6 | T03, T14 | concluída |
| T16 | F05 | Implementar 4 commands SDD (init, analyze, verify, init-projects) end-to-end (PO entrevista → PRD → squad); 5º comando models refresh em T33 | Fluxo SDD greenfield vs legado | spec-kit init cria AGENTS.md+PRD.json válidos por schema; analyze gera DOC_SYNC.json+char-tests mock; verify retorna exit 0/1 conforme gates; testes e2e dos 4 fluxos | difícil | claude-opus-4-8 | T02, T05, T08, T14, T15 | concluída |
| T17 | F05 | Session bootstrap + inject-orchestration (da 2ª interação) + session_id/harness cross-harness | Continuidade entre harnesses | session_id estável + harness gravados no ledger; teste inicia no claude e retoma no opencode | difícil | claude-opus-4-8 | T14, T15 | concluída |
| T18 | F06 | Gerar PRD/ORCHESTRATION/SECURITY_LOG como JSON+MD espelhados (schemas + render MD legível) | Governança rastreável | docs/PRD.json+md, ORCHESTRATION.json+md, SECURITY_LOG.json+md válidos e espelhados; teste compara JSON vs MD | médio | claude-sonnet-4-6 | T03 | concluída |
| T19 | F06 | Hook ledger-record pós-alteração preenche ORCHESTRATION.json (session_id, harness, task_id, model, tokens, prompts, metrics) | Rastreabilidade automática | após edit/write, ledger append com campos obrigatórios; teste simula alteração | médio | claude-sonnet-4-6 | T14, T18 | concluída |
| T20 | F07 | Implementar DOC_SYNC.json como manifest guia (módulo→feature→caso→classe→method/imports/requests/packages) | Garantir 100% cobertura documentável | DOC_SYNC.json com todos itens + status pendente/documentado; teste em projeto legado mock | médio | claude-sonnet-4-6 | T03 | concluída |
| T21 | F07 | Pipeline doc-gen Fase 1: análise ponta-a-ponta (Arqueólogo) que preenche DOC_SYNC.json sem documentar | Descoberta completa | Arqueólogo varre repo e preenche DOC_SYNC com 100% dos módulos/classes do mock (contagem via scanner estático), todos status=pendente e nenhum documentado; teste com gestor-projects | difícil | claude-opus-4-8 | T20 | concluída |
| T22 | F07 | Pipeline doc-gen Fase 2: multisubagents (1 func por agente) documentam em docs/technical/** e docs/functional/** (casos de uso com methods/class/component) | Cobertura 100% paralela | cada subagent documenta 1 funcionalidade do DOC_SYNC e marca status; ao final 100% dos itens status=documentado; docs/technical citam class/method e docs/functional citam casos/component; teste verifica que nenhum item fica sem dono | difícil | claude-opus-4-8 | T21 | concluída |
| T23 | F07 | Hook docs.sync mantém DOC_SYNC.json atualizado pós-alteração/pré-ship | Sincronia contínua | após write, DOC_SYNC atualizado (item novo→pendente, removido→retirado); teste com edit aditivo e deletivo | fácil | claude-haiku-4-5 | T14, T20 | concluída |
| T24 | F08 | Fluxo SDD canônico (init/analyze → interview/spec → plan → tasks → implement → verify → ship) + ramificação greenfield vs legado | Fluxo único para todos os projetos | fluxo documentado em 07-flow + implementado nos generators; teste de fluxo | médio | claude-sonnet-4-6 | T16 | concluída |
| T25 | F08 | PO before-task-sync (sync, valida prompt, classifica dificuldade trivial→extremo, escolhe modelo, monta PRD com modelo por task, traça plano, apresenta e delega) | Cérebro do dia a dia | PO gera PRD com modelo por task + plano por nível; teste com tasks mock cobrindo os 5 níveis (trivial→extremo) com plano e modelo distintos conforme matriz T26 | difícil | claude-opus-4-8 | T24, T26, T33 | concluída |
| T26 | F08 | Classificação dificuldade → plano e matriz modelo por situação explicada (matriz em 07-flow) | Gestão e alocação do PO | tabela trivial→extremo com plano + matriz modelo (refator→opus-4-8, edição rápida→haiku etc.) validada; teste | médio | claude-sonnet-4-6 | T24 | concluída |
| T27 | F09 | AGENTS.md GLOBAL (memória viva por harness) + entrevista pessoal first-run (6 campos) via hook session.personal-interview | Relacionamento humano | first-run roda entrevista de 6 campos e cria AGENTS.md GLOBAL por harness; 2ª execução não repete; teste | médio | claude-sonnet-4-6 | T14 | concluída |
| T28 | F09 | Projects registry (init-projects) mapeia pasta projects + cross-harness session_id/harness | Overview + continuidade | projects-registry.json+md com nome/stack/SDD?/repo/sessions/overview; teste com pasta mock | médio | claude-sonnet-4-6 | T16 | concluída |
| T29 | F10 | Security-gate: hook PreToolUse bloqueante + checklist 20 itens + SECURITY_LOG.json+md + supply-chain pack-security | Pentest reverso combinado | gate bloqueia commit com payload XSS/SQLi; SECURITY_LOG registra item/severidade/arquivo; teste com 1 fixture vulnerável e 1 limpo por categoria do checklist de 20 itens | difícil | claude-opus-4-8 | T14, T18 | concluída |
| T30 | F11 | Ralph Loop por task: .sh por task (chat limpo), loop PLAN→ACT→EVALUATE→TERMINATE 3-5 iterações, mudanças cirúrgicas, validação em testes fixos | Execução persistente | gerador cria .sh por task do PRD.json; simula task que falha 2x e passa na 3ª; máx 5 iterações com log por iteração; teste | difícil | claude-opus-4-8 | T18, T25 | concluída |
| T31 | F12 | Integração com central-de-controle (via de duas mãos): subida change.recorded/security.violation → data-monitor, descida GET /models/recommend → PO | Controle remoto de modelos | central disponível → PO consome MCP GET /models/recommend; central indisponível → fallback models/catalog.json local com "fallback" registrado no ledger; teste com central mockada online e offline | médio | claude-sonnet-4-6 | T18, T33 | concluída |
| T32 | F13 | Docsify site: docs/_sidebar.md + README linkado (62 mds) + index.html loadSidebar + per-agent/per-skill files | Leitura via docsify | docsify serve renderiza todos os mds; teste de links sem broken links | fácil | claude-haiku-4-5 | T04, T07 | concluída |
| T33 | F14 | Model catalog versionado (models/catalog.json) com cron semanal + comando models refresh | Manter benchmarks atualizados | catalog com 6 modelos iniciais {id, provider, preço in/out, sweBenchVerified, speed} válido por schema; refresh (cron ou comando) atualiza e mantém última versão válida se offline; teste offline usa fallback local | médio | claude-sonnet-4-6 | T02 | concluída |
