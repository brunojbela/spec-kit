import { appendFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

// Contratos dos 4 events canônicos (docs/04-runtime.md)
export const EVENT_CONTRACTS = {
  'change.recorded': ['session_id', 'harness', 'task_id', 'developer', 'model'],
  'security.violation': ['item', 'severity', 'file'],
  'project.instantiated': ['stack', 'squad'],
  'session.started': ['session_id', 'harness', 'pid'],
};

const consumers = {
  'change.recorded': [],
  'security.violation': [],
  'project.instantiated': [],
  'session.started': [],
};

export function on(event, fn) {
  if (!consumers[event]) throw new Error(`event desconhecido: ${event}`);
  consumers[event].push(fn);
}

export function checkContract(event, payload) {
  const contract = EVENT_CONTRACTS[event];
  if (!contract) throw new Error(`event desconhecido: ${event}`);
  const missing = contract.filter((f) => payload[f] === undefined);
  if (missing.length) throw new Error(`${event}: payload sem campos obrigatórios: ${missing.join(', ')}`);
  return true;
}

export function emitEvent(dir, event, payload) {
  checkContract(event, payload);
  const record = { event, timestamp: new Date().toISOString(), ...payload };
  const logFile = join(dir, 'docs', 'EVENTS.jsonl');
  mkdirSync(dirname(logFile), { recursive: true });
  appendFileSync(logFile, JSON.stringify(record) + '\n');
  for (const fn of consumers[event]) fn(record);
  return record;
}

export function readEvents(dir) {
  const logFile = join(dir, 'docs', 'EVENTS.jsonl');
  if (!existsSync(logFile)) return [];
  return readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
