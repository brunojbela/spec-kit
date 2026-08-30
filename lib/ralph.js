import { readFileSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';

// T30 — Ralph Loop: um .sh por task do PRD (chat limpo), PLAN→ACT→EVALUATE→TERMINATE, máx 5 iterações.
export function ralphScript({ taskId, prdPath, maxIters = 5, governancePath }) {
  const gp = governancePath ?? join(import.meta.dirname, 'governance.js');
  return `#!/usr/bin/env bash
# Ralph Loop — task ${taskId} (gerado por spec-kit). Chat limpo: cada iteração é um processo, sem histórico em memória.
set -u
TASK="${taskId}"
PRD="${prdPath}"
MAX=${maxIters}
TEST_CMD="\${TEST_CMD:-npm test}"
AGENT_CMD="\${AGENT_CMD:-echo '[ralph] agente faria a mudança cirúrgica aqui'}"
LOG_DIR="$(dirname "$0")"
LOG="$LOG_DIR/\${TASK}.log"
i=1
while [ "$i" -le "$MAX" ]; do
  echo "[ralph][\${TASK}] iteracao \${i}/\${MAX}: PLAN" | tee -a "$LOG"
  echo "[ralph][\${TASK}] ACT" | tee -a "$LOG"
  eval "$AGENT_CMD" | tee -a "$LOG"
  echo "[ralph][\${TASK}] EVALUATE (testes FIXOS de regra de negócio)" | tee -a "$LOG"
  if eval "$TEST_CMD" >>"$LOG" 2>&1; then
    echo "[ralph][\${TASK}] TERMINATE: testes verdes na iteracao \${i}" | tee -a "$LOG"
    node --input-type=module -e "import('file://${gp}').then(m=>m.setTaskStatus('${prdPath}','${taskId}','concluída'))" >>"$LOG" 2>&1
    exit 0
  fi
  echo "[ralph][\${TASK}] testes vermelhos — mudança cirúrgica próxima iteração" | tee -a "$LOG"
  i=$((i+1))
done
echo "[ralph][\${TASK}] TERMINATE: MAX_ITERS atingido — task bloqueada para revisão humana" | tee -a "$LOG"
exit 1
`;
}

export function generateRalphScripts({ prdPath, dir, tasks }) {
  const prd = JSON.parse(readFileSync(prdPath, 'utf8'));
  const outDir = join(dir, '.spec-kit', 'ralph');
  mkdirSync(outDir, { recursive: true });
  const files = [];
  for (const t of tasks ?? prd.tasks) {
    const f = join(outDir, `${t.id}.sh`);
    writeFileSync(f, ralphScript({ taskId: t.id, prdPath }));
    chmodSync(f, 0o755);
    files.push(f);
  }
  return files;
}
