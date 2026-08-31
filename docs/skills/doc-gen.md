# Gerador de Docs (`doc-gen`)

**Cargo:** Documentarista
**Função:** Gera AGENTS.md/context
**Tier:** global (template → local especialista via Context7) · **Gatilho:** ao criar/atualizar AGENTS.md/PROJECT_CONTEXT ou no pipeline doc-gen

## O que entrega
Gera AGENTS.md/context

## Quando age (gatilho)
ao criar/atualizar AGENTS.md/PROJECT_CONTEXT ou no pipeline doc-gen

## Como age (steps)
1. Consome DOC_SYNC.json. 2. Gera docs técnica/funcional item a item. 3. Atualiza via hook docs.sync.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: sim`.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.
