---
name: "clean-architecture"
description: "Aplica fronteiras e camadas adaptadas ao projeto"
friendlyName: "Arquitetura Limpa"
cargo: "Arquiteto de Referência"
funcao: "Aplica fronteiras e camadas adaptadas ao projeto"
tier: "global"
gatilho: "ao criar/alterar estrutura de camadas ou definir fronteiras"
steps:
  - "Lê AGENTS.md/stack."
  - "Aplica camadas clean adaptada (Domain→App→Infra)."
  - "Define fronteiras e dependências (proíbe Illuminate em Domain)."
  - "Gera/atualiza docs/plan/*.md."
usesContext7: "sim"
---

# Arquitetura Limpa (`clean-architecture`)

**Gatilho:** ao criar/alterar estrutura de camadas ou definir fronteiras

## Como age (steps)
1. Lê AGENTS.md/stack. 2. Aplica camadas clean adaptada (Domain→App→Infra). 3. Define fronteiras e dependências (proíbe Illuminate em Domain). 4. Gera/atualiza docs/plan/*.md.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
