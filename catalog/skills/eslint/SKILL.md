---
name: "eslint"
description: "Lint e padronização de código"
friendlyName: "ESLint"
cargo: "Guardador de Estilo"
funcao: "Lint e padronização de código"
tier: "global"
gatilho: "em edição de arquivo (PostToolUse) e pré-ship"
steps:
  - "Roda linter da stack (eslint/pint)."
  - "Se erro → bloqueia e sugere correção."
  - "Registra no ledger."
usesContext7: "quando aplicável"
---

# ESLint (`eslint`)

**Gatilho:** em edição de arquivo (PostToolUse) e pré-ship

## Como age (steps)
1. Roda linter da stack (eslint/pint). 2. Se erro → bloqueia e sugere correção. 3. Registra no ledger.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
