import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CHECKLIST, scanContent, scanFiles, gate, auditCommands } from '../lib/security-gate.js';

const tmp = () => mkdtempSync(join(tmpdir(), 'sec-'));

test('T29: checklist tem exatamente os 20 itens do spec', () => {
  const spec = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'spec-kit.orchestration.json'), 'utf8'));
  assert.equal(CHECKLIST.length, 20);
  assert.deepEqual(CHECKLIST.map((c) => c.item), spec.security.checklist.items);
});

// 1 fixture vulnerável por categoria com detector (exceto deps, via audit commands)
const FIXTURES = {
  'SQL Injection': "<?php $q = mysql_query('SELECT * FROM t WHERE id=' . \$id);",
  'NoSQL Injection': "db.collection.find({ $where: 'x' })",
  'XSS (refletido/armazenado/DOM)': 'const c = <div dangerouslySetInnerHTML={{__html: u}} />;',
  CSRF: 'verifyCsrf(false)',
  'Command / OS injection': "exec('rm -rf ' . $dir)",
  'Path traversal / LFI / RFI': "<?php include($_GET['page']);",
  'File upload: MIMETYPE, allowlist extensão, tamanho, fora do webroot, nome aleatório': 'move_uploaded_file($_FILES["f"]["name"], "/var/www/uploads/" . $name);',
  'Insecure deserialization': '$o = unserialize($_POST["payload"]);',
  SSRF: "$url = $_GET['target']; file_get_contents($url);",
  XXE: '$d = new DOMDocument(); $d->loadXML($body);',
  'Broken authentication / sessão': "<?php if (md5(password) == \\$_POST['h']) login();",
  'Sensitive data exposure (segredos em código/log)': 'console.log("login com " + user.password);',
  'Security misconfiguration (headers, CORS, erros verbosos)': "<?php header('Access-Control-Allow-Origin', '*');",
  'Rate limiting / brute force': 'throttle() { disabled = true } // rate limit disabled',
  IDOR: '<?php $u = User::find($id); ?>',
  'Mass assignment': '<?php $u = User::create($request->all()); ?>',
  'JWT / Token weaknesses': 'jwt.decode(token, key, algorithms=["none"])',
  'Hardcoded credentials / API keys': 'const apiKey = "zzfixture9f3ab71c2d8e4a5b6c7d8e9f";',
  'Open redirect / Clickjacking': "return redirect(params['to']);",
};

test('T29: cada categoria do checklist bloqueia fixture vulnerável', () => {
  for (const [item, code] of Object.entries(FIXTURES)) {
    const hits = scanContent(code, 'fixture.php');
    assert.ok(hits.some((h) => h.item === item), `detector não pegou: ${item}`);
  }
});

test('T29: fixtures limpas não geram falso positivo nas categorias cobertas', () => {
  const clean = "<?php\nclass OrderService {\n  public function total(int $id): float { return 42.0; }\n}";
  const hits = scanContent(clean, 'clean.php');
  assert.deepEqual(hits, []);
});

test('T29: gate bloqueia commit XSS/SQLi e registra SECURITY_LOG espelhado', () => {
  const dir = tmp();
  mkdirSync(join(dir, 'docs'), { recursive: true });
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src/a.php'), "<?php echo \\$_GET['x']; el.innerHTML = data;");
  const res = gate({ dir, files: ['src/a.php'], logDir: join(dir, 'docs') });
  assert.equal(res.blocked, true);
  const log = JSON.parse(readFileSync(join(dir, 'docs/SECURITY_LOG.json'), 'utf8'));
  assert.ok(log.violations.length >= 1);
  assert.ok(readFileSync(join(dir, 'docs/SECURITY_LOG.md'), 'utf8').includes(log.violations[0].item));
});

test('T29: supply-chain — auditCommands por stack', () => {
  assert.ok(auditCommands(['laravel']).some((c) => c.startsWith('composer')));
  assert.ok(auditCommands(['react']).some((c) => c.startsWith('npm')));
  assert.ok(auditCommands(['python']).some((c) => c.startsWith('pip')));
});
