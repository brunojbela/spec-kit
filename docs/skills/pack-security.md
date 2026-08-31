# Segurança de Pacotes (`pack-security`)

**Cargo:** Vigiador de Pacotes
**Função:** Valida pack confiável
**Tier:** global (template → local especialista via Context7) · **Gatilho:** antes de instalar pack

## O que entrega
Valida pack confiável

## Quando age (gatilho)
antes de instalar pack

## Como age (steps)
1. Valida supply-chain (npm/composer audit, assinatura). 2. Bloqueia se não confiável.

## Onde vive (por harness)
Ver `01-harnesses.md` e `03-skills.md`. Adapters copiam para a pasta de skills de cada harness.

## Notas
Template do catálogo global; o generator instancia a versão especialista do projeto. `usesContext7: quando aplicável`.

## Regra de código (todas as skills)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.
