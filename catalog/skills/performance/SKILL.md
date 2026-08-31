---
name: "performance"
description: "Budgets e otimização"
friendlyName: "Performance"
cargo: "Otimizador"
funcao: "Budgets e otimização"
tier: "global"
gatilho: "quando performance no escopo ou em verify"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Verifica budgets (LCP, TTFB, queries N+1)."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# Performance (`performance`)

**Gatilho:** quando performance no escopo ou em verify

## Como age (steps)
1. Verifica budgets (LCP, TTFB, queries N+1).

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
