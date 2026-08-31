# Orquestração (`orchestration`)

**Cargo:** Roteirizador
**Função:** Instrui quando chamar cada um
**Tier:** global (template → local especialista via Context7) · **Gatilho:** sempre — instrui quando chamar quem

## O que entrega
Instrui quando chamar cada um

## Quando age (gatilho)
sempre — instrui quando chamar quem

## Como age (steps)
1. Maestro lê evento e roteia agente/skill conforme tabela de orquestração. 2. Injeta arquivo de orquestração da 2ª interação em diante.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.
