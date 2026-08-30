---
name: "orchestration"
description: "Instrui quando chamar cada um"
friendlyName: "Orquestração"
cargo: "Roteirizador"
funcao: "Instrui quando chamar cada um"
tier: "global"
gatilho: "sempre — instrui quando chamar quem"
steps:
  - "Maestro lê evento e roteia agente/skill conforme tabela de orquestração."
  - "Injeta arquivo de orquestração da 2ª interação em diante."
usesContext7: "quando aplicável"
---

# Orquestração (`orchestration`)

**Gatilho:** sempre — instrui quando chamar quem

## Como age (steps)
1. Maestro lê evento e roteia agente/skill conforme tabela de orquestração. 2. Injeta arquivo de orquestração da 2ª interação em diante.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
