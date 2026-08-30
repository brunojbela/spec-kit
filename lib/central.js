import { loadCatalog } from './models.js';

// Matriz dificuldade → modelo (docs/07-flow-daytoday.md; fallback local enquanto central não fecha).
export const DIFFICULTY_MODEL = {
  trivial: 'claude-haiku-4-5',
  'fácil': 'claude-haiku-4-5',
  'médio': 'claude-sonnet-4-6',
  'difícil': 'claude-opus-4-8',
  'extremamente difícil': 'claude-opus-4-8',
};

// T31 — via de duas mãos com central-de-controle; fallback local determinístico.
export async function recommendModel({ difficulty, harness = 'any', centralUrl = process.env.SPEC_KIT_CENTRAL_URL, catalog } = {}) {
  if (!(difficulty in DIFFICULTY_MODEL)) throw new Error(`dificuldade inválida: ${difficulty}`);
  if (centralUrl) {
    try {
      const q = new URLSearchParams({ harness, difficulty });
      const res = await fetch(`${centralUrl.replace(/\/$/, '')}/models/recommend?${q}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data?.model) return { model: data.model, reason: data.reason ?? 'central', source: 'central', fallback: false };
      }
    } catch { /* cai no fallback */ }
  }
  const cat = catalog ?? loadCatalog();
  const pick = DIFFICULTY_MODEL[difficulty];
  const model = cat.find((m) => m.id === pick) ?? cat[0];
  return { model: model.id, reason: `fallback local: matriz dificuldade (07-flow) + catálogo models/catalog.json (sweBench ${model.sweBenchVerified})`, source: 'local', fallback: true };
}
