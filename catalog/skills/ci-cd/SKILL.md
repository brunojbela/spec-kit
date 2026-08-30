---
name: "ci-cd"
description: "Build/deploy"
friendlyName: "CI/CD"
cargo: "Pipelineiro"
funcao: "Build/deploy"
tier: "global"
gatilho: "em pipeline build/deploy"
steps:
  - "Roda build/deploy conforme provider (docker/aws/vercel etc.)."
usesContext7: "quando aplicável"
---

# CI/CD (`ci-cd`)

**Gatilho:** em pipeline build/deploy

## Como age (steps)
1. Roda build/deploy conforme provider (docker/aws/vercel etc.).

> Template do catálogo global; o generator instancia a versão especialista do projeto.
