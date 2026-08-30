---
name: "doc-gen"
description: "Gera AGENTS.md/context"
friendlyName: "Gerador de Docs"
cargo: "Documentarista"
funcao: "Gera AGENTS.md/context"
tier: "global"
gatilho: "ao criar/atualizar AGENTS.md/PROJECT_CONTEXT ou no pipeline doc-gen"
steps:
  - "Consome DOC_SYNC.json."
  - "Gera docs técnica/funcional item a item."
  - "Atualiza via hook docs.sync."
usesContext7: "sim"
---

# Gerador de Docs (`doc-gen`)

**Gatilho:** ao criar/atualizar AGENTS.md/PROJECT_CONTEXT ou no pipeline doc-gen

## Como age (steps)
1. Consome DOC_SYNC.json. 2. Gera docs técnica/funcional item a item. 3. Atualiza via hook docs.sync.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
