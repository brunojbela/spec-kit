# ESLint (`eslint`)

**Cargo:** Guardador de Estilo
**Função:** Lint e padronização de código
**Tier:** global (template → local especialista via Context7) · **Gatilho:** em edição de arquivo (PostToolUse) e pré-ship

## O que entrega
Lint e padronização de código

## Quando age (gatilho)
em edição de arquivo (PostToolUse) e pré-ship

## Como age (steps)
1. Roda linter da stack (eslint/pint). 2. Se erro → bloqueia e sugere correção. 3. Registra no ledger.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.
