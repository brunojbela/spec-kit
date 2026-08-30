# Design System (`design-system`)

**Cargo:** Sistematizador de UI
**Função:** Tokens/componentes
**Tier:** global (template → local especialista via Context7) · **Gatilho:** quando UI consistente no escopo

## O que entrega
Tokens/componentes

## Quando age (gatilho)
quando UI consistente no escopo

## Como age (steps)
1. Aplica tokens/componentes.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.
