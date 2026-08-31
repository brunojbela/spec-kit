import { readFileSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { HEADLESS, MAX_BY_DIFFICULTY, toNativeModel } from './harness-payloads.js';
import { specRoot, migrateLegacy } from './spec-paths.js';

function runnerArray(harness, model) {
  const r = HEADLESS[harness];
  if (!r || !r.bins.length) return null; // sem CLI headless (antigravity 2.0/ide)
  return [r.bins[0], ...r.args(model, undefined)];
}

// T30 — Ralph Loop v2: runner por harness, MAX por dificuldade, erro de agente ≠ teste vermelho,
// usage real → ledger, compressão de contexto (só o erro na iteração N+1),
// e sinal explícito p/ harnesses sem CLI headless (antigravity 2.0/ide → fallback agy/gemini/ralph in-chat).
export function ralphScript({ task, harness, prdPath, dir }) {
  const max = MAX_BY_DIFFICULTY[task.difficulty] ?? 5;
  const nativeModel = toNativeModel(harness, task.model);
  const runner = runnerArray(harness, nativeModel);
  migrateLegacy(dir);
  const logDir = join(specRoot(dir), 'ralph');
  mkdirSync(logDir, { recursive: true });
  const promptFile = join(logDir, `${task.id}.prompt.md`);
  const prompt = `[RALPH ${task.id}] ${task.what}\nCritério de aceite: ${task.acceptanceCriteria ?? task.id}\nRegra: mudança cirúrgica focada no erro; não reescreva o que já passa; TDD — os testes FIXOS de regra de negócio são a verdade.`;
  writeFileSync(promptFile, prompt + '\n');
  const gp = join(import.meta.dirname, 'governance.js');
  const hp = join(import.meta.dirname, 'harness-payloads.js');

  if (!runner) {
    const ralphAlt = join(logDir, `${task.id}.ralph`);
    const geminiAlt = join(logDir, `${task.id}.gemini`);
    return `#!/usr/bin/env bash
# Ralph Loop — task ${task.id} · harness ${harness}
# ⚠ ${harness} NÃO expõe CLI headless: o Ralph (.sh) seria a melhor opção, mas não é possível neste harness.
set -u
echo "[ralph][${task.id}] ${harness}: Ralph .sh indisponível (sem CLI headless). Decisão de fallback:" | tee -a "${logDir}/${task.id}.log"
if command -v agy >/dev/null 2>&1; then
  echo "[ralph][${task.id}]   1) agy encontrado (compartilha auth/harness com o app) → delegando" | tee -a "${logDir}/${task.id}.log"
  exec bash "${ralphAlt}"
fi
if command -v gemini >/dev/null 2>&1; then
  echo "[ralph][${task.id}]   2) gemini-cli encontrado → delegando" | tee -a "${logDir}/${task.id}.log"
  exec bash "${geminiAlt}"
fi
echo "[ralph][${task.id}]   3) sem agy/gemini → Ralph IN-CHAT: o Stop hook do spec-kit já força decision:continue" | tee -a "${logDir}/${task.id}.log"
echo "[ralph][${task.id}]      com reason no docs-check; abra o app e rode a task deixando o gate iterar." | tee -a "${logDir}/${task.id}.log"
echo "[ralph][${task.id}] prompt da task: ${promptFile}" | tee -a "${logDir}/${task.id}.log"
exit 3
`;
  }

  const runnerStr = runner.slice(1).map((a) => `'${a.replaceAll("'", "'\\''")}'`).join(' ');
  return `#!/usr/bin/env bash
# Ralph Loop — task ${task.id} · harness ${harness} · modelo ${nativeModel ?? '(default)'} · gerado por spec-kit.
# Chat limpo: cada iteração é um processo novo (stateless). Compressão de contexto: só o erro vai na N+1.
set -u
TASK="${task.id}"
MAX=${max}
PRD="${prdPath}"
TEST_CMD="\${TEST_CMD:-npm test}"
AGENT_CMD="\${AGENT_CMD:-}"   # override p/ CI/testes; vazio = runner real do harness
RUNNER="\${RUNNER_BIN:-${runner[0]}}"
RUNNER_ARGS=(${runnerStr})
LOG_DIR="${logDir}"
LOG="$LOG_DIR/\${TASK}.log"
PROMPT_FILE="${promptFile}"
OUT="$LOG_DIR/\${TASK}.out.log"
ERR="$LOG_DIR/\${TASK}.err.log"
if [ -z "$AGENT_CMD" ] && ! command -v "$RUNNER" >/dev/null 2>&1; then
  echo "[ralph][\${TASK}] ERRO DO AGENTE: CLI '$RUNNER' não encontrado — instale o harness, aponte RUNNER_BIN, ou use outro --harness" | tee -a "$LOG"
  exit 4
fi
i=1
while [ "$i" -le "$MAX" ]; do
  echo "[ralph][\${TASK}] iteracao \${i}/\${MAX} harness=${harness}: PLAN→ACT" | tee -a "$LOG"
  if [ "$i" -eq 1 ]; then
    PROMPT="$(cat "$PROMPT_FILE")"
  else
    PROMPT="$(cat "$PROMPT_FILE")

[ITERACAO \${i}] Os testes FIXOS falharam na iteracao anterior. Analise a CAUSA RAIZ e corrija com mudança cirúrgica. Erro:
$(tail -50 "$LOG_DIR/\${TASK}.erro.log" 2>/dev/null || echo '(sem log de erro)')"
  fi
  if [ -n "$AGENT_CMD" ]; then
    printf '%s' "$PROMPT" | eval "$AGENT_CMD" > "$OUT" 2> "$ERR" || true
  else
    "$RUNNER" "\${RUNNER_ARGS[@]}" "$PROMPT" > "$OUT" 2> "$ERR" || true
    STATUS=$(node --input-type=module -e "
      const fs=await import('node:fs');
      const m=await import('file://${hp}');
      const ok=(f)=>{try{return fs.readFileSync(f,'utf8')}catch{return ''}};
      console.log(m.isAgentError('${harness}',{exitCode:1,stdout:ok('\${OUT}'),stderr:ok('\${ERR}')})?'AGENT_ERROR':'OK');
    " 2>/dev/null || echo OK)
    if [ "$STATUS" = "AGENT_ERROR" ]; then
      echo "[ralph][\${TASK}] ERRO DO AGENTE (auth/modelo/CLI ausente) — não é teste vermelho; abortando sem queimar iterações" | tee -a "$LOG"
      exit 4
    fi
  fi
  echo "[ralph][\${TASK}] EVALUATE (testes FIXOS)" | tee -a "$LOG"
  if eval "$TEST_CMD" > "$LOG_DIR/\${TASK}.erro.log" 2>&1; then
    echo "[ralph][\${TASK}] TERMINATE: testes verdes na iteracao \${i}" | tee -a "$LOG"
    node --input-type=module -e "
      import('file://${hp}').then(async (hp)=>{
        const g=await import('file://${gp}');
        const fs=await import('node:fs');
        const usage=hp.parseUsage('${harness}',fs.readFileSync('\${OUT}','utf8')||'');
        g.appendLedgerEntry('${join(dir, 'docs')}',{harness:'${harness}',task_id:'${task.id}',developer:'ralph',model:'${task.model ?? 'default'}',tokens:usage?.total,metrics:{usage,iteration:\${i}}});
        g.setTaskStatus('${prdPath}','${task.id}','concluída');
      }).catch(()=>{});
    " >>"$LOG" 2>&1
    exit 0
  fi
  echo "[ralph][\${TASK}] testes vermelhos → próxima iteração com causa raiz" | tee -a "$LOG"
  i=$((i+1))
done
echo "[ralph][\${TASK}] TERMINATE: MAX_ITERS (\${MAX}, dificuldade=${task.difficulty ?? 'n/a'}) atingido — task bloqueada para revisão humana" | tee -a "$LOG"
node --input-type=module -e "import('file://${gp}').then(m=>m.setTaskStatus('${prdPath}','${task.id}','bloqueada')).catch(()=>{})" >>"$LOG" 2>&1
exit 1
`;
}

export function generateRalphScripts({ prdPath, dir, harness = 'claude-code', tasks }) {
  const prd = JSON.parse(readFileSync(prdPath, 'utf8'));
  migrateLegacy(dir);
  const outDir = join(specRoot(dir), 'ralph');
  mkdirSync(outDir, { recursive: true });
  const files = [];
  for (const t of tasks ?? prd.tasks) {
    const f = join(outDir, `${t.id}.sh`);
    writeFileSync(f, ralphScript({ task: t, harness, prdPath, dir }));
    chmodSync(f, 0o755);
    files.push(f);
    if (!HEADLESS[harness]?.bins?.length) {
      for (const [suffix, alt] of [['ralph', 'antigravity-cli (agy)'], ['gemini', 'gemini-cli']]) {
        const af = join(outDir, `${t.id}.${suffix}`);
        writeFileSync(af, ralphScript({ task: t, harness: alt, prdPath, dir }));
        chmodSync(af, 0o755);
      }
    }
  }
  return files;
}
