---
name: "pack-security"
description: "Valida pack confiável"
friendlyName: "Segurança de Pacotes"
cargo: "Vigiador de Pacotes"
funcao: "Valida pack confiável"
tier: "global"
gatilho: "antes de instalar pack"
steps:
  - "Valida supply-chain (npm/composer audit, assinatura)."
  - "Bloqueia se não confiável."
usesContext7: "quando aplicável"
---

# Segurança de Pacotes (`pack-security`)

**Gatilho:** antes de instalar pack

## Como age (steps)
1. Valida supply-chain (npm/composer audit, assinatura). 2. Bloqueia se não confiável.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
