---
name: "i18n"
description: "Strings externalizadas"
friendlyName: "i18n"
cargo: "Internacionalizador"
funcao: "Strings externalizadas"
tier: "global"
gatilho: "quando i18n no escopo"
steps:
  - "Externaliza strings, verifica cobertura de idiomas."
usesContext7: "quando aplicável"
---

# i18n (`i18n`)

**Gatilho:** quando i18n no escopo

## Como age (steps)
1. Externaliza strings, verifica cobertura de idiomas.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
