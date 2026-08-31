---
name: "clean-architecture"
description: "Aplica fronteiras e camadas adaptadas ao projeto"
friendlyName: "Arquitetura Limpa"
cargo: "Arquiteto de Referência"
funcao: "Aplica fronteiras e camadas adaptadas ao projeto"
tier: "global"
gatilho: "ao criar/alterar estrutura de camadas ou definir fronteiras"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Lê AGENTS.md/stack."
  - "Aplica camadas clean adaptada (Domain→App→Infra)."
  - "Define fronteiras e dependências (proíbe Illuminate em Domain)."
  - "Gera/atualiza docs/plan/*.md."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# Arquitetura Limpa (`clean-architecture`)

**Gatilho:** ao criar/alterar estrutura de camadas ou definir fronteiras

## Como age (steps)
1. Lê AGENTS.md/stack. 2. Aplica camadas clean adaptada (Domain→App→Infra). 3. Define fronteiras e dependências (proíbe Illuminate em Domain). 4. Gera/atualiza docs/plan/*.md.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
