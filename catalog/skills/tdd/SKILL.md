---
name: "tdd"
description: "Testes fixos de regra de negócio antes do código"
friendlyName: "TDD"
cargo: "Engenheiro de Testes"
funcao: "Testes fixos de regra de negócio antes do código"
tier: "global"
gatilho: "antes de qualquer código (obrigatório)"
steps:
  - "Lê regra de negócio do PRD."
  - "Escreve teste FIXO que valida exatamente a regra (RED)."
  - "Só então implementa código mínimo (GREEN)."
  - "Refatora."
  - "Se teste falhar depois → corrige causa raiz; só altera teste se regra mudar."
usesContext7: "quando aplicável"
---

# TDD (`tdd`)

**Gatilho:** antes de qualquer código (obrigatório)

## Como age (steps)
1. Lê regra de negócio do PRD. 2. Escreve teste FIXO que valida exatamente a regra (RED). 3. Só então implementa código mínimo (GREEN). 4. Refatora. 5. Se teste falhar depois → corrige causa raiz; só altera teste se regra mudar.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
