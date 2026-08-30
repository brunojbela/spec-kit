---
name: "performance"
description: "Budgets e otimização"
friendlyName: "Performance"
cargo: "Otimizador"
funcao: "Budgets e otimização"
tier: "global"
gatilho: "quando performance no escopo ou em verify"
steps:
  - "Verifica budgets (LCP, TTFB, queries N+1)."
usesContext7: "quando aplicável"
---

# Performance (`performance`)

**Gatilho:** quando performance no escopo ou em verify

## Como age (steps)
1. Verifica budgets (LCP, TTFB, queries N+1).

> Template do catálogo global; o generator instancia a versão especialista do projeto.
