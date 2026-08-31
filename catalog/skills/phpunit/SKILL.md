---
name: "phpunit"
description: "Testes unitários em PHP"
friendlyName: "PHPUnit"
cargo: "Testador PHP"
funcao: "Testes unitários em PHP"
tier: "global"
gatilho: "em código PHP / gate verify"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Roda phpunit com cobertura."
  - "Verifica threshold do PRD."
  - "Se vermelho → devolve."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# PHPUnit (`phpunit`)

**Gatilho:** em código PHP / gate verify

## Como age (steps)
1. Roda phpunit com cobertura. 2. Verifica threshold do PRD. 3. Se vermelho → devolve.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
