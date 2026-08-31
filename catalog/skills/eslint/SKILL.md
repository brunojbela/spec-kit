---
name: "eslint"
description: "Lint e padronização de código"
friendlyName: "ESLint"
cargo: "Guardador de Estilo"
funcao: "Lint e padronização de código"
tier: "global"
gatilho: "em edição de arquivo (PostToolUse) e pré-ship"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Roda linter da stack (eslint/pint)."
  - "Se erro → bloqueia e sugere correção."
  - "Registra no ledger."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# ESLint (`eslint`)

**Gatilho:** em edição de arquivo (PostToolUse) e pré-ship

## Como age (steps)
1. Roda linter da stack (eslint/pint). 2. Se erro → bloqueia e sugere correção. 3. Registra no ledger.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
