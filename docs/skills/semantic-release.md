# Release Semântico (`semantic-release`)

**Cargo:** Liberador
**Função:** Commit/changelog/release
**Tier:** global (template → local especialista via Context7) · **Gatilho:** na fase Ship

## O que entrega
Commit/changelog/release

## Quando age (gatilho)
na fase Ship

## Como age (steps)
1. Gera commit semântico (Conventional Commits pt-BR) + changelog + release.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.
