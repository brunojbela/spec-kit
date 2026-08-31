---
name: "doc-gen"
description: "Gera AGENTS.md/context"
friendlyName: "Gerador de Docs"
cargo: "Documentarista"
funcao: "Gera AGENTS.md/context"
tier: "global"
gatilho: "ao criar/atualizar AGENTS.md/PROJECT_CONTEXT ou no pipeline doc-gen"
conciseness: "CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence."
steps:
  - "Consome DOC_SYNC.json."
  - "Gera docs técnica/funcional item a item."
  - "Atualiza via hook docs.sync."
  - "Sempre aplicar CONCISÃO: código curto, direto, simples, uma responsabilidade por method/function, focado em resolver o problema."
---

# Gerador de Docs (`doc-gen`)

**Gatilho:** ao criar/atualizar AGENTS.md/PROJECT_CONTEXT ou no pipeline doc-gen

## Como age (steps)
1. Consome DOC_SYNC.json. 2. Gera docs técnica/funcional item a item. 3. Atualiza via hook docs.sync.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
