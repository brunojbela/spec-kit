---
name: "api-contracts"
description: "Schema/OpenAPI"
friendlyName: "Contratos de API"
cargo: "Contratador"
funcao: "Schema/OpenAPI"
tier: "global"
gatilho: "antes de implementar API"
steps:
  - "Define schema/OpenAPI/mensagem, versionado."
  - "Valida no TDD."
usesContext7: "quando aplicável"
---

# Contratos de API (`api-contracts`)

**Gatilho:** antes de implementar API

## Como age (steps)
1. Define schema/OpenAPI/mensagem, versionado. 2. Valida no TDD.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
