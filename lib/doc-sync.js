import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { validateOrThrow } from './schemas.js';

const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'vendor', '.opencode', '.claude', '.cursor', '.codex', '.agents', '.gemini', 'docs']);
const EXTS = { '.php': 'php', '.js': 'js', '.mjs': 'js', '.ts': 'ts', '.tsx': 'ts', '.jsx': 'js', '.py': 'py', '.vue': 'vue' };

const PATTERNS = {
  php: { class: /(?:abstract\s+)?(?:final\s+)?class\s+(\w+)/g, method: /(?:public|protected|private)?\s+function\s+(\w+)\s*\(/g },
  js: { class: /class\s+(\w+)/g, method: /(?:^|\s)(?:export\s+)?(?:async\s+)?function\s+(\w+)/gm },
  ts: { class: /class\s+(\w+)/g, method: /(?:^|\s)(?:export\s+)?(?:async\s+)?function\s+(\w+)/gm },
  py: { class: /class\s+(\w+)/g, method: /^\s*def\s+(\w+)/gm },
  vue: { class: null, method: /(?:function|const)\s+(\w+)\s*=?\s*(?:\([^)]*\)\s*=>|async|function)/g },
};

function walk(dir, base = dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, base, acc);
    else if (EXTS[entry.slice(entry.lastIndexOf('.'))]) acc.push({ file: relative(base, full), lang: EXTS[entry.slice(entry.lastIndexOf('.'))] });
  }
  return acc;
}

// T21 — Arqueólogo: varre o repo e preenche DOC_SYNC sem documentar nada.
export function scanProject(dir, project = dir.split('/').pop()) {
  const items = [];
  let n = 0;
  for (const { file, lang } of walk(dir)) {
    const content = readFileSync(join(dir, file), 'utf8');
    const pats = PATTERNS[lang];
    const classes = pats?.class ? [...content.matchAll(pats.class)].map((m) => m[1]) : [];
    const methods = pats?.method ? [...content.matchAll(pats.method)].map((m) => m[1]) : [];
    const mod = file.split('/')[0];
    if (classes.length || !methods.length) {
      items.push({ id: `d${++n}`, module: mod, file, class: classes[0] || null, kind: 'technical', status: 'pendente', imports: extractImports(content, lang) });
    }
    for (const m of methods) {
      items.push({ id: `d${++n}`, module: mod, file, class: classes[0] || null, method: m, kind: 'technical', status: 'pendente', requests: extractRequests(content) });
    }
  }
  const doc = { project, generatedAt: new Date().toISOString(), items };
  validateOrThrow('doc-sync', doc);
  return doc;
}

function extractImports(content, lang) {
  if (lang === 'php') return [...content.matchAll(/^use\s+([\w\\]+);/gm)].map((m) => m[1]);
  if (lang === 'py') return [...content.matchAll(/^from\s+([\w.]+)\s+import|^import\s+([\w.]+)/gm)].map((m) => m[1] || m[2]);
  return [...content.matchAll(/import\s+(?:[\w{},*\s]+\s+from\s+)?['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

function extractRequests(content) {
  return [...content.matchAll(/\$(?:get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/gi)].map((m) => m[1]);
}

export function writeDocSync(dir, doc) {
  validateOrThrow('doc-sync', doc);
  writeFileSync(join(dir, 'DOC_SYNC.json'), JSON.stringify(doc, null, 2) + '\n');
  return doc;
}

export function loadDocSync(dir) {
  return JSON.parse(readFileSync(join(dir, 'DOC_SYNC.json'), 'utf8'));
}

export function markDocumented(dir, itemId, docPath) {
  const doc = loadDocSync(dir);
  const item = doc.items.find((i) => i.id === itemId);
  if (!item) throw new Error(`item ${itemId} não existe no DOC_SYNC`);
  item.status = 'documentado';
  item.docPath = docPath;
  writeDocSync(dir, doc);
  return item;
}

// T23 — docs.sync: mantém manifest pós-alteração (novo→pendente, removido→retirado).
export function syncAfterChange(dir, changedFiles) {
  const doc = loadDocSync(dir);
  let added = 0;
  let removed = 0;
  const existingFiles = new Set(doc.items.map((i) => i.file).filter(Boolean));
  for (const file of changedFiles) {
    if (existsSync(join(dir, file)) && !existingFiles.has(file)) {
      const lang = EXTS[file.slice(file.lastIndexOf('.'))];
      if (!lang) continue;
      const content = readFileSync(join(dir, file), 'utf8');
      const pats = PATTERNS[lang];
      const classes = pats?.class ? [...content.matchAll(pats.class)].map((m) => m[1]) : [];
      doc.items.push({ id: `d${Date.now()}_${added}`, module: file.split('/')[0], file, class: classes[0] || null, kind: 'technical', status: 'pendente' });
      added++;
    } else if (!existsSync(join(dir, file))) {
      const before = doc.items.length;
      doc.items = doc.items.filter((i) => i.file !== file);
      removed += before - doc.items.length;
    }
  }
  doc.generatedAt = new Date().toISOString();
  writeDocSync(dir, doc);
  return { added, removed, total: doc.items.length };
}

export function coverage(dir) {
  const doc = loadDocSync(dir);
  const total = doc.items.length;
  const done = doc.items.filter((i) => i.status === 'documentado').length;
  return { total, documentado: done, pendente: total - done, pct: total ? Math.round((done / total) * 100) : 100 };
}
