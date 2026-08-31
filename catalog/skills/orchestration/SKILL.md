---
name: "orchestration"
description: "Instrui quando chamar cada um"
friendlyName: "Orquestração"
cargo: "Roteirizador"
funcao: "Instrui quando chamar cada um"
tier: "global"
gatilho: "sempre — instrui quando chamar quem"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Maestro lê evento e roteia agente/skill conforme tabela de orquestração."
  - "Injeta arquivo de orquestração da 2ª interação em diante."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# Orquestração (`orchestration`)

**Gatilho:** sempre — instrui quando chamar quem

## Como age (steps)
1. Maestro lê evento e roteia agente/skill conforme tabela de orquestração. 2. Injeta arquivo de orquestração da 2ª interação em diante.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
