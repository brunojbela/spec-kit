---
name: "char-tests"
description: "Cobre legado antes de alterar"
friendlyName: "Testes de Caracterização"
cargo: "Cobridor de Legado"
funcao: "Cobre legado antes de alterar"
tier: "global"
gatilho: "em legado antes de alterar"
steps:
  - "Escreve teste de caracterização que congela comportamento atual."
  - "Só então altera."
usesContext7: "quando aplicável"
---

# Testes de Caracterização (`char-tests`)

**Gatilho:** em legado antes de alterar

## Como age (steps)
1. Escreve teste de caracterização que congela comportamento atual. 2. Só então altera.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
