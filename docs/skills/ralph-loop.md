# Ralph Loop (`ralph-loop`)

**Cargo:** Loop de Execução
**Função:** Loop iterativo por task (.sh)
**Tier:** global (template → local especialista via Context7) · **Gatilho:** ao executar cada task delegada

## O que entrega
Loop iterativo por task (.sh)

## Quando age (gatilho)
ao executar cada task delegada

## Como age (steps)
1. Gera .sh por task (chat limpo). 2. Loop PLAN→ACT→EVALUATE→TERMINATE (3-5 iterações, mudanças cirúrgicas, compressão de histórico). 3. Valida em testes fixos.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.
