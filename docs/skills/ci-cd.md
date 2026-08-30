# CI/CD (`ci-cd`)

**Cargo:** Pipelineiro
**Função:** Build/deploy
**Tier:** global (template → local especialista via Context7) · **Gatilho:** em pipeline build/deploy

## O que entrega
Build/deploy

## Quando age (gatilho)
em pipeline build/deploy

## Como age (steps)
1. Roda build/deploy conforme provider (docker/aws/vercel etc.).

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.
