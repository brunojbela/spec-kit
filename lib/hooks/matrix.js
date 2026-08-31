// Matriz 7 hooks × 8 harnesses = 56 mapeamentos (fonte: docs/04-runtime.md).
export const HOOK_IDS = [
  'session.classify',
  'session.personal-interview',
  'interaction.inject-orchestration',
  'security-gate',
  'ledger-record',
  'docs-check',
  'docs.sync',
];

export const HOOK_TRIGGERS = {
  'session.classify': 'início de TODA session',
  'session.personal-interview': 'first-run (condição isFirstRun no SessionStart)',
  'interaction.inject-orchestration': 'toda interação a partir da 2ª',
  'security-gate': 'antes de tool/commit (bloqueante)',
  'ledger-record': 'pós-alteração',
  'docs-check': 'pré-ship',
  'docs.sync': 'pós-alteração / pré-ship',
};

const NATIVE = {
  'claude-code': {
    'session.classify': 'SessionStart',
    'session.personal-interview': 'SessionStart (isFirstRun)',
    'interaction.inject-orchestration': 'UserPromptSubmit',
    'security-gate': 'PreToolUse (matcher Bash|Write|Edit, decision block)',
    'ledger-record': 'PostToolUse + FileChanged',
    'docs-check': 'Stop (decision block+reason → continue in-chat) / PreCompact',
    'docs.sync': 'PostToolUse + Stop',
  },
  cursor: {
    'session.classify': 'sessionStart',
    'session.personal-interview': 'sessionStart (isFirstRun)',
    'interaction.inject-orchestration': 'beforeSubmitPrompt',
    'security-gate': 'preToolUse + beforeShellExecution',
    'ledger-record': 'postToolUse + afterFileEdit + afterShellExecution',
    'docs-check': 'stop (followup_message + loop_limit default 5)',
    'docs.sync': 'afterFileEdit',
  },
  opencode: {
    'session.classify': 'session.created (plugin)',
    'session.personal-interview': 'session.created (isFirstRun)',
    'interaction.inject-orchestration': 'tool.before.* (plugin)',
    'security-gate': 'tool.before.bash/write (exit 2)',
    'ledger-record': 'file.edited + tool.execute.after',
    'docs-check': 'session.idle',
    'docs.sync': 'file.edited',
  },
  codex: {
    'session.classify': 'SessionStart',
    'session.personal-interview': 'SessionStart (isFirstRun)',
    'interaction.inject-orchestration': 'UserPromptSubmit',
    'security-gate': 'PreToolUse',
    'ledger-record': 'PostToolUse',
    'docs-check': 'Stop',
    'docs.sync': 'PostToolUse',
  },
  'gemini-cli': {
    'session.classify': 'SessionStart (source startup|resume|clear)',
    'session.personal-interview': 'SessionStart (isFirstRun)',
    'interaction.inject-orchestration': 'BeforeAgent (additionalContext)',
    'security-gate': 'BeforeTool',
    'ledger-record': 'AfterTool',
    'docs-check': 'AfterAgent (deny+reason → retry)',
    'docs.sync': 'AfterTool',
  },
  'antigravity-cli (agy)': {
    'session.classify': 'SessionStart',
    'session.personal-interview': 'SessionStart (isFirstRun)',
    'interaction.inject-orchestration': 'PreToolUse+PostToolUse chain',
    'security-gate': 'PreToolUse',
    'ledger-record': 'PostToolUse',
    'docs-check': 'Stop',
    'docs.sync': 'PostToolUse',
  },
  'antigravity-2.0': {
    'session.classify': 'SessionStart',
    'session.personal-interview': 'SessionStart (isFirstRun)',
    'interaction.inject-orchestration': 'PreToolUse+PostToolUse chain',
    'security-gate': 'PreToolUse',
    'ledger-record': 'PostToolUse',
    'docs-check': 'Stop',
    'docs.sync': 'PostToolUse',
  },
  'antigravity-ide': {
    'session.classify': 'SessionStart',
    'session.personal-interview': 'SessionStart (isFirstRun)',
    'interaction.inject-orchestration': 'PreToolUse+PostToolUse chain',
    'security-gate': 'PreToolUse',
    'ledger-record': 'PostToolUse',
    'docs-check': 'Stop',
    'docs.sync': 'PostToolUse',
  },
};

export const HARNESS_HOOKS = NATIVE;

// Estrutura programática p/ adapters: {hook, event, matcher?}
export const HOOK_EVENTS = {
  'claude-code': [
    { hook: 'session.classify', event: 'SessionStart' },
    { hook: 'session.personal-interview', event: 'SessionStart' },
    { hook: 'interaction.inject-orchestration', event: 'UserPromptSubmit' },
    { hook: 'security-gate', event: 'PreToolUse', matcher: 'Bash|Write|Edit' },
    { hook: 'ledger-record', event: 'PostToolUse' },
    { hook: 'docs-check', event: 'Stop' },
    { hook: 'docs.sync', event: 'PostToolUse' },
  ],
  cursor: [
    { hook: 'session.classify', event: 'sessionStart' },
    { hook: 'session.personal-interview', event: 'sessionStart' },
    { hook: 'interaction.inject-orchestration', event: 'beforeSubmitPrompt' },
    { hook: 'security-gate', event: 'preToolUse', matcher: 'Write|Edit|Shell' },
    { hook: 'ledger-record', event: 'postToolUse' },
    { hook: 'docs-check', event: 'stop' },
    { hook: 'docs.sync', event: 'afterFileEdit' },
  ],
  opencode: [
    { hook: 'session.classify', event: 'session.created' },
    { hook: 'session.personal-interview', event: 'session.created' },
    { hook: 'interaction.inject-orchestration', event: 'tool.execute.before' },
    { hook: 'security-gate', event: 'tool.execute.before' },
    { hook: 'ledger-record', event: 'file.edited' },
    { hook: 'docs-check', event: 'session.idle' },
    { hook: 'docs.sync', event: 'file.edited' },
  ],
  codex: [
    { hook: 'session.classify', event: 'SessionStart' },
    { hook: 'session.personal-interview', event: 'SessionStart' },
    { hook: 'interaction.inject-orchestration', event: 'UserPromptSubmit' },
    { hook: 'security-gate', event: 'PreToolUse' },
    { hook: 'ledger-record', event: 'PostToolUse' },
    { hook: 'docs-check', event: 'Stop' },
    { hook: 'docs.sync', event: 'PostToolUse' },
  ],
  'gemini-cli': [
    { hook: 'session.classify', event: 'SessionStart' },
    { hook: 'session.personal-interview', event: 'SessionStart' },
    { hook: 'interaction.inject-orchestration', event: 'BeforeAgent' },
    { hook: 'security-gate', event: 'BeforeTool' },
    { hook: 'ledger-record', event: 'AfterTool' },
    { hook: 'docs-check', event: 'AfterAgent' },
    { hook: 'docs.sync', event: 'AfterTool' },
  ],
  'antigravity-cli (agy)': [
    { hook: 'session.classify', event: 'SessionStart' },
    { hook: 'session.personal-interview', event: 'SessionStart' },
    { hook: 'interaction.inject-orchestration', event: 'PostToolUse' },
    { hook: 'security-gate', event: 'PreToolUse' },
    { hook: 'ledger-record', event: 'PostToolUse' },
    { hook: 'docs-check', event: 'Stop' },
    { hook: 'docs.sync', event: 'PostToolUse' },
  ],
  // 2.0/ide documentam PreInvocation/PostInvocation com injectSteps (antigravity.google/docs/hooks)
  'antigravity-2.0': [
    { hook: 'session.classify', event: 'PreInvocation' },
    { hook: 'session.personal-interview', event: 'PreInvocation' },
    { hook: 'interaction.inject-orchestration', event: 'PreInvocation' },
    { hook: 'security-gate', event: 'PreToolUse' },
    { hook: 'ledger-record', event: 'PostToolUse' },
    { hook: 'docs-check', event: 'Stop' },
    { hook: 'docs.sync', event: 'PostToolUse' },
  ],
};
HOOK_EVENTS['antigravity-ide'] = HOOK_EVENTS['antigravity-2.0'];

export function nativeEvent(harness, hookId) {
  const m = NATIVE[harness]?.[hookId];
  if (!m) throw new Error(`sem mapeamento: ${hookId} × ${harness}`);
  return m;
}

export function matrixSize() {
  let n = 0;
  for (const h of HOOK_IDS) for (const harness of Object.keys(NATIVE)) { nativeEvent(harness, h); n++; }
  return n;
}
