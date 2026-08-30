# Spec-Kit — Documentação do Kit de Desenvolvimento Dirigido por Especificação (SDD)

> Dono: `bbela` · Idioma padrão: `pt-BR` · Status: planejamento → documentação v1

Este kit é um **ecossistema de agents + skills + docs + hooks + events + commands** que codifica os padrões de engenharia do dono e opera como um **organismo vivo** em múltiplos harnesses (editores/CLIs de IA).

## Conceito em uma frase
Um **catálogo global generalista** é instanciado como um **squad local 100% especialista** por projeto (usando Context7 para docs da stack), coordenado por um PO que entrevista o dev, classifica a dificuldade, escolhe o melhor modelo do harness por tarefa e delega após aprovação.

## Modelo de 2 camadas
1. **Global (generalista)** — templates reutilizáveis de todos os papéis. Atuam no **segundo plano**, silenciosos, ajudando a manter padronização.
2. **Local (especialista)** — instanciados por projeto em formato de **squad**: PO, Tech Lead, Dev Sênior, Dev Pleno, Dev Júnior, QA, Especialista de Segurança, Especialista de Docs. Usam Context7.

## Princípios
- Arquitetura limpa adaptada por projeto · código direto e pouco verboso · TDD **obrigatório** (testes fixos de regra de negócio) · QA forte · documentação 100% · pentest reverso combinado · governança (PRD + ledger) · multiagents + multisites · Ralph Loop.

## Regras de comportamento (organismo vivo)
- Agents/skills **pausam o projeto** para tirar dúvidas com o usuário quando há ambiguidade, dúvida ou **alucinação**. Nunca inventam em caso de incerteza.
- Todos os agents/skills têm **nomes amigáveis** para leitura humana de quem está agindo a cada momento.

## Índice desta documentação
- [01-harnesses.md](01-harnesses.md) — os 8 harnesses e onde cada artefato vive.
- [02-agents.md](02-agents.md) — visão geral dos agents (detalhe: um arquivo por agent em `agents/`).
- [03-skills.md](03-skills.md) — catálogo de skills (detalhe: um arquivo por skill em `skills/`).
- [04-runtime.md](04-runtime.md) — hooks, commands, sessions e events.
- [05-governance.md](05-governance.md) — PRD, ledger de orquestração e security log.
- [06-ralph-loop.md](06-ralph-loop.md) — o loop iterativo por task.
- [07-flow-daytoday.md](07-flow-daytoday.md) — fluxo SDD, protocolo do PO e dia a dia.
- [08-personal-context.md](08-personal-context.md) — AGENTS.md global (memória viva) e entrevista pessoal no first-run.
- [09-projects-registry.md](09-projects-registry.md) — init-projects: mapeia a pasta de projects e continuidade de sessão entre harnesses.
- [10-documentation-strategy.md](10-documentation-strategy.md) — documentação técnica+funcional, casos de uso e Doc Sync (item a item).

### Agents — um arquivo por agent
- [Maestro (`orchestrator`)](agents/orchestrator.md) — Orquestrador-Chefe
- [Codificador (`generalist-implementer`)](agents/generalist-implementer.md) — Engenheiro de Implementação (Base)
- [Garantidor (`generalist-qa`)](agents/generalist-qa.md) — Analista de Qualidade (Base)
- [Sentinela (`generalist-security`)](agents/generalist-security.md) — Auditor de Segurança (Base)
- [Documentista (`generalist-docs`)](agents/generalist-docs.md) — Arquivista (Base)
- [Arqueólogo (`legacy-analyzer`)](agents/legacy-analyzer.md) — Analista de Legado
- [Vigiador (`pack-security`)](agents/pack-security.md) — Auditor de Supply-Chain
- [PO (`po`)](agents/po.md) — Gerente de Produto (Product Owner)
- [Tech Lead (`techlead`)](agents/techlead.md) — Líder Técnico
- [Dev Sênior (`dev-senior`)](agents/dev-senior.md) — Desenvolvedor Sênior
- [Dev Pleno (`dev-pleno`)](agents/dev-pleno.md) — Desenvolvedor Pleno
- [Dev Júnior (`dev-junior`)](agents/dev-junior.md) — Desenvolvedor Júnior
- [QA (`qa`)](agents/qa.md) — Especialista de QA
- [Segurança (`security-specialist`)](agents/security-specialist.md) — Especialista de Segurança
- [Doc Master (`docs-specialist`)](agents/docs-specialist.md) — Especialista de Documentação
- [Motor do Domínio (`domain-engine`)](agents/domain-engine.md) — Engenheiro de Domínio

### Skills — um arquivo por skill
- [Arquitetura Limpa (`clean-architecture`)](skills/clean-architecture.md) — Aplica fronteiras e camadas adaptadas ao projeto
- [TDD (`tdd`)](skills/tdd.md) — Testes fixos de regra de negócio antes do código
- [ESLint (`eslint`)](skills/eslint.md) — Lint e padronização de código
- [PHPUnit (`phpunit`)](skills/phpunit.md) — Testes unitários em PHP
- [Playwright (`playwright`)](skills/playwright.md) — Testes end-to-end multi-navegador
- [Laravel (`laravel`)](skills/laravel.md) — Padrões e docs Laravel (Context7)
- [React (`react`)](skills/react.md) — Padrões e docs React (Context7)
- [Vue (`vue`)](skills/vue.md) — Padrões e docs Vue (Context7)
- [Angular (`angular`)](skills/angular.md) — Padrões e docs Angular (Context7)
- [Python (`python`)](skills/python.md) — Padrões e docs Python (Context7)
- [TypeScript (`ts`)](skills/ts.md) — Tipagem e padrões TypeScript
- [Tailwind (`tailwind`)](skills/tailwind.md) — Tailwind v4 (Context7)
- [Bootstrap (`bootstrap`)](skills/bootstrap.md) — Bootstrap CSS
- [WordPress (`wordpress`)](skills/wordpress.md) — Padrões e docs WordPress (Context7)
- [Linguagem Própria (`proprietary-lang`)](skills/proprietary-lang.md) — Adapter para stack proprietária
- [Pentest Reverso (`reverse-pentest`)](skills/reverse-pentest.md) — Checklist de vulnerabilidades conhecidas
- [Gerador de Docs (`doc-gen`)](skills/doc-gen.md) — Gera AGENTS.md/context
- [Testes de Caracterização (`char-tests`)](skills/char-tests.md) — Cobre legado antes de alterar
- [Release Semântico (`semantic-release`)](skills/semantic-release.md) — Commit/changelog/release
- [CI/CD (`ci-cd`)](skills/ci-cd.md) — Build/deploy
- [SEO (`seo`)](skills/seo.md) — Boas práticas de SEO
- [i18n (`i18n`)](skills/i18n.md) — Strings externalizadas
- [Performance (`performance`)](skills/performance.md) — Budgets e otimização
- [Compra de Mídia (`media-buying`)](skills/media-buying.md) — Métricas de mídia
- [Design System (`design-system`)](skills/design-system.md) — Tokens/componentes
- [UX/UI (`ux-ui`)](skills/ux-ui.md) — Heurísticas de UX
- [Design Patterns (`design-patterns`)](skills/design-patterns.md) — Padrões GoF/arquiteturais
- [Entrevista (`interview`)](skills/interview.md) — Faz perguntas ao dev (PO)
- [Requisitos (`requirements`)](skills/requirements.md) — Levanta func/ não-func
- [Code Review (`code-review`)](skills/code-review.md) — Revisão técnica (Tech Lead)
- [Ralph Loop (`ralph-loop`)](skills/ralph-loop.md) — Loop iterativo por task (.sh)
- [Segurança de Pacotes (`pack-security`)](skills/pack-security.md) — Valida pack confiável
- [Segredos (`secrets`)](skills/secrets.md) — Gestão de env/vault
- [Contratos de API (`api-contracts`)](skills/api-contracts.md) — Schema/OpenAPI
- [Estratégia (`strategy`)](skills/strategy.md) — Documenta decisões
- [Orquestração (`orchestration`)](skills/orchestration.md) — Instrui quando chamar cada um

### Agents — um arquivo por agent
- [Maestro (`orchestrator`)](agents/orchestrator.md) — Orquestrador-Chefe
- [Codificador (`generalist-implementer`)](agents/generalist-implementer.md) — Engenheiro de Implementação (Base)
- [Garantidor (`generalist-qa`)](agents/generalist-qa.md) — Analista de Qualidade (Base)
- [Sentinela (`generalist-security`)](agents/generalist-security.md) — Auditor de Segurança (Base)
- [Documentista (`generalist-docs`)](agents/generalist-docs.md) — Arquivista (Base)
- [Arqueólogo (`legacy-analyzer`)](agents/legacy-analyzer.md) — Analista de Legado
- [Vigiador (`pack-security`)](agents/pack-security.md) — Auditor de Supply-Chain
- [PO (`po`)](agents/po.md) — Gerente de Produto (Product Owner)
- [Tech Lead (`techlead`)](agents/techlead.md) — Líder Técnico
- [Dev Sênior (`dev-senior`)](agents/dev-senior.md) — Desenvolvedor Sênior
- [Dev Pleno (`dev-pleno`)](agents/dev-pleno.md) — Desenvolvedor Pleno
- [Dev Júnior (`dev-junior`)](agents/dev-junior.md) — Desenvolvedor Júnior
- [QA (`qa`)](agents/qa.md) — Especialista de QA
- [Segurança (`security-specialist`)](agents/security-specialist.md) — Especialista de Segurança
- [Doc Master (`docs-specialist`)](agents/docs-specialist.md) — Especialista de Documentação
- [Motor do Domínio (`domain-engine`)](agents/domain-engine.md) — Engenheiro de Domínio

### Skills — um arquivo por skill
- [Arquitetura Limpa (`clean-architecture`)](skills/clean-architecture.md) — Aplica fronteiras e camadas adaptadas ao projeto
- [TDD (`tdd`)](skills/tdd.md) — Testes fixos de regra de negócio antes do código
- [ESLint (`eslint`)](skills/eslint.md) — Lint e padronização de código
- [PHPUnit (`phpunit`)](skills/phpunit.md) — Testes unitários em PHP
- [Playwright (`playwright`)](skills/playwright.md) — Testes end-to-end multi-navegador
- [Laravel (`laravel`)](skills/laravel.md) — Padrões e docs Laravel (Context7)
- [React (`react`)](skills/react.md) — Padrões e docs React (Context7)
- [Vue (`vue`)](skills/vue.md) — Padrões e docs Vue (Context7)
- [Angular (`angular`)](skills/angular.md) — Padrões e docs Angular (Context7)
- [Python (`python`)](skills/python.md) — Padrões e docs Python (Context7)
- [TypeScript (`ts`)](skills/ts.md) — Tipagem e padrões TypeScript
- [Tailwind (`tailwind`)](skills/tailwind.md) — Tailwind v4 (Context7)
- [Bootstrap (`bootstrap`)](skills/bootstrap.md) — Bootstrap CSS
- [WordPress (`wordpress`)](skills/wordpress.md) — Padrões e docs WordPress (Context7)
- [Linguagem Própria (`proprietary-lang`)](skills/proprietary-lang.md) — Adapter para stack proprietária
- [Pentest Reverso (`reverse-pentest`)](skills/reverse-pentest.md) — Checklist de vulnerabilidades conhecidas
- [Gerador de Docs (`doc-gen`)](skills/doc-gen.md) — Gera AGENTS.md/context
- [Testes de Caracterização (`char-tests`)](skills/char-tests.md) — Cobre legado antes de alterar
- [Release Semântico (`semantic-release`)](skills/semantic-release.md) — Commit/changelog/release
- [CI/CD (`ci-cd`)](skills/ci-cd.md) — Build/deploy
- [SEO (`seo`)](skills/seo.md) — Boas práticas de SEO
- [i18n (`i18n`)](skills/i18n.md) — Strings externalizadas
- [Performance (`performance`)](skills/performance.md) — Budgets e otimização
- [Compra de Mídia (`media-buying`)](skills/media-buying.md) — Métricas de mídia
- [Design System (`design-system`)](skills/design-system.md) — Tokens/componentes
- [UX/UI (`ux-ui`)](skills/ux-ui.md) — Heurísticas de UX
- [Design Patterns (`design-patterns`)](skills/design-patterns.md) — Padrões GoF/arquiteturais
- [Entrevista (`interview`)](skills/interview.md) — Faz perguntas ao dev (PO)
- [Requisitos (`requirements`)](skills/requirements.md) — Levanta func/ não-func
- [Code Review (`code-review`)](skills/code-review.md) — Revisão técnica (Tech Lead)
- [Ralph Loop (`ralph-loop`)](skills/ralph-loop.md) — Loop iterativo por task (.sh)
- [Segurança de Pacotes (`pack-security`)](skills/pack-security.md) — Valida pack confiável
- [Segredos (`secrets`)](skills/secrets.md) — Gestão de env/vault
- [Contratos de API (`api-contracts`)](skills/api-contracts.md) — Schema/OpenAPI
- [Estratégia (`strategy`)](skills/strategy.md) — Documenta decisões
- [Orquestração (`orchestration`)](skills/orchestration.md) — Instrui quando chamar cada um

### Agents — um arquivo por agent
- [Maestro (`orchestrator`)](agents/orchestrator.md) — Orquestrador-Chefe
- [Codificador (`generalist-implementer`)](agents/generalist-implementer.md) — Engenheiro de Implementação (Base)
- [Garantidor (`generalist-qa`)](agents/generalist-qa.md) — Analista de Qualidade (Base)
- [Sentinela (`generalist-security`)](agents/generalist-security.md) — Auditor de Segurança (Base)
- [Documentista (`generalist-docs`)](agents/generalist-docs.md) — Arquivista (Base)
- [Arqueólogo (`legacy-analyzer`)](agents/legacy-analyzer.md) — Analista de Legado
- [Vigiador (`pack-security`)](agents/pack-security.md) — Auditor de Supply-Chain
- [PO (`po`)](agents/po.md) — Gerente de Produto (Product Owner)
- [Tech Lead (`techlead`)](agents/techlead.md) — Líder Técnico
- [Dev Sênior (`dev-senior`)](agents/dev-senior.md) — Desenvolvedor Sênior
- [Dev Pleno (`dev-pleno`)](agents/dev-pleno.md) — Desenvolvedor Pleno
- [Dev Júnior (`dev-junior`)](agents/dev-junior.md) — Desenvolvedor Júnior
- [QA (`qa`)](agents/qa.md) — Especialista de QA
- [Segurança (`security-specialist`)](agents/security-specialist.md) — Especialista de Segurança
- [Doc Master (`docs-specialist`)](agents/docs-specialist.md) — Especialista de Documentação
- [Motor do Domínio (`domain-engine`)](agents/domain-engine.md) — Engenheiro de Domínio

### Skills — um arquivo por skill
- [Arquitetura Limpa (`clean-architecture`)](skills/clean-architecture.md) — Aplica fronteiras e camadas adaptadas ao projeto
- [TDD (`tdd`)](skills/tdd.md) — Testes fixos de regra de negócio antes do código
- [ESLint (`eslint`)](skills/eslint.md) — Lint e padronização de código
- [PHPUnit (`phpunit`)](skills/phpunit.md) — Testes unitários em PHP
- [Playwright (`playwright`)](skills/playwright.md) — Testes end-to-end multi-navegador
- [Laravel (`laravel`)](skills/laravel.md) — Padrões e docs Laravel (Context7)
- [React (`react`)](skills/react.md) — Padrões e docs React (Context7)
- [Vue (`vue`)](skills/vue.md) — Padrões e docs Vue (Context7)
- [Angular (`angular`)](skills/angular.md) — Padrões e docs Angular (Context7)
- [Python (`python`)](skills/python.md) — Padrões e docs Python (Context7)
- [TypeScript (`ts`)](skills/ts.md) — Tipagem e padrões TypeScript
- [Tailwind (`tailwind`)](skills/tailwind.md) — Tailwind v4 (Context7)
- [Bootstrap (`bootstrap`)](skills/bootstrap.md) — Bootstrap CSS
- [WordPress (`wordpress`)](skills/wordpress.md) — Padrões e docs WordPress (Context7)
- [Linguagem Própria (`proprietary-lang`)](skills/proprietary-lang.md) — Adapter para stack proprietária
- [Pentest Reverso (`reverse-pentest`)](skills/reverse-pentest.md) — Checklist de vulnerabilidades conhecidas
- [Gerador de Docs (`doc-gen`)](skills/doc-gen.md) — Gera AGENTS.md/context
- [Testes de Caracterização (`char-tests`)](skills/char-tests.md) — Cobre legado antes de alterar
- [Release Semântico (`semantic-release`)](skills/semantic-release.md) — Commit/changelog/release
- [CI/CD (`ci-cd`)](skills/ci-cd.md) — Build/deploy
- [SEO (`seo`)](skills/seo.md) — Boas práticas de SEO
- [i18n (`i18n`)](skills/i18n.md) — Strings externalizadas
- [Performance (`performance`)](skills/performance.md) — Budgets e otimização
- [Compra de Mídia (`media-buying`)](skills/media-buying.md) — Métricas de mídia
- [Design System (`design-system`)](skills/design-system.md) — Tokens/componentes
- [UX/UI (`ux-ui`)](skills/ux-ui.md) — Heurísticas de UX
- [Design Patterns (`design-patterns`)](skills/design-patterns.md) — Padrões GoF/arquiteturais
- [Entrevista (`interview`)](skills/interview.md) — Faz perguntas ao dev (PO)
- [Requisitos (`requirements`)](skills/requirements.md) — Levanta func/ não-func
- [Code Review (`code-review`)](skills/code-review.md) — Revisão técnica (Tech Lead)
- [Ralph Loop (`ralph-loop`)](skills/ralph-loop.md) — Loop iterativo por task (.sh)
- [Segurança de Pacotes (`pack-security`)](skills/pack-security.md) — Valida pack confiável
- [Segredos (`secrets`)](skills/secrets.md) — Gestão de env/vault
- [Contratos de API (`api-contracts`)](skills/api-contracts.md) — Schema/OpenAPI
- [Estratégia (`strategy`)](skills/strategy.md) — Documenta decisões
- [Orquestração (`orchestration`)](skills/orchestration.md) — Instrui quando chamar cada um

## Harnesses suportados (v1)
opencode · antigravity 2.0 · antigravity cli (agy) · antigravity ide · gemini-cli · claude-code · codex · cursor.

O pack npm (`spec-kit`) gera **adapters** que copiam agents/skills/hooks/commands para os locais certos de cada harness (ver `01-harnesses.md`).
