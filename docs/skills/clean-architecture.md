# Arquitetura Limpa (`clean-architecture`)

**Cargo:** Arquiteto de Referência
**Função:** Aplica fronteiras e camadas adaptadas ao projeto
**Tier:** global (template → local especialista via Context7) · **Gatilho:** ao criar/alterar estrutura de camadas ou definir fronteiras

## O que entrega
Aplica fronteiras e camadas adaptadas ao projeto

## Quando age (gatilho)
ao criar/alterar estrutura de camadas ou definir fronteiras

## Como age (steps)
1. Lê AGENTS.md/stack. 2. Aplica camadas clean adaptada (Domain→App→Infra). 3. Define fronteiras e dependências (proíbe Illuminate em Domain). 4. Gera/atualiza docs/plan/*.md.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: sim`.
