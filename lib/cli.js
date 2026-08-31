import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

export function buildProgram({ handlers } = {}) {
  const h = handlers ?? defaultHandlers();
  const program = new Command();
  program
    .name('spec-kit')
    .description('Spec-Driven Development Kit — SDD multi-harness com PO, squad especialista, governança e Ralph Loop.')
    .version(pkg.version, '-v, --version');

  program
    .command('init')
    .description('greenfield: PO entrevista -> docs + instancia squad local')
    .option('--dir <dir>', 'diretório do projeto', process.cwd())
    .option('--stack <stacks>', 'stacks separados por vírgula (ex: laravel,react) — omisso: pergunta')
    .option('--goal <texto>', 'objetivo do projeto em 1 linha — omisso: pergunta')
    .option('--harnesses <lista>', 'harnesses alvo separados por vírgula (omisso: pergunta interativa; --yes: todos)')
    .option('--yes', 'não interativo (usa defaults da entrevista)', false)
    .action(async (opts) => h.init(opts));

  program
    .command('analyze [repo]')
    .description('legado: verifica docs, doc-gen, entrevista, instancia squad')
    .option('--dir <dir>', 'diretório do repo', process.cwd())
    .option('--harnesses <lista>', 'harnesses alvo separados por vírgula (omisso: pergunta interativa; --yes: todos)')
    .action(async (repo, opts) => h.analyze({ repo, ...opts }));

  program
    .command('verify')
    .description('roda qa + security + grava ledger')
    .option('--dir <dir>', 'diretório do projeto', process.cwd())
    .action(async (opts) => h.verify(opts));

  program
    .command('init-projects')
    .description('mapeia a pasta de projects: nome, stack, SDD?, repo, sessions, overview')
    .option('--projects-dir <dir>', 'pasta raiz dos projetos', process.cwd())
    .option('--out <file>', 'arquivo de saída do registry')
    .action(async (opts) => h.initProjects(opts));

  program
    .command('update')
    .description('organismo vivo: reescreve instruções instaladas a partir da fonte (nunca toca dados do usuário)')
    .option('--dir <dir>', 'diretório do projeto', process.cwd())
    .option('--force', 'reescreve mesmo com versões iguais', false)
    .option('--check', 'só reporta se há atualização pendente', false)
    .option('--harnesses <lista>', 'sobrescreve os harnesses do stamp')
    .action(async (opts) => h.update(opts));

  const models = program.command('models').description('catálogo de modelos/benchmarks para o PO');
  models
    .command('refresh')
    .description('atualiza models/catalog.json (SWE-bench, preços, speed)')
    .option('--offline', 'mantém último catálogo válido (fallback)', false)
    .action(async (opts) => h.modelsRefresh(opts));

  return program;
}

function defaultHandlers() {
  const show = (fn) => async (opts) => {
    const r = await fn(opts);
    if (r !== undefined) console.log(JSON.stringify(r));
    return r;
  };
  return {
    init: show(async (opts) => (await import('./commands/init.js')).run(opts)),
    analyze: show(async (opts) => (await import('./commands/analyze.js')).run(opts)),
    verify: show(async (opts) => (await import('./commands/verify.js')).run(opts)),
    initProjects: show(async (opts) => (await import('./commands/init-projects.js')).run(opts)),
    update: show(async (opts) => (await import('./commands/update.js')).run(opts)),
    modelsRefresh: show(async (opts) => (await import('./commands/models-refresh.js')).run(opts)),
  };
}

export async function run(argv) {
  const program = buildProgram();
  try {
    await program.parseAsync(argv);
  } catch (err) {
    console.error(`spec-kit: ${err.message}`);
    process.exit(1);
  }
}
