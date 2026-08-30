---
name: "secrets"
description: "Gestão de env/vault"
friendlyName: "Segredos"
cargo: "Cofre"
funcao: "Gestão de env/vault"
tier: "global"
gatilho: "em gestão de env/vault"
steps:
  - "Garante segredos em env/vault, nunca em código/log."
  - "Roda varredura."
usesContext7: "quando aplicável"
---

# Segredos (`secrets`)

**Gatilho:** em gestão de env/vault

## Como age (steps)
1. Garante segredos em env/vault, nunca em código/log. 2. Roda varredura.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
