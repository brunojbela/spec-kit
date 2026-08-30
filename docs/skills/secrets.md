# Segredos (`secrets`)

**Cargo:** Cofre
**Função:** Gestão de env/vault
**Tier:** global (template → local especialista via Context7) · **Gatilho:** em gestão de env/vault

## O que entrega
Gestão de env/vault

## Quando age (gatilho)
em gestão de env/vault

## Como age (steps)
1. Garante segredos em env/vault, nunca em código/log. 2. Roda varredura.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.
