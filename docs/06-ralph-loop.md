# 06 — Ralph Loop

Loop iterativo de execução e auto-correção, aplicado **por task**. Combina com TDD obrigatório e debug por causa raiz.

> **Explicação simples (para quem não compreendeu):** O Ralph Loop é como um "repetidor teimoso com crivo". O PO quebra a feature em tasks pequenas e, para cada task, gera um script `.sh` que abre um **chat limpo (sem memória do chat anterior)** só para aquela task. Dentro desse chat o agente tenta resolver, **testa sozinho** (roda testes/lint), se falhar ele **analisa a causa raiz** e tenta de novo — até 3 a 5 tentativas. Só termina quando **todos os testes de regra de negócio (TDD, FIXOS) ficam verdes** ou quando bate o teto de iterações. É "persistência + validação determinística (código roda, não só LLM acha que está ok) + correção cirúrgica (só mexe onde errou)".

## Quando o PO usa
- Toda task delegada pelo PO roda num Ralph Loop com o **modelo escolhido para aquela task** (ver `07-flow-daytoday.md` matriz dificuldade→plano).
- Nível `trivial/fácil` → 3 iterações, 1 agente; `difícil/extremo` → 5 iterações, multiagents em paralelo.

## Modelo de execução
Ao gerar o **PRD JSON** (tasks + contexto compartilhado), o kit gera um arquivo **`.sh`** que abre um **chat novo com contexto LIMPO para cada tarefa** (isolamento de contexto por task). Dentro desse chat roda o loop:

```
PLAN/REFLECT → ACT (gera solução) → EVALUATE (testes/linters/schema) → TERMINATE
```

## Mecânica do loop
- **Fases:** PLAN/REFLECT · ACT · EVALUATE · TERMINATE (100% sucesso OU `max_iterations`).
- **Pilares:** persistência de estado/histórico · validação determinística (código, não só LLM-judge) · auto-correção por causa raiz.
- **max_iterations:** 3 a 5 ciclos (teto rígido para não desperdiçar tokens).
- **Compressão de histórico:** em loops longos, envia só o erro (stack trace) + instrução de correção, não o código antigo.
- **Mudanças cirúrgicas:** foca no erro; não reescreve módulos que já funcionavam.

## Alinhamento com o kit
- **Validação = nossos testes de regra de negócio FIXOS** (TDD obrigatório). O Ralph Loop itera até eles passarem.
- Usa o **modelo por tarefa** definido pelo PO no PRD (`modelSelection`).
- Combina com **debug** (raiz do problema) e **não-verbosidade**.

## Exemplo de prompt (modo chat)
```
[CICLO N]
1. PLANO: estratégia (se houve erro antes, analise a causa raiz).
2. EXECUÇÃO: solução completa.
3. AUTO-AVALIAÇÃO: edge cases, falhas, gargalos.
4. STATUS: [CONTINUAR] com ajuste OU [CONCLUÍDO] se 100% dos requisitos/testes atendidos.
```

## Quando usar
- Toda task delegada pelo PO roda num Ralph Loop com o modelo escolhido e o nível de iterações conforme a dificuldade (trivial→poucas iterações; extremo→mais iterações + multiagents).
