---
name: "pack-security"
description: "Valida pack confiável"
friendlyName: "Segurança de Pacotes"
cargo: "Vigiador de Pacotes"
funcao: "Valida pack confiável"
tier: "global"
gatilho: "antes de instalar pack"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Valida supply-chain (npm/composer audit, assinatura)."
  - "Bloqueia se não confiável."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# Segurança de Pacotes (`pack-security`)

**Gatilho:** antes de instalar pack

## Como age (steps)
1. Valida supply-chain (npm/composer audit, assinatura). 2. Bloqueia se não confiável.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
