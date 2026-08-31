// Especificidade por harness — payloads de hook, formatos de decisão, usage, modelos e runners.
// Fontes verificadas 2026-08-30: code.claude.com/docs/en/hooks · cursor.com/docs/hooks ·
// github.com/google-gemini/gemini-cli/docs/hooks/reference.md · openai/codex hooks (config.toml/hooks.json) ·
// opencode.ai/docs/plugins · antigravity.google/docs/hooks + /docs/cli/headless.

export const HEADLESS = {
  opencode: { bins: ['opencode'], args: (m, t) => ['run', ...(m ? ['-m', m] : []), ...(t ? ['--title', t] : []), '--auto', '--format', 'json'] },
  'claude-code': { bins: ['claude'], args: (m) => ['-p', '--output-format', 'json', ...(m ? ['--model', m] : []), '--permission-mode', 'bypassPermissions'] },
  cursor: { bins: ['agent', 'cursor-agent'], args: (m) => ['-p', '--output-format', 'json', ...(m ? ['--model', m] : [])] },
  codex: { bins: ['codex'], args: (m) => ['exec', '--json', ...(m ? ['-m', m] : []), '--dangerously-bypass-approvals-and-sandbox'] },
  'gemini-cli': { bins: ['gemini'], args: (m) => ['--approval-mode', 'yolo', '--output-format', 'json', ...(m ? ['--model', m] : [])] },
  'antigravity-cli (agy)': { bins: ['agy'], args: (m) => ['-p', '--output-format', 'json', '--dangerously-skip-permissions', '--print-timeout', '15m', ...(m ? ['--model', m] : [])] },
  // Desktop/IDE: sem CLI headless próprio — runner real é agy, com fallback gemini (docs cli/install).
  'antigravity-2.0': { bins: [], headless: false, fallbackTo: ['antigravity-cli (agy)', 'gemini-cli'] },
  'antigravity-ide': { bins: [], headless: false, fallbackTo: ['antigravity-cli (agy)', 'gemini-cli'] },
};

// Ralph in-chat (sem .sh): harness com evento de "continue com reason" nativo.
export const IN_CHAT_RALPH = {
  'claude-code': 'Stop', // decision:block + reason força continuar
  cursor: 'stop', // followup_message + loop_limit (default 5)
  'gemini-cli': 'AfterAgent', // decision:deny + reason → retry
  'antigravity-2.0': 'Stop', // decision:"continue" + reason
  'antigravity-ide': 'Stop',
  'antigravity-cli (agy)': 'Stop',
  codex: 'Stop',
  opencode: null, // plugin não força continue; usar .sh
};

export const MAX_BY_DIFFICULTY = { trivial: 3, 'fácil': 3, 'médio': 4, 'difícil': 5, 'extremamente difícil': 5 };

// ── normalização de payload stdin → canônico ─────────────────────────────
export function normalizeHookInput(harness, native = {}) {
  const c = { harness, native_session_id: null, event: native.hook_event_name ?? native.event ?? null, tool_name: null, files: [], command: null, content: null, prompt: null, error: null };
  if (harness === 'claude-code' || harness === 'codex') {
    c.native_session_id = native.session_id ?? null;
    c.tool_name = native.tool_name ?? null;
    const ti = native.tool_input ?? {};
    if (ti.file_path) c.files.push(ti.file_path);
    if (ti.notebook_path) c.files.push(ti.notebook_path);
    if (ti.command) c.command = ti.command;
    c.prompt = native.prompt ?? null;
    c.source = native.source ?? null;
    c.transcript_path = native.transcript_path ?? null;
  } else if (harness === 'cursor') {
    c.native_session_id = native.conversation_id ?? null;
    c.tool_name = native.tool_name ?? null;
    if (native.file_path) c.files.push(native.file_path);
    if (native.tool_input?.command) c.command = native.tool_input.command;
    if (native.command) c.command = native.command;
    c.prompt = native.prompt ?? null;
    c.error = native.error_message ?? null;
    c.transcript_path = native.transcript_path ?? null;
  } else if (harness === 'gemini-cli') {
    c.native_session_id = native.session_id ?? null;
    c.tool_name = native.tool_name ?? null;
    const ti = native.tool_input ?? {};
    if (ti.file_path ?? ti.path) c.files.push(ti.file_path ?? ti.path);
    if (ti.command) c.command = ti.command;
    c.prompt = native.prompt ?? null;
    c.source = native.source ?? null;
  } else if (harness === 'antigravity-cli (agy)' || harness === 'antigravity-2.0' || harness === 'antigravity-ide') {
    c.native_session_id = native.conversationId ?? null;
    c.tool_name = native.toolCall?.name ?? null;
    const args = native.toolCall?.args ?? {};
    const fp = args.TargetFile ?? args.AbsolutePath ?? args.DirectoryPath;
    if (fp) c.files.push(fp);
    if (args.CommandLine) c.command = args.CommandLine;
    c.error = native.error || native.terminationReason === 'error' ? (native.error ?? 'tool error') : null;
    c.model_name = native.modelName ?? null;
    c.execution_num = native.executionNum ?? null;
    c.invocation_num = native.invocationNum ?? null;
  } else if (harness === 'opencode') {
    c.native_session_id = native.properties?.sessionID ?? native.session?.id ?? null;
    c.tool_name = native.name ?? (native.properties?.tool) ?? null;
    if (native.properties?.file?.path) c.files.push(native.properties.file.path);
  }
  return c;
}

// ── formatos de bloqueio (security-gate) ─────────────────────────────────
export function blockOutput(harness, reason) {
  switch (harness) {
    case 'claude-code':
      return { exitCode: 0, stdout: JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }) };
    case 'cursor':
      return { exitCode: 0, stdout: JSON.stringify({ permission: 'deny', user_message: reason, agent_message: reason }) };
    case 'gemini-cli':
    case 'antigravity-cli (agy)':
    case 'antigravity-2.0':
    case 'antigravity-ide':
      return { exitCode: 0, stdout: JSON.stringify({ decision: 'deny', reason }) };
    default: // codex/opencode: exit 2 + stderr (fail-safe)
      return { exitCode: 2, stderr: reason };
  }
}

// ── injeção de contexto (inject-orchestration) ───────────────────────────
export function contextOutput(harness, event, text) {
  switch (harness) {
    case 'claude-code':
    case 'gemini-cli':
      return { stdout: JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }) };
    case 'cursor':
      return { stdout: JSON.stringify({ additional_context: text }) };
    case 'antigravity-2.0':
    case 'antigravity-ide':
      return { stdout: JSON.stringify({ injectSteps: [{ ephemeralMessage: text }] }) };
    default: // codex stdout texto simples; agy/opencode: arquivo (agente lê)
      return { stdout: text };
  }
}

// ── ralph in-chat: decisão de continuar no evento Stop/AfterAgent/stop ───
export function continueDecision(harness, { iteration, max, reason }) {
  switch (harness) {
    case 'claude-code':
      return { stdout: JSON.stringify({ decision: 'block', reason: `[ralph ${iteration}/${max}] ${reason}` }) };
    case 'cursor':
      return { stdout: JSON.stringify({ followup_message: `[ralph ${iteration}/${max}] ${reason}` }) };
    case 'gemini-cli':
      return { stdout: JSON.stringify({ decision: 'deny', reason: `[ralph ${iteration}/${max}] ${reason}` }) };
    case 'antigravity-2.0':
    case 'antigravity-ide':
    case 'antigravity-cli (agy)':
      return { stdout: JSON.stringify({ decision: 'continue', reason: `[ralph ${iteration}/${max}] ${reason}` }) };
    default:
      return { exitCode: 2, stderr: `[ralph ${iteration}/${max}] ${reason}` };
  }
}

// ── tradução de modelo catálogo → nome nativo do harness ─────────────────
const ANTHROPIC_ALIAS = { 'claude-opus-4-8': 'opus', 'claude-sonnet-4-6': 'sonnet', 'claude-haiku-4-5': 'haiku' };
export function toNativeModel(harness, model) {
  if (!model) return null;
  if (harness === 'claude-code') return ANTHROPIC_ALIAS[model] ?? model;
  if (harness === 'opencode') return model.startsWith('anthropic/') || model.includes('/') ? model : `anthropic/${model}`;
  if (harness === 'gemini-cli') return /^gemini-/.test(model) ? model : null; // só modelos Gemini; senão default
  return model; // codex/cursor/agy usam slugs próprios; agy falha alto se inválido (bom p/ CI)
}

// ── parsing de usage real da saída headless ──────────────────────────────
export function parseUsage(harness, raw) {
  if (!raw) return null;
  try {
    if (harness === 'antigravity-cli (agy)' || harness === 'antigravity-2.0' || harness === 'antigravity-ide') {
      const j = JSON.parse(raw);
      return j.usage ? { input: j.usage.input_tokens, output: j.usage.output_tokens, total: j.usage.total_tokens } : null;
    }
    if (harness === 'claude-code') {
      const j = JSON.parse(raw);
      const u = j.usage ?? {};
      return { input: u.input_tokens, output: u.output_tokens, total: (u.input_tokens ?? 0) + (u.output_tokens ?? 0), costUsd: j.total_cost_usd ?? j.cost_usd };
    }
    if (harness === 'codex') {
      const lines = raw.trim().split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const ev = JSON.parse(lines[i]);
          const u = ev?.msg?.usage ?? ev?.usage ?? ev?.payload?.info?.total_token_usage;
          if (u) return { input: u.input_tokens ?? u.input, output: u.output_tokens ?? u.output, total: u.total_tokens ?? ((u.input_tokens ?? 0) + (u.output_tokens ?? 0)) };
        } catch { /* linha não-JSON */ }
      }
      return null;
    }
    if (harness === 'gemini-cli') {
      const j = JSON.parse(raw);
      const s = j.stats ?? j.usage;
      return s ? { input: s.files?.total ?? s.input_tokens, output: s.output_tokens, total: s.total_tokens } : null;
    }
  } catch { /* saída não-JSON = texto */ }
  return null;
}

// ── erro do AGENTE (auth/modelo/CLI ausente) ≠ teste vermelho ────────────
export function isAgentError(harness, { exitCode, stdout, stderr }) {
  const out = `${stdout ?? ''}\n${stderr ?? ''}`;
  if (/authentication required|not logged in|invalid model|model .* not recognized|command not found/i.test(out)) return true;
  try {
    const j = JSON.parse(stdout);
    if (j.status === 'ERROR' || j.is_error === true || j.subtype === 'error_during_execution') return true;
  } catch { /* multi-linha/JSONL: checar campos soltos */ }
  if (/\"status\":\"ERROR\"|"is_error":\s*true/.test(out)) return true;
  return false;
}

export function runnerFor(harness) {
  const r = HEADLESS[harness];
  if (!r) throw new Error(`harness desconhecido: ${harness}`);
  return r;
}
