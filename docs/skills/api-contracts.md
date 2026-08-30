# Contratos de API (`api-contracts`)

**Cargo:** Contratador
**Função:** Schema/OpenAPI
**Tier:** global (template → local especialista via Context7) · **Gatilho:** antes de implementar API

## O que entrega
Schema/OpenAPI

## Quando age (gatilho)
antes de implementar API

## Como age (steps)
1. Define schema/OpenAPI/mensagem, versionado. 2. Valida no TDD.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.
