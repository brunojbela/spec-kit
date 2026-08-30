---
name: "phpunit"
description: "Testes unitários em PHP"
friendlyName: "PHPUnit"
cargo: "Testador PHP"
funcao: "Testes unitários em PHP"
tier: "global"
gatilho: "em código PHP / gate verify"
steps:
  - "Roda phpunit com cobertura."
  - "Verifica threshold do PRD."
  - "Se vermelho → devolve."
usesContext7: "quando aplicável"
---

# PHPUnit (`phpunit`)

**Gatilho:** em código PHP / gate verify

## Como age (steps)
1. Roda phpunit com cobertura. 2. Verifica threshold do PRD. 3. Se vermelho → devolve.

> Template do catálogo global; o generator instancia a versão especialista do projeto.
