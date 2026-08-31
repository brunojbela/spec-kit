---
name: "tdd"
description: "Testes fixos de regra de negócio antes do código"
friendlyName: "TDD"
cargo: "Engenheiro de Testes"
funcao: "Testes fixos de regra de negócio antes do código"
tier: "global"
gatilho: "antes de qualquer código (obrigatório)"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Lê regra de negócio do PRD."
  - "Escreve teste FIXO que valida exatamente a regra (RED)."
  - "Só então implementa código mínimo (GREEN)."
  - "Refatora."
  - "Se teste falhar depois → corrige causa raiz; só altera teste se regra mudar."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# TDD (`tdd`)

**Gatilho:** antes de qualquer código (obrigatório)

## Como age (steps)
1. Lê regra de negócio do PRD. 2. Escreve teste FIXO que valida exatamente a regra (RED). 3. Só então implementa código mínimo (GREEN). 4. Refatora. 5. Se teste falhar depois → corrige causa raiz; só altera teste se regra mudar.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
