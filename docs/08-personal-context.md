# 08 — Contexto Pessoal: AGENTS.md Global e Entrevista Pessoal

O kit não trata o usuário como "mais um prompt". Ele constrói um **relacionamento mais humano** através de uma memória viva e de um onboarding personalizado.

## AGENTS.md GLOBAL (memória viva)
- **O que é:** um `AGENTS.md` **fora do projeto**, específico do usuário, que funciona como a memória do relacionamento.
- **Quem preenche:** os **próprios agents e skills** ao longo do tempo (não só o usuário). Conforme o uso, o Maestro e os especialistas anotam preferências, padrões recorrentes, correções e o estilo do usuário.
- **Onde vive (DEFINIDO, por harness):** `opencode: ~/.config/opencode/AGENTS.md` · `claude: ~/.claude/CLAUDE.md` · `codex: ~/.codex/AGENTS.md` · `cursor: ~/.cursor/rules + AGENTS.md` · `gemini: ~/.gemini/GEMINI.md` · `antigravity 2.0: ~/.gemini/config/AGENTS.md` · `agy: ~/.gemini/antigravity-cli/config/AGENTS.md` · `ide: ~/.gemini/antigravity/AGENTS.md` — separado do `AGENTS.md` do projeto.
- **Para que:** contexto inicial para respostas personalizadas e um vínculo mais natural — o agente sabe o **nome do usuário** e o **nome que ele deu ao seu agente**.

## Entrevista Pessoal (first-run)
- **Gatilho:** **primeira interação** do usuário com o pack (hook `session.personal-interview`).
- **Dono:** PO (ou agente de onboarding).
- **Objetivo:** entender como o usuário gosta de trabalhar e criar vínculo.
- **Campos coletados:**
  1. nome do usuário
  2. nome que o usuário vai dar para o **seu agente** (o assistente pessoal)
  3. como o usuário gosta de trabalhar (ritmo, autonomia, nível de detalhe)
  4. padrões/costumes que o usuário prefere
  5. como ele quer as respostas (tom, idioma, verbosidade, formato)
  6. itens que o usuário pede constantemente
- **Resultado:** gera/atualiza o **AGENTS.md GLOBAL** com o perfil do usuário.

## Comportamento contínuo
- A qualquer momento, se um agente detectar uma preferência ou correção do usuário, ele **atualiza o AGENTS.md GLOBAL** (via `ledger-record` ou hook dedicado — a definir).
- O `session.classify` e o `interaction.inject-orchestration` carregam esse contexto para todas as sessões, mantendo a consistência do relacionamento.
- Respeita sempre a regra do **organismo vivo**: em dúvida ou alucinação, pausa e pergunta.

## Relação com o AGENTS.md do projeto
| Arquivo | Escopo | Preenchido por | Gatilho |
|---|---|---|---|
| AGENTS.md GLOBAL | usuário (relacionamento) | agents/skills + usuário | first-run + uso contínuo |
| AGENTS.md do projeto | repositório (stack/convenções) | `init`/`analyze` | criação/análise do projeto |
