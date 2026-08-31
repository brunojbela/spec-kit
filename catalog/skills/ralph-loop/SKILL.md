---
name: "ralph-loop"
description: "Loop iterativo por task (.sh)"
friendlyName: "Ralph Loop"
cargo: "Loop de Execução"
funcao: "Loop iterativo por task (.sh)"
tier: "global"
gatilho: "ao executar cada task delegada"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Gera .sh por task (chat limpo)."
  - "Loop PLAN→ACT→EVALUATE→TERMINATE (3-5 iterações, mudanças cirúrgicas, compressão de histórico)."
  - "Valida em testes fixos."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# Ralph Loop (`ralph-loop`)

**Gatilho:** ao executar cada task delegada

## Como age (steps)
1. Gera .sh por task (chat limpo). 2. Loop PLAN→ACT→EVALUATE→TERMINATE (3-5 iterações, mudanças cirúrgicas, compressão de histórico). 3. Valida em testes fixos.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
