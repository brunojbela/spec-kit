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
    .option('--stack <stacks>', 'stacks separados por vírgula (ex: laravel,react)')
    .option('--yes', 'não interativo (usa defaults da entrevista)', false)
    .action(async (opts) => h.init(opts));

  program
    .command('analyze [repo]')
    .description('legado: verifica docs, doc-gen, entrevista, instancia squad')
    .option('--dir <dir>', 'diretório do repo', process.cwd())
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

  const models = program.command('models').description('catálogo de modelos/benchmarks para o PO');
  models
    .command('refresh')
    .description('atualiza models/catalog.json (SWE-bench, preços, speed)')
    .option('--offline', 'mantém último catálogo válido (fallback)', false)
    .action(async (opts) => h.modelsRefresh(opts));

  return program;
}

function defaultHandlers() {
  return {
    init: async (opts) => (await import('./commands/init.js')).run(opts),
    analyze: async (opts) => (await import('./commands/analyze.js')).run(opts),
    verify: async (opts) => (await import('./commands/verify.js')).run(opts),
    initProjects: async (opts) => (await import('./commands/init-projects.js')).run(opts),
    modelsRefresh: async (opts) => (await import('./commands/models-refresh.js')).run(opts),
  };
}

export async function run(argv) {
  const program = buildProgram();
  await program.parseAsync(argv);
}
