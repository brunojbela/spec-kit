# CI/CD (`ci-cd`)

**Cargo:** Pipelineiro
**Função:** Build/deploy
**Tier:** global (template → local especialista via Context7) · **Gatilho:** em pipeline build/deploy

## O que entrega
Build/deploy

## Quando age (gatilho)
em pipeline build/deploy

## Como age (steps)
1. Roda build/deploy conforme provider (docker/aws/vercel etc.).

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.
