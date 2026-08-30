---
name: "semantic-release"
description: "Commit/changelog/release"
friendlyName: "Release Semântico"
cargo: "Liberador"
funcao: "Commit/changelog/release"
tier: "global"
gatilho: "na fase Ship"
steps:
  - "Gera commit semântico (Conventional Commits pt-BR) + changelog + release."
usesContext7: "quando aplicável"
---

# Release Semântico (`semantic-release`)

**Gatilho:** na fase Ship

## Como age (steps)
1. Gera commit semântico (Conventional Commits pt-BR) + changelog + release.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
