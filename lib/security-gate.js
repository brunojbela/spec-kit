import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { recordViolations } from './governance.js';

// Checklist pentest reverso — 20 itens (nomes exatos: spec-kit.orchestration.json security.checklist)
export const CHECKLIST = [
  { item: 'SQL Injection', severity: 'crítica', re: /(mysql_query|pg_query|->whereRaw\(\s*["'`].*\$|SELECT .*\+\s*\$|f["'']SELECT.*\{)/i },
  { item: 'NoSQL Injection', severity: 'alta', re: /(\$\$?(ne|gt|where|regex)\b|\.find\(\s*\{\s*\$)/i },
  { item: 'XSS (refletido/armazenado/DOM)', severity: 'alta', re: /(dangerouslySetInnerHTML|\{\{?\s*\w+\s*\|\s*safe|\.innerHTML\s*=|v-html=)/i },
  { item: 'CSRF', severity: 'alta', re: /(verifyCsrf\s*\(\s*false|csrf_exempt|metodo\s+POST\s+sem\s+token)/i },
  { item: 'Command / OS injection', severity: 'crítica', re: /(exec\s*\(\s*["'`].*\$|system\s*\(\s*\$|shell_exec|child_process\.exec\(\s*[["'`].*\$\{|os\.system)/i },
  { item: 'Path traversal / LFI / RFI', severity: 'alta', re: /(require\s*\(\s*\$|include\s*\(\s*\$_(GET|POST)|\.\.\/\.\.\/|file_get_contents\(\s*\$_)/i },
  { item: 'File upload: MIMETYPE, allowlist extensão, tamanho, fora do webroot, nome aleatório', severity: 'alta', re: /(move_uploaded_file\(\s*\$_FILES\[[^\]]+\]\[["']name["']|upload.*\bwithout\b.*(allowlist|mime))/i },
  { item: 'Insecure deserialization', severity: 'crítica', re: /(unserialize\(\s*\$|pickle\.loads|yaml\.load\((?!.*Loader)|JSON\.parse\(req\.body.*eval)/i },
  { item: 'SSRF', severity: 'alta', re: /(requests\.(get|post)\(\s*(user|req|url)_?(input|param)|file_get_contents\(\s*\$url)/i },
  { item: 'XXE', severity: 'alta', re: /(DOMDocument|XMLReader|libxml_xml|simplexml_load_string)/i },
  { item: 'Broken authentication / sessão', severity: 'alta', re: /(session\.regenerate\s*\(\s*\)|md5\s*\(\s*password|password\s*==?\s*\$_POST|jwt\.decode\([^)]*verify\s*=\s*False)/i },
  { item: 'Sensitive data exposure (segredos em código/log)', severity: 'crítica', re: /(console\.log\s*\(\s*.*\b(password|token|secret)|error_log\s*\(.*\$(password|token))/i },
  { item: 'Security misconfiguration (headers, CORS, erros verbosos)', severity: 'média', re: /(header\s*\(\s*["']Access-Control-Allow-Origin["']\s*,|debug\s*=\s*True|app\.debug\s*=\s*True|display_errors\s*\(\s*1)/i },
  { item: 'Insecure dependencies (npm audit / composer audit)', severity: 'média', re: null, audit: true },
  { item: 'Rate limiting / brute force', severity: 'média', re: /(throttle\s*\(\s*\)|rate.?limit.*(disabled|off))/i },
  { item: 'IDOR', severity: 'alta', re: /(::find\(\s*\$[a-z]*(id|_id)\b|\.get\(\s*request\.params\[:id\]\s*\)\s*(?!\.and))/i },
  { item: 'Mass assignment', severity: 'alta', re: /(\.fillable\s*=\s*\[\s*["']\*["']|->fill\(\s*\$request->all\(\)|::create\(\s*\$request->all\(\))/i },
  { item: 'JWT / Token weaknesses', severity: 'alta', re: /(algorithms\s*=\s*\[\s*["']none["']|jwt\.encode\([^)]*algorithm\s*=\s*["']HS256["']\s*\)\s*#|secret\s*=\s*["'](secret|changeme|jwt)["'])/i },
  { item: 'Hardcoded credentials / API keys', severity: 'crítica', re: /((api_?key|password|secret|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["'])/i },
  { item: 'Open redirect / Clickjacking', severity: 'média', re: /(redirect\s*\(\s*(req|params|\$url)|X-Frame-Options["']?\s*[,:]\s*["']?(ALLOW|permit))/i },
];

export function scanContent(content, file = '<stdin>') {
  const violations = [];
  const lines = content.split('\n');
  for (const { item, severity, re } of CHECKLIST) {
    if (!re) continue;
    lines.forEach((line, i) => {
      const m = line.match(re);
      if (m) violations.push({ item, severity, file, line: i + 1, evidence: m[0].slice(0, 120), action: 'bloqueado' });
    });
  }
  return violations;
}

export function scanFiles(dir, files) {
  const all = [];
  for (const f of files) {
    const full = join(dir, f);
    if (!existsSync(full)) continue;
    all.push(...scanContent(readFileSync(full, 'utf8'), f));
  }
  return all;
}

// Gate bloqueante: retorna {blocked, violations}; registra SECURITY_LOG quando há violação.
export function gate({ dir, files, content, logDir = dir }) {
  const violations = content != null ? scanContent(content) : scanFiles(dir, files || []);
  if (violations.length) recordViolations(logDir, violations);
  return { blocked: violations.length > 0, violations };
}

// Supply-chain (skill pack-security): comandos de auditoria por stack.
export function auditCommands(stack = []) {
  const cmds = [];
  const s = stack.join(' ').toLowerCase();
  if (/(node|react|vue|angular|next|typescript|javascript)/.test(s)) cmds.push('npm audit --audit-level=high');
  if (s.includes('php') || s.includes('laravel')) cmds.push('composer audit');
  if (s.includes('python') || s.includes('django') || s.includes('fastapi')) cmds.push('pip-audit');
  return cmds;
}
