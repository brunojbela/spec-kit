---
name: "semantic-release"
description: "Commit/changelog/release"
friendlyName: "Release Semântico"
cargo: "Liberador"
funcao: "Commit/changelog/release"
tier: "global"
gatilho: "na fase Ship"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Gera commit semântico (Conventional Commits pt-BR) + changelog + release."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# Release Semântico (`semantic-release`)

**Gatilho:** na fase Ship

## Como age (steps)
1. Gera commit semântico (Conventional Commits pt-BR) + changelog + release.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
