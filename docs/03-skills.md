# 03 — Skills (Catálogo)

Cada skill tem **nome amigável**, `id` técnico, **cargo** e **função** (mapa completo em `spec-kit.orchestration.json` → `skills.friendlyNames`). Catálogo global (templates) instanciado/local especializado por projeto. Skills globais atuam no **segundo plano** (silenciosa) mas podem ser chamadas pelo dev.

| Nome amigável | id | Tier | Gatilho / Quando age | O que entrega |
|---|---|---|---|---|
| Arquitetura Limpa | `clean-architecture` | global | ao definir estrutura | fronteiras e camadas adaptadas ao projeto |
| TDD | `tdd` | global | antes/ durante código | testes fixos de regra de negócio antes do código |
| ESLint | `eslint` | global | em edição/lint | lint e estilo |
| PHPUnit | `phpunit` | global | testes PHP | testes unitários |
| Playwright | `playwright` | global | testes e2e | e2e multi-navegador |
| Laravel | `laravel` | global | projeto Laravel | docs/padrões Laravel (Context7) |
| React | `react` | global | frontend React | padrões React (Context7) |
| Vue | `vue` | global | frontend Vue | padrões Vue (Context7) |
| Angular | `angular` | global | frontend Angular | padrões Angular (Context7) |
| Python | `python` | global | projeto Python | padrões Python (Context7) |
| TypeScript | `ts` | global | código TS | tipagem e padrões |
| Tailwind | `tailwind` | global | estilização | Tailwind v4 (Context7) |
| Bootstrap | `bootstrap` | global | estilização | Bootstrap CSS |
| WordPress | `wordpress` | global | projeto WP | padrões WP (Context7) |
| Linguagem Própria | `proprietary-lang` | global | stack proprietária | adapter específico |
| Pentest Reverso | `reverse-pentest` | global | verificação de segurança | checklist de vulns |
| Gerador de Docs | `doc-gen` | global | criação de documentação | gera AGENTS.md/context |
| Testes de Caracterização | `char-tests` | global | legado | cobre legado antes de alterar |
| Release Semântico | `semantic-release` | global | ship | commit/changelog/release |
| CI/CD | `ci-cd` | global | pipeline | build/deploy |
| SEO | `seo` | global | foco em SEO | boas práticas de busca |
| i18n | `i18n` | global | internacionalização | strings externalizadas |
| Performance | `performance` | global | foco em performance | budgets/otimização |
| Compra de Mídia | `media-buying` | global | foco em mídia | métricas de mídia |
| Design System | `design-system` | global | UI consistente | tokens/componentes |
| UX/UI | `ux-ui` | global | experiência | heurísticas de UX |
| Design Patterns | `design-patterns` | global | modelagem | padrões GoF/arquiteturais |
| Entrevista | `interview` | global | no PO | faz perguntas ao dev |
| Requisitos | `requirements` | global | no PO | levanta func/ não-func |
| Code Review | `code-review` | global | no Tech Lead | revisão técnica |
| Ralph Loop | `ralph-loop` | global | execução de task | loop iterativo por task (.sh) |
| Segurança de Pacotes | `pack-security` | global | instalação de pack | valida pack confiável |
| Segredos | `secrets` | global | gestão de env | vault/rotação |
| Contratos de API | `api-contracts` | global | antes de implementar | schema/OpenAPI |
| Estratégia | `strategy` | global | decisões | documenta estratégia |
| Orquestração | `orchestration` | global | roteamento | instrui quando chamar cada um |

## Como funcionam por harness
- **Global (segundo plano):** disparadas por **preinstruções** nas skills do projeto + definições de **hooks**; o dev raramente as invoca direto.
- **Local (especialista):** o generator instancia a skill conforme a stack do projeto e a liga ao agente correspondente; usam **Context7** para buscar documentação versionada (ex.: Laravel 13, React 19).
- **Onde vivem:** adapters copiam para a pasta de skills de cada harness (ver `01-harnesses.md`); o `AGENTS.md` referencia quais skills locais estão ativas.

## Exemplo de comportamento silencioso
Ao editar um controller Laravel, a skill global `eslint`/`laravel` roda em segundo plano (via hook `PostToolUse`) conferindo estilo e segurança, sem interromper o dev — a menos que encontre violação, quando dispara o organismo vivo (pára e avisa).
