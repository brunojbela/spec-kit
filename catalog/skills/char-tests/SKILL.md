---
name: "char-tests"
description: "Cobre legado antes de alterar"
friendlyName: "Testes de Caracterização"
cargo: "Cobridor de Legado"
funcao: "Cobre legado antes de alterar"
tier: "global"
gatilho: "em legado antes de alterar"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Escreve teste de caracterização que congela comportamento atual."
  - "Só então altera."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# Testes de Caracterização (`char-tests`)

**Gatilho:** em legado antes de alterar

## Como age (steps)
1. Escreve teste de caracterização que congela comportamento atual. 2. Só então altera.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
