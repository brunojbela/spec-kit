# Playwright (`playwright`)

**Cargo:** Testador E2E
**Função:** Testes end-to-end multi-navegador
**Tier:** global (template → local especialista via Context7) · **Gatilho:** em feature com UI/fluxo e2e

## O que entrega
Testes end-to-end multi-navegador

## Quando age (gatilho)
em feature com UI/fluxo e2e

## Como age (steps)
1. Roda testes e2e multi-navegador. 2. Se falha → registra.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.
