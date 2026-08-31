---
name: "i18n"
description: "Strings externalizadas"
friendlyName: "i18n"
cargo: "Internacionalizador"
funcao: "Strings externalizadas"
tier: "global"
gatilho: "quando i18n no escopo"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Externaliza strings, verifica cobertura de idiomas."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# i18n (`i18n`)

**Gatilho:** quando i18n no escopo

## Como age (steps)
1. Externaliza strings, verifica cobertura de idiomas.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
