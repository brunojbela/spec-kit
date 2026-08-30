import { recommendModel, DIFFICULTY_MODEL } from './central.js';

// T26 — plano por nível de dificuldade (trivial → extremamente difícil).
export const PLAN_BY_LEVEL = {
  trivial: 'executar direto; 1 iteração ralph; revisão rápida',
  'fácil': 'TDD leve; ralph 1-2 iterações; lint+testes fixos',
  'médio': 'TDD completo; ralph 2-3 iterações; code-review',
  'difícil': 'spec detalhada antes; ralph 3-5 iterações; multiagents (dev+qa+security); revisão humana',
  'extremamente difícil': 'decompor em subtasks no PRD; multiagents + multisites; ralph 5 iterações; opus; revisão humana obrigatória',
};

export const LEVELS = Object.keys(PLAN_BY_LEVEL);

// T25 — before-task-sync do PO: sync → valida prompt → classifica → escolhe modelo → plano → delega.
export async function beforeTaskSync({ prd, taskId, harness, catalog }) {
  const task = prd.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`task ${taskId} não existe no PRD`);
  const problems = [];
  if (!task.acceptanceCriteria || task.acceptanceCriteria.length < 10) problems.push('critério de aceite vago');
  if (!task.what || task.what.length < 10) problems.push('what incompleto');
  const blockedBy = task.dependsOn.filter((d) => prd.tasks.find((t) => t.id === d)?.status !== 'concluída');
  if (blockedBy.length) problems.push(`dependências não concluídas: ${blockedBy.join(', ')}`);
  const rec = await recommendModel({ difficulty: task.difficulty, harness, catalog });
  return {
    ok: problems.length === 0,
    problems,
    blockedBy,
    task: { id: task.id, difficulty: task.difficulty, status: task.status },
    model: rec.model,
    modelSource: rec.source,
    plan: PLAN_BY_LEVEL[task.difficulty],
    matrix: DIFFICULTY_MODEL,
  };
}
