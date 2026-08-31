# Design Patterns (`design-patterns`)

**Cargo:** Modelador
**Função:** Padrões GoF/arquiteturais
**Tier:** global (template → local especialista via Context7) · **Gatilho:** ao modelar código

## O que entrega
Padrões GoF/arquiteturais

## Quando age (gatilho)
ao modelar código

## Como age (steps)
1. Aplica GoF/arquiteturais conforme plano do TechLead.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.
