# PHPUnit (`phpunit`)

**Cargo:** Testador PHP
**Função:** Testes unitários em PHP
**Tier:** global (template → local especialista via Context7) · **Gatilho:** em código PHP / gate verify

## O que entrega
Testes unitários em PHP

## Quando age (gatilho)
em código PHP / gate verify

## Como age (steps)
1. Roda phpunit com cobertura. 2. Verifica threshold do PRD. 3. Se vermelho → devolve.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.
