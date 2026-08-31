# Motor do Domínio (`domain-engine`)

**Cargo:** Engenheiro de Domínio
**Função:** Entities/VOs e serviços de cálculo
**Tier:** local · **Tipo:** layer

## O que é
EXAMPLE — motor domínio (gestor-projects)

## Responsabilidades
- Entities/VOs
- serviços

## Proibições
- Illuminate em Domain
- float dinheiro
- sem teste primeiro

## Skills relacionadas
- laravel
- laravel-tdd
- phpunit-tests
- typescript

## Como age
TDD estrito: 1. Define Entity/VO + Money (proíbe float). 2. Teste unitário antes. 3. Implementa serviço de cálculo em app/Core/Domain. 4. Nunca usa Illuminate em Domain.

## Detalhes
- **Usa Context7:** True
- **Modos:** ambos
- **Escopo:** - app/Core/Domain/
- tests/Unit/
- **Onde vive (por harness):** ver `01-harnesses.md`

## Notas
EXEMPLO

## Regra de código (todos os agents)
CONCISÃO (obrigatória em TODO código escrito ou revisto): nunca código verboso ou extenso por hábito. Direto ao ponto — methods/functions simples, curtos, uma responsabilidade, legíveis de primeira, nomes óbvios, sem dead code, sem abstração desnecessária, sem comentários redundantes. Sempre focando em RESOLVER o problema: a solução mais curta e correta que passa nos testes FIXOS vence.
