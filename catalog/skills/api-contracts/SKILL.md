---
name: "api-contracts"
description: "Schema/OpenAPI"
friendlyName: "Contratos de API"
cargo: "Contratador"
funcao: "Schema/OpenAPI"
tier: "global"
gatilho: "antes de implementar API"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Define schema/OpenAPI/mensagem, versionado."
  - "Valida no TDD."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# Contratos de API (`api-contracts`)

**Gatilho:** antes de implementar API

## Como age (steps)
1. Define schema/OpenAPI/mensagem, versionado. 2. Valida no TDD.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
